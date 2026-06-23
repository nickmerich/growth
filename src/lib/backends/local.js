// ─────────────────────────────────────────────────────────────────────────
// localStorage backend.
//
// Used when Supabase is not configured so the app still builds and runs for
// local demos. Every function is async to match the Supabase backend's contract;
// the storage layer never knows which backend it is talking to. Cross-tab
// updates come from the browser `storage` event; same-tab updates from an
// in-process listener set.
// ─────────────────────────────────────────────────────────────────────────
import { uid, makeEventCode, slugify } from '../pure.js';

const KEYS = {
  events: 'igryt.events',
  athletes: 'igryt.athletes',
  finishQueue: 'igryt.finish_queue',
  results: 'igryt.results',
};

const listeners = new Set();

function emit() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* a listener error must never break a write */
    }
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && Object.values(KEYS).includes(e.key)) emit();
  });
}

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function write(key, rows) {
  localStorage.setItem(key, JSON.stringify(rows));
  emit();
}

// ── Events ──────────────────────────────────────────────────────────────────
export async function getEvents() {
  return read(KEYS.events).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
}

export async function getEventBySlug(slug) {
  return read(KEYS.events).find((e) => e.slug === slug) || null;
}

export async function getEventById(id) {
  return read(KEYS.events).find((e) => e.id === id) || null;
}

export async function createEvent(data) {
  const events = read(KEYS.events);
  let slug = data.slug ? slugify(data.slug) : slugify(data.name || 'event');
  if (!slug) slug = `event-${Date.now().toString(36)}`;
  let candidate = slug;
  let n = 2;
  while (events.some((e) => e.slug === candidate)) {
    candidate = `${slug}-${n}`;
    n += 1;
  }
  const event = {
    id: uid('evt'),
    name: data.name || 'Untitled Event',
    slug: candidate,
    event_code: makeEventCode(),
    date: data.date || '',
    start_time: data.start_time || '',
    location: data.location || '',
    challenge_type: data.challenge_type || 'Run',
    scoring_method: data.scoring_method || 'Fastest Time',
    timing_mode: data.timing_mode || 'Hybrid',
    distance_target: data.distance_target || '',
    instructions: data.instructions || '',
    is_public: data.is_public !== false,
    status: data.status || 'open',
    started_at: null,
    created_at: Date.now(),
  };
  write(KEYS.events, [...events, event]);
  return event;
}

export async function updateEvent(id, patch) {
  const next = read(KEYS.events).map((e) => (e.id === id ? { ...e, ...patch } : e));
  write(KEYS.events, next);
  return next.find((e) => e.id === id) || null;
}

export async function deleteEvent(id) {
  write(KEYS.events, read(KEYS.events).filter((e) => e.id !== id));
  write(KEYS.athletes, read(KEYS.athletes).filter((a) => a.event_id !== id));
  write(KEYS.finishQueue, read(KEYS.finishQueue).filter((f) => f.event_id !== id));
  write(KEYS.results, read(KEYS.results).filter((r) => r.event_id !== id));
}

// ── Athletes ──────────────────────────────────────────────────────────────
export async function getEventRoster(eventId) {
  return read(KEYS.athletes)
    .filter((a) => a.event_id === eventId)
    .sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
}

export async function registerAthlete(eventId, { name, team, session_token } = {}) {
  const athletes = read(KEYS.athletes);
  if (session_token) {
    const existing = athletes.find(
      (a) => a.event_id === eventId && a.session_token === session_token
    );
    if (existing) return existing;
  }
  const athlete = {
    id: uid('ath'),
    event_id: eventId,
    session_token: session_token || null,
    name: (name || '').trim() || 'Athlete',
    team: (team || '').trim(),
    status: 'registered',
    created_at: Date.now(),
  };
  write(KEYS.athletes, [...athletes, athlete]);
  return athlete;
}

export async function updateAthlete(id, patch) {
  const next = read(KEYS.athletes).map((a) => (a.id === id ? { ...a, ...patch } : a));
  write(KEYS.athletes, next);
  return next.find((a) => a.id === id) || null;
}

export async function deleteAthlete(id) {
  write(KEYS.athletes, read(KEYS.athletes).filter((a) => a.id !== id));
}

// ── Finishes ──────────────────────────────────────────────────────────────
export async function getFinishQueue(eventId) {
  return read(KEYS.finishQueue)
    .filter((f) => f.event_id === eventId)
    .sort((a, b) => a.timestamp_ms - b.timestamp_ms);
}

export async function recordFinishTimestamp(eventId, timestampMs) {
  const queue = read(KEYS.finishQueue);
  const entry = {
    id: uid('fin'),
    event_id: eventId,
    timestamp_ms: timestampMs,
    assigned_athlete_id: null,
    created_at: Date.now(),
  };
  write(KEYS.finishQueue, [...queue, entry]);
  return entry;
}

export async function deleteFinishTimestamp(id) {
  write(KEYS.finishQueue, read(KEYS.finishQueue).filter((f) => f.id !== id));
}

// Mirrors the assign_finisher RPC: mark the finish assigned and upsert the
// athlete's result atomically (best-effort sequential in localStorage).
export async function assignFinisherToAthlete(finishId, athleteId) {
  const queue = read(KEYS.finishQueue);
  const entry = queue.find((f) => f.id === finishId);
  if (!entry) throw new Error('finish not found');
  const athlete = read(KEYS.athletes).find((a) => a.id === athleteId);
  if (!athlete) throw new Error('athlete not found');
  if (athlete.event_id !== entry.event_id) throw new Error('athlete does not belong to event');

  write(
    KEYS.finishQueue,
    queue.map((f) => (f.id === finishId ? { ...f, assigned_athlete_id: athleteId } : f))
  );
  await updateAthlete(athleteId, { status: 'finished' });

  const prior = read(KEYS.results).find(
    (r) => r.event_id === entry.event_id && r.athlete_id === athleteId
  );
  return saveResult({
    id: prior?.id,
    event_id: entry.event_id,
    athlete_id: athleteId,
    athlete_name: athlete.name,
    team: athlete.team,
    final_time_seconds: entry.timestamp_ms / 1000,
    source: 'director_timed',
    status: 'finished',
  });
}

// ── Results ──────────────────────────────────────────────────────────────
export async function getResults(eventId) {
  return read(KEYS.results).filter((r) => r.event_id === eventId);
}

export async function getResultById(id) {
  return read(KEYS.results).find((r) => r.id === id) || null;
}

export async function saveResult(data) {
  const results = read(KEYS.results);
  // Enforce one result per (event, athlete) like the DB unique index.
  let existingIdx = data.id ? results.findIndex((r) => r.id === data.id) : -1;
  if (existingIdx < 0 && data.athlete_id) {
    existingIdx = results.findIndex(
      (r) => r.event_id === data.event_id && r.athlete_id === data.athlete_id
    );
  }
  const base = existingIdx >= 0 ? results[existingIdx] : {};
  const result = {
    id: base.id || data.id || uid('res'),
    event_id: data.event_id ?? base.event_id,
    athlete_id: data.athlete_id ?? base.athlete_id ?? null,
    athlete_name: data.athlete_name || base.athlete_name || 'Athlete',
    team: data.team ?? base.team ?? '',
    final_time_seconds: data.final_time_seconds ?? base.final_time_seconds ?? null,
    distance_meters: data.distance_meters ?? base.distance_meters ?? null,
    reps: data.reps ?? base.reps ?? null,
    rounds: data.rounds ?? base.rounds ?? null,
    score: data.score ?? base.score ?? null,
    rpe: data.rpe ?? base.rpe ?? null,
    notes: data.notes ?? base.notes ?? '',
    splits: data.splits ?? base.splits ?? [],
    status: data.status ?? base.status ?? 'finished',
    source: data.source || base.source || 'manual',
    created_at: base.created_at || Date.now(),
    updated_at: Date.now(),
  };
  const next =
    existingIdx >= 0 ? results.map((r, i) => (i === existingIdx ? result : r)) : [...results, result];
  write(KEYS.results, next);
  if (result.athlete_id) {
    await updateAthlete(result.athlete_id, {
      status: result.status === 'dnf' ? 'dnf' : 'finished',
    });
  }
  return result;
}

export async function updateResult(id, patch) {
  const next = read(KEYS.results).map((r) =>
    r.id === id ? { ...r, ...patch, updated_at: Date.now() } : r
  );
  write(KEYS.results, next);
  return next.find((r) => r.id === id) || null;
}

export async function deleteResult(id) {
  write(KEYS.results, read(KEYS.results).filter((r) => r.id !== id));
}

// ── Realtime (local pub/sub) ────────────────────────────────────────────────
// Both helpers ignore the eventId filter — any write notifies every listener,
// which is fine for a single-browser demo.
export function subscribeToEvent(_eventId, onChange) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function subscribeAll(onChange) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function clearAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  emit();
}
