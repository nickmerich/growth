import { describe, it, expect, beforeEach } from 'vitest';
import {
  createEvent,
  registerAthlete,
  recordFinishTimestamp,
  getFinishQueue,
  assignFinisherToAthlete,
  saveResult,
  saveSelfResult,
  getResults,
  getEventRoster,
  clearAll,
} from './local.js';

beforeEach(() => {
  clearAll();
});

async function seedEvent(overrides = {}) {
  return createEvent({ name: 'Test 5K', scoring_method: 'Fastest Time', ...overrides });
}

describe('createEvent', () => {
  it('disambiguates colliding slugs', async () => {
    const a = await seedEvent({ name: 'Saturday GRYT' });
    const b = await seedEvent({ name: 'Saturday GRYT' });
    expect(a.slug).toBe('saturday-gryt');
    expect(b.slug).toBe('saturday-gryt-2');
  });
});

describe('registerAthlete session token dedup', () => {
  it('returns the existing athlete for a repeated session token', async () => {
    const event = await seedEvent();
    const first = await registerAthlete(event.id, { name: 'Dana', session_token: 'tok_1' });
    const second = await registerAthlete(event.id, { name: 'Dana again', session_token: 'tok_1' });
    expect(second.id).toBe(first.id);
    const roster = await getEventRoster(event.id);
    expect(roster).toHaveLength(1);
  });

  it('creates distinct athletes for different tokens', async () => {
    const event = await seedEvent();
    await registerAthlete(event.id, { name: 'A', session_token: 'tok_a' });
    await registerAthlete(event.id, { name: 'B', session_token: 'tok_b' });
    expect(await getEventRoster(event.id)).toHaveLength(2);
  });
});

describe('saveResult upsert (one per event+athlete)', () => {
  it('updates the existing result rather than inserting a duplicate', async () => {
    const event = await seedEvent();
    const athlete = await registerAthlete(event.id, { name: 'Pat' });
    await saveResult({
      event_id: event.id,
      athlete_id: athlete.id,
      athlete_name: athlete.name,
      final_time_seconds: 320,
      source: 'self_timed',
    });
    await saveResult({
      event_id: event.id,
      athlete_id: athlete.id,
      athlete_name: athlete.name,
      final_time_seconds: 300,
      source: 'manual',
    });
    const results = await getResults(event.id);
    expect(results).toHaveLength(1);
    expect(results[0].final_time_seconds).toBe(300);
  });

  it('marks the athlete finished when a result is saved', async () => {
    const event = await seedEvent();
    const athlete = await registerAthlete(event.id, { name: 'Pat' });
    await saveResult({
      event_id: event.id,
      athlete_id: athlete.id,
      athlete_name: athlete.name,
      final_time_seconds: 280,
    });
    const roster = await getEventRoster(event.id);
    expect(roster[0].status).toBe('finished');
  });
});

describe('saveSelfResult (submit_self_result RPC mirror)', () => {
  it('find-or-creates an athlete by session token and stamps self_timed', async () => {
    const event = await seedEvent();
    const result = await saveSelfResult(event.id, {
      session_token: 'tok_self',
      name: 'Robin',
      final_time_seconds: 310,
    });
    expect(result.source).toBe('self_timed');
    expect(result.final_time_seconds).toBe(310);
    const roster = await getEventRoster(event.id);
    expect(roster).toHaveLength(1);
    expect(roster[0].session_token).toBe('tok_self');
    expect(roster[0].status).toBe('finished');
  });

  it('re-save replaces the athlete\'s own result in place (no duplicate)', async () => {
    const event = await seedEvent();
    await saveSelfResult(event.id, { session_token: 'tok_self', name: 'Robin', final_time_seconds: 310 });
    await saveSelfResult(event.id, { session_token: 'tok_self', name: 'Robin', final_time_seconds: 295 });
    const results = await getResults(event.id);
    expect(results).toHaveLength(1);
    expect(results[0].final_time_seconds).toBe(295);
    expect(await getEventRoster(event.id)).toHaveLength(1);
  });

  it('claims a pre-registered athlete by id and binds the token', async () => {
    const event = await seedEvent();
    const walkup = await registerAthlete(event.id, { name: 'Walk Up' }); // no token
    const result = await saveSelfResult(event.id, {
      session_token: 'tok_claim',
      athlete_id: walkup.id,
      name: 'Walk Up',
      final_time_seconds: 400,
    });
    expect(result.athlete_id).toBe(walkup.id);
    const roster = await getEventRoster(event.id);
    expect(roster).toHaveLength(1);
    expect(roster[0].session_token).toBe('tok_claim');
  });

  it('rejects an athlete id from a different event', async () => {
    const eventA = await seedEvent({ name: 'A' });
    const eventB = await seedEvent({ name: 'B' });
    const athleteB = await registerAthlete(eventB.id, { name: 'Other' });
    await expect(
      saveSelfResult(eventA.id, { session_token: 'tok_x', athlete_id: athleteB.id, name: 'Other', final_time_seconds: 100 })
    ).rejects.toThrow();
  });
});

describe('finish queue never drops records', () => {
  it('keeps every sequential finish tap as its own row', async () => {
    const event = await seedEvent();
    const stamps = [1000, 2000, 3000, 4000, 5000];
    for (const ms of stamps) {
      await recordFinishTimestamp(event.id, ms);
    }
    const queue = await getFinishQueue(event.id);
    expect(queue.map((q) => q.timestamp_ms)).toEqual(stamps);
    expect(new Set(queue.map((q) => q.id)).size).toBe(stamps.length);
  });
});

describe('assignFinisherToAthlete (assign_finisher RPC mirror)', () => {
  it('assigns the finish, creates the result, and marks the athlete finished', async () => {
    const event = await seedEvent();
    const athlete = await registerAthlete(event.id, { name: 'Sam' });
    await recordFinishTimestamp(event.id, 295000);
    const [finish] = await getFinishQueue(event.id);

    const result = await assignFinisherToAthlete(finish.id, athlete.id);
    expect(result.final_time_seconds).toBe(295);
    expect(result.source).toBe('director_timed');

    const [updatedFinish] = await getFinishQueue(event.id);
    expect(updatedFinish.assigned_athlete_id).toBe(athlete.id);

    const roster = await getEventRoster(event.id);
    expect(roster[0].status).toBe('finished');

    const results = await getResults(event.id);
    expect(results).toHaveLength(1);
  });

  it('does not create a second result if the athlete is reassigned', async () => {
    const event = await seedEvent();
    const athlete = await registerAthlete(event.id, { name: 'Sam' });
    await recordFinishTimestamp(event.id, 295000);
    await recordFinishTimestamp(event.id, 305000);
    const queue = await getFinishQueue(event.id);

    await assignFinisherToAthlete(queue[0].id, athlete.id);
    await assignFinisherToAthlete(queue[1].id, athlete.id);

    const results = await getResults(event.id);
    expect(results).toHaveLength(1);
    expect(results[0].final_time_seconds).toBe(305);
  });

  it('rejects assigning an athlete from a different event', async () => {
    const eventA = await seedEvent({ name: 'A' });
    const eventB = await seedEvent({ name: 'B' });
    const athleteB = await registerAthlete(eventB.id, { name: 'Other' });
    await recordFinishTimestamp(eventA.id, 100000);
    const [finish] = await getFinishQueue(eventA.id);
    await expect(assignFinisherToAthlete(finish.id, athleteB.id)).rejects.toThrow();
  });
});
