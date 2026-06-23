-- ─────────────────────────────────────────────────────────────────────────
-- iGRYT Event Timer — initial schema
--
-- Mirrors the original localStorage collections (events, athletes, finishes,
-- results) and adds the constraints localStorage could never enforce:
--   * event-scoped athlete session uniqueness
--   * one result per (event, athlete) via a unique index
--   * cascading deletes from events down to children
-- The assign_finisher RPC makes the most sensitive race-day mutation atomic.
-- ─────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── events ─────────────────────────────────────────────────────────────────
create table if not exists public.events (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid references auth.users(id) on delete set null,
  slug           text not null unique,
  event_code     text,
  name           text not null,
  date           text,
  start_time     text,
  location       text,
  challenge_type text not null default 'Run',
  scoring_method text not null default 'Fastest Time',
  timing_mode    text not null default 'Hybrid',
  distance_target text,
  instructions   text,
  is_public      boolean not null default true,
  status         text not null default 'open',
  started_at     timestamptz,
  finished_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists events_owner_idx on public.events(owner_id);
create index if not exists events_public_idx on public.events(is_public);

-- ── athletes ───────────────────────────────────────────────────────────────
create table if not exists public.athletes (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events(id) on delete cascade,
  session_token text,
  name          text not null default 'Athlete',
  team          text,
  bib           text,
  status        text not null default 'registered',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists athletes_event_idx on public.athletes(event_id);

-- One athlete row per (event, session_token) so a refresh/rejoin from the same
-- device cannot create duplicate identities.
create unique index if not exists athletes_event_session_uniq
  on public.athletes(event_id, session_token)
  where session_token is not null;

-- ── finishes (raw finish queue) ──────────────────────────────────────────────
create table if not exists public.finishes (
  id                  uuid primary key default gen_random_uuid(),
  event_id            uuid not null references public.events(id) on delete cascade,
  timestamp_ms        integer not null,
  assigned_athlete_id uuid references public.athletes(id) on delete set null,
  created_by          uuid,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists finishes_event_idx on public.finishes(event_id);

-- ── results ──────────────────────────────────────────────────────────────────
create table if not exists public.results (
  id                  uuid primary key default gen_random_uuid(),
  event_id            uuid not null references public.events(id) on delete cascade,
  athlete_id          uuid references public.athletes(id) on delete set null,
  athlete_name        text not null default 'Athlete',
  team                text,
  final_time_seconds  numeric,
  distance_meters     numeric,
  reps                integer,
  rounds              integer,
  score               numeric,
  rpe                 numeric,
  notes               text,
  splits              jsonb not null default '[]'::jsonb,
  status              text not null default 'finished',
  source              text not null default 'manual',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists results_event_idx on public.results(event_id);

-- At most one result per athlete per event. This replaces the old client-side
-- "replace prior result for this athlete" logic with a real DB guarantee and is
-- the conflict target for upserts.
create unique index if not exists results_event_athlete_uniq
  on public.results(event_id, athlete_id)
  where athlete_id is not null;

-- ── updated_at maintenance ───────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['events','athletes','finishes','results'] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s', t);
    execute format(
      'create trigger touch_%1$s before update on public.%1$s
       for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- assign_finisher RPC
--
-- Atomically assigns a raw finish to an athlete and upserts that athlete's
-- official result. Keeping this server-side prevents the multi-step client race
-- where a finish could be marked assigned without a matching result row.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.assign_finisher(
  p_finish_id  uuid,
  p_athlete_id uuid
)
returns public.results
language plpgsql
security definer
set search_path = public
as $$
declare
  v_finish   public.finishes%rowtype;
  v_athlete  public.athletes%rowtype;
  v_result   public.results%rowtype;
begin
  select * into v_finish from public.finishes where id = p_finish_id;
  if not found then
    raise exception 'finish % not found', p_finish_id;
  end if;

  select * into v_athlete from public.athletes where id = p_athlete_id;
  if not found then
    raise exception 'athlete % not found', p_athlete_id;
  end if;

  if v_athlete.event_id <> v_finish.event_id then
    raise exception 'athlete % does not belong to event %', p_athlete_id, v_finish.event_id;
  end if;

  update public.finishes
     set assigned_athlete_id = p_athlete_id
   where id = p_finish_id;

  insert into public.results
    (event_id, athlete_id, athlete_name, team, final_time_seconds, status, source)
  values
    (v_finish.event_id, p_athlete_id, v_athlete.name, v_athlete.team,
     v_finish.timestamp_ms::numeric / 1000.0, 'finished', 'director_timed')
  on conflict (event_id, athlete_id) where athlete_id is not null
  do update set
    final_time_seconds = excluded.final_time_seconds,
    source             = 'director_timed',
    status             = 'finished',
    athlete_name       = excluded.athlete_name,
    team               = excluded.team
  returning * into v_result;

  update public.athletes set status = 'finished' where id = p_athlete_id;

  return v_result;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security
--
-- Public read for public events and their children; organizer (owner) full
-- control of owned events; anonymous athletes may self-join and self-time on
-- public/live events but cannot mutate event/clock state.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.events   enable row level security;
alter table public.athletes enable row level security;
alter table public.finishes enable row level security;
alter table public.results  enable row level security;

-- helper: is the current user the owner of an event?
create or replace function public.is_event_owner(p_event_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.events e
     where e.id = p_event_id and e.owner_id = auth.uid()
  );
$$;

-- helper: is an event publicly visible?
create or replace function public.is_event_public(p_event_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.events e
     where e.id = p_event_id and e.is_public = true
  );
$$;

-- events
drop policy if exists events_select on public.events;
create policy events_select on public.events
  for select using (is_public = true or owner_id = auth.uid());

drop policy if exists events_insert on public.events;
create policy events_insert on public.events
  for insert with check (owner_id = auth.uid());

drop policy if exists events_update on public.events;
create policy events_update on public.events
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists events_delete on public.events;
create policy events_delete on public.events
  for delete using (owner_id = auth.uid());

-- athletes
drop policy if exists athletes_select on public.athletes;
create policy athletes_select on public.athletes
  for select using (is_event_public(event_id) or is_event_owner(event_id));

drop policy if exists athletes_insert on public.athletes;
create policy athletes_insert on public.athletes
  for insert with check (is_event_public(event_id) or is_event_owner(event_id));

drop policy if exists athletes_update on public.athletes;
create policy athletes_update on public.athletes
  for update using (is_event_owner(event_id)) with check (is_event_owner(event_id));

drop policy if exists athletes_delete on public.athletes;
create policy athletes_delete on public.athletes
  for delete using (is_event_owner(event_id));

-- finishes — organizer only (the timing station is an organizer surface)
drop policy if exists finishes_select on public.finishes;
create policy finishes_select on public.finishes
  for select using (is_event_owner(event_id));

drop policy if exists finishes_all on public.finishes;
create policy finishes_all on public.finishes
  for all using (is_event_owner(event_id)) with check (is_event_owner(event_id));

-- results — public read, organizer write, plus athlete self-timed inserts
drop policy if exists results_select on public.results;
create policy results_select on public.results
  for select using (is_event_public(event_id) or is_event_owner(event_id));

drop policy if exists results_insert on public.results;
create policy results_insert on public.results
  for insert with check (is_event_public(event_id) or is_event_owner(event_id));

drop policy if exists results_update on public.results;
create policy results_update on public.results
  for update using (is_event_owner(event_id)) with check (is_event_owner(event_id));

drop policy if exists results_delete on public.results;
create policy results_delete on public.results
  for delete using (is_event_owner(event_id));

-- ── Realtime publication ─────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.athletes;
alter publication supabase_realtime add table public.finishes;
alter publication supabase_realtime add table public.results;
