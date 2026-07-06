# iGRYT Event Timer — Lovable Build Spec

This is the handoff spec for rebuilding the iGRYT Event Timer on Lovable
(TypeScript + Tailwind + shadcn/ui + Supabase). This repo is the **reference
implementation**: the data model, ranking logic, Finish Queue flow, and
drift-free clock below were validated here first. Where this spec and
intuition disagree, follow the spec.

The single biggest change from the original prototype: **persistence is
Supabase (Postgres + Realtime), not localStorage**, so the organizer's iPad,
each athlete's phone, and the TV scoreboard all see the same live data.

---

## 1. Initial project prompt (use as `create_project` initial_message)

> Build **iGRYT Event Timer** — a race-day operating system for GRYT Club, a
> fitness community whose motto is "DO HARD THINGS TOGETHER."
>
> An organizer creates a timed event (run, WOD, AMRAP…), athletes join by
> scanning a QR code (no login), the organizer times the race from a
> **Director Timing Station**, results feed a **live TV scoreboard**, and
> every finisher gets a shareable branded **PROOF OF GRYT** stat card.
>
> **Persistence: Supabase (Postgres) with Realtime enabled on every table.**
> Do NOT use localStorage for app data. Athletes join anonymously (no auth);
> organizer screens are open links for the MVP.
>
> Brand: dark, bold, athletic. Near-black backgrounds, high-contrast white
> type, a single hot accent (GRYT orange/red), big condensed uppercase
> headlines, tabular numerals for times. TV scoreboard must be readable from
> across a gym.
>
> Routes:
> - `/` landing
> - `/admin` organizer dashboard (list + create events)
> - `/admin/event/:slug` manage roster, results, QR code, share links
> - `/admin/time/:slug` Director Timing Station
> - `/event/:slug` public athlete join page (QR target)
> - `/timer/:slug` athlete self-timer
> - `/scoreboard/:slug` live TV/projector scoreboard
> - `/result/:id` result page + PROOF OF GRYT card
>
> Seed Pittsburgh-themed demo data (2 events, 12 athletes with results) so
> the app looks alive immediately.

## 2. Database schema (Supabase migration)

UUID primary keys. Epoch-milliseconds `bigint` for `started_at` /
`created_at` — this preserves the drift-free clock math
(`Date.now() - started_at`) with zero conversion.

```sql
create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  event_code text not null,           -- 6 chars from ABCDEFGHJKLMNPQRSTUVWXYZ23456789
  date text default '',
  start_time text default '',
  location text default '',
  challenge_type text default 'Run',
  scoring_method text default 'Fastest Time',
    -- 'Fastest Time' | 'Most Reps' | 'Most Rounds' | 'Longest Distance' | 'Custom Points'
  timing_mode text default 'Hybrid',  -- 'Director' | 'Self' | 'Hybrid'
  distance_target text default '',
  instructions text default '',
  is_public boolean default true,
  status text default 'open',         -- 'open' | 'live' | 'finished'
  started_at bigint,                  -- epoch ms when gun fired; null until start
  created_at bigint not null
);

create table athletes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  team text default '',
  status text default 'registered',   -- 'registered' | 'started' | 'finished' | 'dnf'
  created_at bigint not null
);

create table finish_queue (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  timestamp_ms bigint not null,       -- elapsed ms from the gun (NOT epoch)
  assigned_athlete_id uuid references athletes(id),
  created_at bigint not null
);

create table results (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  athlete_id uuid references athletes(id),
  athlete_name text not null,
  team text default '',
  final_time_seconds numeric,
  distance_meters numeric,
  reps integer,
  rounds integer,
  score numeric,
  rpe integer,
  notes text default '',
  splits jsonb default '[]',
  status text default 'finished',     -- 'finished' | 'dnf'
  source text default 'manual',       -- 'self_timed' | 'director_timed' | 'manual'
  created_at bigint not null,
  updated_at bigint not null
);
```

- **Realtime**: enable on all four tables (`events`, `athletes`,
  `finish_queue`, `results`).
- **RLS (MVP)**: public read + public insert/update on all tables —
  anonymous, no login. Known tradeoff: anyone with the link can write.
  Harden later by gating writes behind `event_code` (see this repo's
  PR #3 / `supabase/migrations/0001_init.sql` on the `supabase-migration`
  branch for a fully hardened reference: owner RLS, `assign_finisher` and
  `submit_self_result` SECURITY DEFINER RPCs, `replica identity full`).

## 3. Core logic to port exactly (from `src/lib/storage.js` + `src/lib/format.js`)

**Ranking** (`calculateRankings`): DNFs are excluded from ranking and
appended at the end with `rank: null`. Sort ascending only for
`'Fastest Time'` (missing time = `Infinity`); all other methods sort
descending with missing metric = `0`. Metric per method: reps / rounds /
distance_meters / score / final_time_seconds.

**Result upsert** (`saveResult`): one result per (event, athlete) —
assigning a finish to an athlete who already has a result replaces it
(same row id), never duplicates. Saving a result flips the athlete's
status to `finished` (or `dnf`).

**Finish assignment** (`assignFinisherToAthlete`): sets
`finish_queue.assigned_athlete_id`, marks the athlete `finished`, and
upserts a result with `final_time_seconds = timestamp_ms / 1000` and
`source = 'director_timed'`.

**Formatting helpers** — port verbatim from `src/lib/format.js`:
- `formatTime(seconds)` → `MM:SS` or `H:MM:SS`
- `formatClock(ms)` → `MM:SS.CS` centiseconds for the live race clock
- `formatMetric(result, {units, upper})` → time first, else rounds/reps/km/pts
- `formatPace(seconds, meters)` → `M:SS/km`
- `parseDistanceMeters('5K' | '3.1mi' | '1600m')` → meters (bare number = km)
- `parseTimeToSeconds('MM:SS' | 'H:MM:SS' | secs)`
- `slugify`, `makeEventCode` (6 chars, no 0/O/1/I), unique-slug suffixing (`-2`, `-3`, …)

**Drift-free clock**: the master clock is always rendered from
`Date.now() - event.started_at` on a ~60fps `requestAnimationFrame` loop —
never from an accumulating `setInterval` counter. This keeps every device's
clock accurate over 30+ minute events and in perfect agreement.

## 4. Critical screens

**Director Timing Station** (`/admin/time/:slug`) — the make-or-break screen:
- Giant master clock (formatClock), anchored to absolute `started_at`.
- 3-2-1-GO start countdown with audio beeps; gun sets
  `status='live', started_at=Date.now()`.
- Full-width, zero-debounce **RECORD FINISHER** button: every tap inserts a
  `finish_queue` row with `timestamp_ms = Date.now() - started_at`. Optimize
  for rapid pack finishes — tap flash + haptics, never block on network
  (optimistic insert with visible retry on failure).
- **Finish Queue** panel: unassigned timestamps listed in order; tap one,
  then tap an athlete to assign. Assigned entries show the athlete.
- Manual result entry, DNF marking, Screen Wake Lock while live.

**Live scoreboard** (`/scoreboard/:slug`):
- Supabase Realtime subscription on `results`/`athletes` for the event;
  re-rank on every change (refetch-on-change keeps ranking authoritative).
- Rank column with gold/silver/bronze medal styling, glow-in animation for
  new finishers, auto-scroll when the list overflows, fullscreen toggle,
  GRYT branding, live race clock while `status='live'`.

**PROOF OF GRYT card** (`/result/:id`):
- Branded stat card: athlete name, event, time/metric, rank, pace when
  distance is known, date. Variants: finisher / leaderboard / PR / podium.
- PNG export (html2canvas or equivalent) + share text.

**Athlete join** (`/event/:slug`): name + optional team, joins in under 30
seconds from a QR scan; QR code is generated on the admin event page.

## 5. Refinement prompts (send after the first build)

1. *Director Timing Station polish*: "Make the timing station bulletproof
   for race day: tap targets ≥ 96px, RECORD FINISHER responds instantly with
   flash + haptic even offline, finish queue assignment is two taps max,
   wake lock verified, countdown audio works on iOS Safari after first
   interaction."
2. *Broadcast-quality scoreboard*: "Make /scoreboard/:slug look like a
   stadium broadcast: huge tabular numerals, medal rows for top 3, subtle
   glow-in when a new finisher lands, auto-scroll loop for long fields,
   zero layout shift, perfect at 1080p fullscreen."

## 6. Acceptance test (multi-device)

1. Device A (laptop): `/admin` → create event → QR + scoreboard link.
2. Device B (phone): scan QR → join in <30s → appears on Device A's roster
   within ~1s (Realtime).
3. Device A: start race, rapid-tap RECORD FINISHER for a pack, assign names.
4. Device C (TV): `/scoreboard/:slug` updates live as finishers are assigned.
5. Each finisher's `/result/:id` renders and exports a PROOF OF GRYT PNG.
