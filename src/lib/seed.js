// Seeds the localStorage backend with Pittsburgh-themed sample data so the app
// looks alive on first render in credential-free demos. When Supabase is
// configured this is a no-op — use supabase/seed.sql instead.
import { isSupabaseConfigured } from './supabase.js';
import { createEvent, registerAthlete, saveResult } from './backends/local.js';

const SEED_FLAG = 'igryt.seeded.v1';

const TEAMS = ['North Shore', 'South Hills', 'Strip District', 'Parents Crew'];

const NAMES = [
  'Nick M.', 'Laura M.', 'Marcus J.', 'Alex R.', 'Jamie T.', 'Casey P.',
  'Jordan W.', 'Taylor B.', 'Sam K.', 'Morgan L.', 'Chris D.', 'Riley F.',
];

export async function ensureSeeded() {
  if (typeof window === 'undefined') return;
  if (isSupabaseConfigured) return;
  if (localStorage.getItem(SEED_FLAG)) return;
  // Don't clobber real data the user may have created.
  if (JSON.parse(localStorage.getItem('igryt.events') || '[]').length > 0) {
    localStorage.setItem(SEED_FLAG, '1');
    return;
  }

  // ── Event 1: Saturday GRYT 5K (run, fastest time, finished) ──────────────
  const fiveK = await createEvent({
    name: 'Saturday GRYT 5K',
    slug: 'saturday-gryt-5k',
    date: '2026-05-30',
    start_time: '08:00',
    location: 'North Shore Trail, Pittsburgh',
    challenge_type: 'Run',
    scoring_method: 'Fastest Time',
    timing_mode: 'Hybrid',
    distance_target: '5K',
    instructions: 'Out-and-back along the river. Stay right, pass left.',
    is_public: true,
    status: 'finished',
  });

  const fiveKTimes = [1083, 1142, 1215, 1290, 1356, 1428, 1502, 1575, 1660, 1742, 1828, 1915];
  for (let i = 0; i < NAMES.length; i += 1) {
    const team = TEAMS[i % TEAMS.length];
    const athlete = await registerAthlete(fiveK.id, { name: NAMES[i], team });
    await saveResult({
      event_id: fiveK.id,
      athlete_id: athlete.id,
      athlete_name: NAMES[i],
      team,
      final_time_seconds: fiveKTimes[i],
      distance_meters: 5000,
      source: i % 3 === 0 ? 'self_timed' : 'director_timed',
      status: 'finished',
    });
  }

  // ── Event 2: Wednesday AMRAP Challenge (most rounds, open) ────────────────
  const amrap = await createEvent({
    name: 'Wednesday AMRAP Challenge',
    slug: 'wednesday-amrap-challenge',
    date: '2026-06-03',
    start_time: '18:30',
    location: 'GRYT Garage Gym, Strip District',
    challenge_type: 'AMRAP',
    scoring_method: 'Most Rounds',
    timing_mode: 'Director-Timed',
    distance_target: '20 min cap',
    instructions: '20-min AMRAP: 10 air squats, 8 push-ups, 6 burpees.',
    is_public: true,
    status: 'open',
  });

  const amrapRounds = [9, 8, 7, 6, 5, 4];
  for (let i = 0; i < 8; i += 1) {
    const team = TEAMS[i % TEAMS.length];
    const athlete = await registerAthlete(amrap.id, { name: NAMES[i], team });
    if (i < amrapRounds.length) {
      await saveResult({
        event_id: amrap.id,
        athlete_id: athlete.id,
        athlete_name: NAMES[i],
        team,
        rounds: amrapRounds[i],
        reps: amrapRounds[i] * 24,
        source: 'director_timed',
        status: 'finished',
      });
    }
  }

  localStorage.setItem(SEED_FLAG, '1');
}
