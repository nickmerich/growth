-- ─────────────────────────────────────────────────────────────────────────
-- iGRYT Event Timer — sample seed data (Pittsburgh-themed) for a fresh project.
-- Mirrors the original localStorage seed so a hosted demo looks alive on first
-- load. Owner_id is left null (public events); attach an owner in the dashboard.
-- ─────────────────────────────────────────────────────────────────────────
do $$
declare
  v_5k     uuid;
  v_amrap  uuid;
  v_ath    uuid;
  v_names  text[] := array['Nick M.','Laura M.','Marcus J.','Alex R.','Jamie T.','Casey P.',
                           'Jordan W.','Taylor B.','Sam K.','Morgan L.','Chris D.','Riley F.'];
  v_teams  text[] := array['North Shore','South Hills','Strip District','Parents Crew'];
  v_times  int[]  := array[1083,1142,1215,1290,1356,1428,1502,1575,1660,1742,1828,1915];
  v_rounds int[]  := array[9,8,7,6,5,4];
  i int;
begin
  if exists (select 1 from public.events where slug = 'saturday-gryt-5k') then
    return;
  end if;

  insert into public.events (slug, event_code, name, date, start_time, location,
    challenge_type, scoring_method, timing_mode, distance_target, instructions,
    is_public, status)
  values ('saturday-gryt-5k','GRYT5K','Saturday GRYT 5K','2026-05-30','08:00',
    'North Shore Trail, Pittsburgh','Run','Fastest Time','Hybrid','5K',
    'Out-and-back along the river. Stay right, pass left.', true, 'finished')
  returning id into v_5k;

  for i in 1..array_length(v_names,1) loop
    insert into public.athletes (event_id, name, team, status)
    values (v_5k, v_names[i], v_teams[((i-1) % 4) + 1], 'finished')
    returning id into v_ath;
    insert into public.results (event_id, athlete_id, athlete_name, team,
      final_time_seconds, distance_meters, source, status)
    values (v_5k, v_ath, v_names[i], v_teams[((i-1) % 4) + 1], v_times[i], 5000,
      case when i % 3 = 1 then 'self_timed' else 'director_timed' end, 'finished');
  end loop;

  insert into public.events (slug, event_code, name, date, start_time, location,
    challenge_type, scoring_method, timing_mode, distance_target, instructions,
    is_public, status)
  values ('wednesday-amrap-challenge','GRYTAM','Wednesday AMRAP Challenge','2026-06-03','18:30',
    'GRYT Garage Gym, Strip District','AMRAP','Most Rounds','Director-Timed','20 min cap',
    '20-min AMRAP: 10 air squats, 8 push-ups, 6 burpees.', true, 'open')
  returning id into v_amrap;

  for i in 1..8 loop
    insert into public.athletes (event_id, name, team, status)
    values (v_amrap, v_names[i], v_teams[((i-1) % 4) + 1],
            case when i <= 6 then 'finished' else 'registered' end)
    returning id into v_ath;
    if i <= array_length(v_rounds,1) then
      insert into public.results (event_id, athlete_id, athlete_name, team,
        rounds, reps, source, status)
      values (v_amrap, v_ath, v_names[i], v_teams[((i-1) % 4) + 1],
        v_rounds[i], v_rounds[i] * 24, 'director_timed', 'finished');
    end if;
  end loop;
end $$;
