// ─────────────────────────────────────────────────────────────────────────
// iGRYT data service layer.
// localStorage-backed for the MVP, but every read/write goes through this
// module so that swapping in Supabase later only touches this file.
// ─────────────────────────────────────────────────────────────────────────

const KEYS = {
  events: 'igryt.events',
  athletes: 'igryt.athletes',
  finishQueue: 'igryt.finish_queue',
  results: 'igryt.results',
};

const listeners = new Set();

// Let any screen react to data changes (live scoreboard, timing station, etc.)
// We notify on local writes and also when another tab writes to localStorage.
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* listener errors should never break a write */
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

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 48);
}

export function makeEventCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ── Events ─────────────────────────────────────────────────────────────────

export function getEvents() {
  return read(KEYS.events).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
}

export function getEventBySlug(slug) {
  return read(KEYS.events).find((e) => e.slug === slug) || null;
}

export function getEventById(id) {
  return read(KEYS.events).find((e) => e.id === id) || null;
}

export function createEvent(data) {
  const events = read(KEYS.events);
  let slug = data.slug ? slugify(data.slug) : slugify(data.name || 'event');
  if (!slug) slug = `event-${Date.now().toString(36)}`;
  // keep slug unique
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

export function updateEvent(id, patch) {
  const events = read(KEYS.events);
  const next = events.map((e) => (e.id === id ? { ...e, ...patch } : e));
  write(KEYS.events, next);
  return next.find((e) => e.id === id) || null;
}

export function deleteEvent(id) {
  write(KEYS.events, read(KEYS.events).filter((e) => e.id !== id));
  write(KEYS.athletes, read(KEYS.athletes).filter((a) => a.event_id !== id));
  write(KEYS.finishQueue, read(KEYS.finishQueue).filter((f) => f.event_id !== id));
  write(KEYS.results, read(KEYS.results).filter((r) => r.event_id !== id));
}

export function startEventClock(id) {
  return updateEvent(id, { status: 'live', started_at: Date.now() });
}

export function finishEvent(id) {
  return updateEvent(id, { status: 'finished' });
}

// ── Athletes / roster ────────────────────────────────────────────────────

export function getEventRoster(eventId) {
  return read(KEYS.athletes)
    .filter((a) => a.event_id === eventId)
    .sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
}

export function registerAthlete(eventId, { name, team }) {
  const athletes = read(KEYS.athletes);
  const athlete = {
    id: uid('ath'),
    event_id: eventId,
    name: (name || '').trim() || 'Athlete',
    team: (team || '').trim(),
    status: 'registered',
    created_at: Date.now(),
  };
  write(KEYS.athletes, [...athletes, athlete]);
  return athlete;
}

export function updateAthlete(id, patch) {
  const next = read(KEYS.athletes).map((a) => (a.id === id ? { ...a, ...patch } : a));
  write(KEYS.athletes, next);
  return next.find((a) => a.id === id) || null;
}

export function deleteAthlete(id) {
  write(KEYS.athletes, read(KEYS.athletes).filter((a) => a.id !== id));
}

// ── Finish queue (Director Timing Station) ─────────────────────────────────

export function getFinishQueue(eventId) {
  return read(KEYS.finishQueue)
    .filter((f) => f.event_id === eventId)
    .sort((a, b) => a.timestamp_ms - b.timestamp_ms);
}

// Records a raw finish timestamp. timestamp_ms is elapsed ms from the gun.
export function recordFinishTimestamp(eventId, timestampMs) {
  const queue = read(KEYS.finishQueue);
  const entry = {
    id: uid('fin'),
    event_id: eventId,
    timestamp_ms: timestampMs,
    assigned_athlete_id: null,
    rank: null,
    created_at: Date.now(),
  };
  write(KEYS.finishQueue, [...queue, entry]);
  return entry;
}

export function deleteFinishTimestamp(id) {
  write(KEYS.finishQueue, read(KEYS.finishQueue).filter((f) => f.id !== id));
}

// Assign a raw finish timestamp to an athlete -> produces a director-timed result.
export function assignFinisherToAthlete(finishId, athleteId) {
  const queue = read(KEYS.finishQueue);
  const entry = queue.find((f) => f.id === finishId);
  if (!entry) return null;
  const athlete = read(KEYS.athletes).find((a) => a.id === athleteId);
  if (!athlete) return null;

  write(
    KEYS.finishQueue,
    queue.map((f) => (f.id === finishId ? { ...f, assigned_athlete_id: athleteId } : f))
  );
  updateAthlete(athleteId, { status: 'finished' });

  // Replace any prior result for this athlete in this event.
  const prior = read(KEYS.results).find(
    (r) => r.event_id === entry.event_id && r.athlete_id === athleteId
  );
  const result = saveResult({
    id: prior?.id,
    event_id: entry.event_id,
    athlete_id: athleteId,
    athlete_name: athlete.name,
    team: athlete.team,
    final_time_seconds: entry.timestamp_ms / 1000,
    source: 'director_timed',
  });
  return result;
}

// ── Results ────────────────────────────────────────────────────────────────

export function getResults(eventId) {
  return read(KEYS.results).filter((r) => r.event_id === eventId);
}

export function getResultById(id) {
  return read(KEYS.results).find((r) => r.id === id) || null;
}

export function saveResult(data) {
  const results = read(KEYS.results);
  const existingIdx = data.id ? results.findIndex((r) => r.id === data.id) : -1;
  const base = existingIdx >= 0 ? results[existingIdx] : {};
  const result = {
    id: data.id || uid('res'),
    event_id: data.event_id,
    athlete_id: data.athlete_id || null,
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
  const next = existingIdx >= 0 ? results.map((r, i) => (i === existingIdx ? result : r)) : [...results, result];
  write(KEYS.results, next);
  if (result.athlete_id) {
    updateAthlete(result.athlete_id, {
      status: result.status === 'dnf' ? 'dnf' : 'finished',
    });
  }
  return result;
}

export function updateResult(id, patch) {
  const next = read(KEYS.results).map((r) => (r.id === id ? { ...r, ...patch, updated_at: Date.now() } : r));
  write(KEYS.results, next);
  return next.find((r) => r.id === id) || null;
}

export function deleteResult(id) {
  write(KEYS.results, read(KEYS.results).filter((r) => r.id !== id));
}

export function markDNF(eventId, athlete) {
  const result = saveResult({
    event_id: eventId,
    athlete_id: athlete.id,
    athlete_name: athlete.name,
    team: athlete.team,
    status: 'dnf',
    source: 'manual',
  });
  updateAthlete(athlete.id, { status: 'dnf' });
  return result;
}

// ── Ranking ──────────────────────────────────────────────────────────────

// Returns the comparator metric for a result given the event scoring method.
function scoringValue(result, method) {
  switch (method) {
    case 'Most Reps':
      return result.reps ?? 0;
    case 'Most Rounds':
      return result.rounds ?? 0;
    case 'Longest Distance':
      return result.distance_meters ?? 0;
    case 'Custom Points':
      return result.score ?? 0;
    case 'Fastest Time':
    default:
      return result.final_time_seconds ?? Infinity;
  }
}

// Lower-is-better only for time; everything else is higher-is-better.
function lowerIsBetter(method) {
  return method === 'Fastest Time' || !method;
}

export function calculateRankings(results, method = 'Fastest Time') {
  const ranked = results.filter((r) => r.status !== 'dnf');
  const dnf = results.filter((r) => r.status === 'dnf');
  const asc = lowerIsBetter(method);
  ranked.sort((a, b) => {
    const av = scoringValue(a, method);
    const bv = scoringValue(b, method);
    return asc ? av - bv : bv - av;
  });
  const withRank = ranked.map((r, i) => ({ ...r, rank: i + 1 }));
  return [...withRank, ...dnf.map((r) => ({ ...r, rank: null }))];
}

// Convenience: ranked scoreboard for an event.
export function getScoreboard(eventId) {
  const event = getEventById(eventId);
  const results = getResults(eventId);
  return calculateRankings(results, event?.scoring_method);
}

export function clearAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  emit();
}

export { KEYS };
