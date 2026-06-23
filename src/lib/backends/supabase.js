// ─────────────────────────────────────────────────────────────────────────
// Supabase backend.
//
// Active when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set. Every reader
// throws on a Supabase error so race-day writes can never silently fail, and
// realtime subscriptions drive refetch-on-change for scoreboards. The exported
// surface matches src/lib/backends/local.js exactly.
// ─────────────────────────────────────────────────────────────────────────
import { supabase } from '../supabase.js';
import { makeEventCode, slugify } from '../pure.js';

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

// ── Events ──────────────────────────────────────────────────────────────────
export async function getEvents() {
  return unwrap(
    await supabase.from('events').select('*').order('created_at', { ascending: false })
  );
}

export async function getEventBySlug(slug) {
  return unwrap(await supabase.from('events').select('*').eq('slug', slug).maybeSingle());
}

export async function getEventById(id) {
  return unwrap(await supabase.from('events').select('*').eq('id', id).maybeSingle());
}

export async function createEvent(data) {
  const { data: userData } = await supabase.auth.getUser();
  const baseSlug = data.slug ? slugify(data.slug) : slugify(data.name || 'event');
  const payload = {
    owner_id: userData?.user?.id ?? null,
    name: data.name || 'Untitled Event',
    slug: baseSlug || `event-${Date.now().toString(36)}`,
    event_code: makeEventCode(),
    date: data.date || null,
    start_time: data.start_time || null,
    location: data.location || null,
    challenge_type: data.challenge_type || 'Run',
    scoring_method: data.scoring_method || 'Fastest Time',
    timing_mode: data.timing_mode || 'Hybrid',
    distance_target: data.distance_target || null,
    instructions: data.instructions || null,
    is_public: data.is_public !== false,
    status: data.status || 'open',
  };

  // Retry on slug collision (unique constraint) with a numeric suffix.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data: row, error } = await supabase
      .from('events')
      .insert(attempt === 0 ? payload : { ...payload, slug: `${payload.slug}-${attempt + 1}` })
      .select()
      .single();
    if (!error) return row;
    if (error.code !== '23505') throw error;
  }
  throw new Error('Could not generate a unique slug for this event');
}

export async function updateEvent(id, patch) {
  return unwrap(await supabase.from('events').update(patch).eq('id', id).select().single());
}

export async function deleteEvent(id) {
  // Children removed by ON DELETE CASCADE.
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

// ── Athletes ──────────────────────────────────────────────────────────────
export async function getEventRoster(eventId) {
  return unwrap(
    await supabase
      .from('athletes')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })
  );
}

export async function registerAthlete(eventId, { name, team, session_token } = {}) {
  if (session_token) {
    const existing = unwrap(
      await supabase
        .from('athletes')
        .select('*')
        .eq('event_id', eventId)
        .eq('session_token', session_token)
        .maybeSingle()
    );
    if (existing) return existing;
  }
  return unwrap(
    await supabase
      .from('athletes')
      .insert({
        event_id: eventId,
        session_token: session_token || null,
        name: (name || '').trim() || 'Athlete',
        team: (team || '').trim() || null,
        status: 'registered',
      })
      .select()
      .single()
  );
}

export async function updateAthlete(id, patch) {
  return unwrap(await supabase.from('athletes').update(patch).eq('id', id).select().single());
}

export async function deleteAthlete(id) {
  const { error } = await supabase.from('athletes').delete().eq('id', id);
  if (error) throw error;
}

// ── Finishes ──────────────────────────────────────────────────────────────
export async function getFinishQueue(eventId) {
  return unwrap(
    await supabase
      .from('finishes')
      .select('*')
      .eq('event_id', eventId)
      .order('timestamp_ms', { ascending: true })
  );
}

export async function recordFinishTimestamp(eventId, timestampMs) {
  return unwrap(
    await supabase
      .from('finishes')
      .insert({ event_id: eventId, timestamp_ms: Math.round(timestampMs) })
      .select()
      .single()
  );
}

export async function deleteFinishTimestamp(id) {
  const { error } = await supabase.from('finishes').delete().eq('id', id);
  if (error) throw error;
}

export async function assignFinisherToAthlete(finishId, athleteId) {
  return unwrap(
    await supabase.rpc('assign_finisher', {
      p_finish_id: finishId,
      p_athlete_id: athleteId,
    })
  );
}

// ── Results ──────────────────────────────────────────────────────────────
export async function getResults(eventId) {
  return unwrap(await supabase.from('results').select('*').eq('event_id', eventId));
}

export async function getResultById(id) {
  return unwrap(await supabase.from('results').select('*').eq('id', id).maybeSingle());
}

export async function saveResult(data) {
  const row = {
    event_id: data.event_id,
    athlete_id: data.athlete_id || null,
    athlete_name: data.athlete_name || 'Athlete',
    team: data.team ?? null,
    final_time_seconds: data.final_time_seconds ?? null,
    distance_meters: data.distance_meters ?? null,
    reps: data.reps ?? null,
    rounds: data.rounds ?? null,
    score: data.score ?? null,
    rpe: data.rpe ?? null,
    notes: data.notes ?? null,
    splits: data.splits ?? [],
    status: data.status ?? 'finished',
    source: data.source || 'manual',
  };

  let result;
  if (data.id) {
    result = unwrap(await supabase.from('results').update(row).eq('id', data.id).select().single());
  } else if (row.athlete_id) {
    // Upsert against UNIQUE(event_id, athlete_id) so re-saving replaces in place.
    result = unwrap(
      await supabase
        .from('results')
        .upsert(row, { onConflict: 'event_id,athlete_id' })
        .select()
        .single()
    );
  } else {
    result = unwrap(await supabase.from('results').insert(row).select().single());
  }

  if (result.athlete_id) {
    await updateAthlete(result.athlete_id, {
      status: result.status === 'dnf' ? 'dnf' : 'finished',
    });
  }
  return result;
}

export async function updateResult(id, patch) {
  return unwrap(await supabase.from('results').update(patch).eq('id', id).select().single());
}

export async function deleteResult(id) {
  const { error } = await supabase.from('results').delete().eq('id', id);
  if (error) throw error;
}

// ── Realtime ──────────────────────────────────────────────────────────────
// One event-scoped channel watching every table that can change a scoreboard.
// onChange is called on any relevant insert/update/delete; callers refetch.
export function subscribeToEvent(eventId, onChange) {
  const channel = supabase.channel(`event:${eventId}`);
  const tables = [
    ['results', `event_id=eq.${eventId}`],
    ['finishes', `event_id=eq.${eventId}`],
    ['athletes', `event_id=eq.${eventId}`],
    ['events', `id=eq.${eventId}`],
  ];
  tables.forEach(([table, filter]) => {
    channel.on('postgres_changes', { event: '*', schema: 'public', table, filter }, onChange);
  });
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}

// Account-wide channel for list views (dashboard/home) where there is no single
// event scope yet.
export function subscribeAll(onChange) {
  const channel = supabase.channel('events:all');
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, onChange);
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}
