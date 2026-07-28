import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as storage from './storage.js';
import { clearAll } from './backends/local.js';

// This suite runs with no VITE_SUPABASE_* env, i.e. the default configuration a
// developer or race-day operator gets out of the box. It asserts that the data
// boundary really is wired to localStorage and that no Supabase path is taken.
beforeEach(() => {
  clearAll();
});

describe('default backend wiring', () => {
  it('resolves to the local backend with no env configured', () => {
    expect(storage.backendMode).toBe('local');
    expect(storage.isSupabaseConfigured).toBe(false);
    expect(storage.backendConfigError).toBeNull();
  });

  it('writes through to localStorage rather than a network client', async () => {
    const event = await storage.createEvent({ name: 'Default Backend 5K' });
    const persisted = JSON.parse(localStorage.getItem('igryt.events'));
    expect(persisted.map((e) => e.id)).toContain(event.id);
    expect(await storage.getEventBySlug(event.slug)).toMatchObject({ id: event.id });
  });

  it('never constructs a Supabase client', async () => {
    const { supabase } = await import('./supabase.js');
    expect(supabase).toBeNull();
  });

  it('runs a full local race without touching fetch', async () => {
    // If any Supabase path were reachable in local mode it would surface here as
    // an unexpected fetch (and, in a browser, as console errors).
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    try {
      const event = await storage.createEvent({ name: 'Offline Race', scoring_method: 'Fastest Time' });
      const athlete = await storage.registerAthlete(event.id, { name: 'Dana', team: 'North Shore' });
      await storage.startEventClock(event.id);
      const finish = await storage.recordFinishTimestamp(event.id, 1234);
      await storage.assignFinisherToAthlete(finish.id, athlete.id);

      const board = await storage.getScoreboard(event.id);
      expect(board).toHaveLength(1);
      expect(board[0]).toMatchObject({ athlete_name: 'Dana', rank: 1, source: 'director_timed' });
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('keeps the local realtime subscription usable for cross-view refresh', async () => {
    const onChange = vi.fn();
    const unsubscribe = storage.subscribeToEvent('any-event', onChange);
    await storage.createEvent({ name: 'Subscribed Event' });
    expect(onChange).toHaveBeenCalled();

    unsubscribe();
    onChange.mockClear();
    await storage.createEvent({ name: 'After Unsubscribe' });
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('markDNF composition', () => {
  it('records a DNF result and flags the athlete in local mode', async () => {
    const event = await storage.createEvent({ name: 'DNF Race' });
    const athlete = await storage.registerAthlete(event.id, { name: 'Sam', team: 'South Hills' });

    const result = await storage.markDNF(event.id, athlete);
    expect(result).toMatchObject({ status: 'dnf', athlete_id: athlete.id });

    const roster = await storage.getEventRoster(event.id);
    expect(roster[0].status).toBe('dnf');

    // A DNF must never occupy a rank on the scoreboard.
    const board = await storage.getScoreboard(event.id);
    expect(board[0].rank).toBeFalsy();
  });
});
