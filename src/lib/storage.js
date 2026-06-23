// ─────────────────────────────────────────────────────────────────────────
// iGRYT data service layer — the single boundary every page reads/writes through.
//
// DB-touching reads and writes are async and delegate to the active backend:
//   * Supabase   when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set
//   * localStorage otherwise, so the app still builds and demos credential-free
//
// Pure helpers (uid, slugify, makeEventCode, calculateRankings, …) stay
// synchronous and are re-exported here so existing imports keep working.
// ─────────────────────────────────────────────────────────────────────────
import { isSupabaseConfigured } from './supabase.js';
import * as supabaseBackend from './backends/supabase.js';
import * as localBackend from './backends/local.js';

const backend = isSupabaseConfigured ? supabaseBackend : localBackend;

export { isSupabaseConfigured };

// Pure, synchronous helpers (shared with backends and tests).
export {
  uid,
  slugify,
  makeEventCode,
  scoringValue,
  lowerIsBetter,
  calculateRankings,
} from './pure.js';

import { calculateRankings } from './pure.js';

// ── Events ──────────────────────────────────────────────────────────────────
export const getEvents = (...a) => backend.getEvents(...a);
export const getEventBySlug = (...a) => backend.getEventBySlug(...a);
export const getEventById = (...a) => backend.getEventById(...a);
export const createEvent = (...a) => backend.createEvent(...a);
export const updateEvent = (...a) => backend.updateEvent(...a);
export const deleteEvent = (...a) => backend.deleteEvent(...a);

export const startEventClock = (id) =>
  backend.updateEvent(id, { status: 'live', started_at: new Date().toISOString() });
export const finishEvent = (id) =>
  backend.updateEvent(id, { status: 'finished', finished_at: new Date().toISOString() });

// ── Athletes / roster ────────────────────────────────────────────────────
export const getEventRoster = (...a) => backend.getEventRoster(...a);
export const registerAthlete = (...a) => backend.registerAthlete(...a);
export const updateAthlete = (...a) => backend.updateAthlete(...a);
export const deleteAthlete = (...a) => backend.deleteAthlete(...a);

// ── Finish queue ────────────────────────────────────────────────────────────
export const getFinishQueue = (...a) => backend.getFinishQueue(...a);
export const recordFinishTimestamp = (...a) => backend.recordFinishTimestamp(...a);
export const deleteFinishTimestamp = (...a) => backend.deleteFinishTimestamp(...a);
export const assignFinisherToAthlete = (...a) => backend.assignFinisherToAthlete(...a);

// ── Results ──────────────────────────────────────────────────────────────
export const getResults = (...a) => backend.getResults(...a);
export const getResultById = (...a) => backend.getResultById(...a);
export const saveResult = (...a) => backend.saveResult(...a);
export const updateResult = (...a) => backend.updateResult(...a);
export const deleteResult = (...a) => backend.deleteResult(...a);

export async function markDNF(eventId, athlete) {
  const result = await backend.saveResult({
    event_id: eventId,
    athlete_id: athlete.id,
    athlete_name: athlete.name,
    team: athlete.team,
    status: 'dnf',
    source: 'manual',
  });
  await backend.updateAthlete(athlete.id, { status: 'dnf' });
  return result;
}

// ── Ranking / scoreboard ─────────────────────────────────────────────────
// Composition of event + results fetches plus the shared ranking function, so
// every view derives identical ranks.
export async function getScoreboard(eventId) {
  const [event, results] = await Promise.all([
    backend.getEventById(eventId),
    backend.getResults(eventId),
  ]);
  return calculateRankings(results, event?.scoring_method);
}

// ── Realtime ──────────────────────────────────────────────────────────────
export const subscribeToEvent = (...a) => backend.subscribeToEvent(...a);
export const subscribeAll = (...a) => backend.subscribeAll(...a);
