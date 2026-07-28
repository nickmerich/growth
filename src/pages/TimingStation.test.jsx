import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TimingStation from './TimingStation.jsx';
import { createEvent, updateEvent, registerAthlete, clearAll } from '../lib/backends/local.js';

// Race-day protections on the timing station, exercised in pure local mode (no
// Supabase env). The guarantee under test is "a finish tap is never lost": it is
// held optimistically, mirrored to localStorage, and can only leave the queue by
// syncing or by an explicit confirmation.

const h = vi.hoisted(() => ({ recordImpl: null }));

vi.mock('../lib/sound.js', () => ({
  beep: vi.fn(),
  buzzer: vi.fn(),
  click: vi.fn(),
  vibrate: vi.fn(),
  primeAudio: vi.fn(),
}));

// Lets a single test simulate a failing finish insert while every other call
// goes to the real localStorage backend.
vi.mock('../lib/storage.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    recordFinishTimestamp: (...args) =>
      h.recordImpl ? h.recordImpl(...args) : actual.recordFinishTimestamp(...args),
  };
});

async function seedLiveEvent() {
  const event = await createEvent({ name: 'Race Day 5K', scoring_method: 'Fastest Time' });
  await registerAthlete(event.id, { name: 'Dana', team: 'North Shore' });
  return updateEvent(event.id, {
    status: 'live',
    started_at: new Date(Date.now() - 60_000).toISOString(),
  });
}

function renderStation(event) {
  return render(
    <MemoryRouter initialEntries={[`/admin/time/${event.slug}`]}>
      <Routes>
        <Route path="/admin/time/:slug" element={<TimingStation />} />
      </Routes>
    </MemoryRouter>
  );
}

const recordButton = () => screen.getByRole('button', { name: /RECORD/i });
const pendingKeyFor = (event) => `igryt.pending_finishes.${event.id}`;

beforeEach(() => {
  clearAll();
  localStorage.clear();
  h.recordImpl = null;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('finish taps in local mode', () => {
  it('records a tap through to the local backend', async () => {
    const event = await seedLiveEvent();
    renderStation(event);
    fireEvent.pointerDown(await waitFor(recordButton));

    // Once confirmed, the optimistic row is replaced by the persisted row.
    await waitFor(() => expect(screen.getByText(/Unassigned/i)).toBeInTheDocument());
    const queue = JSON.parse(localStorage.getItem('igryt.finish_queue'));
    expect(queue).toHaveLength(1);
    expect(queue[0].event_id).toBe(event.id);
  });

  it('keeps a failed tap visible for retry instead of dropping it', async () => {
    h.recordImpl = () => Promise.reject(new Error('backend unavailable'));
    const event = await seedLiveEvent();
    renderStation(event);
    fireEvent.pointerDown(await waitFor(recordButton));

    await waitFor(() => expect(screen.getByText(/Not synced/i)).toBeInTheDocument());
    // Nothing reached the store, so the tap only survives via the pending mirror.
    expect(JSON.parse(localStorage.getItem('igryt.finish_queue') || '[]')).toHaveLength(0);
    expect(JSON.parse(localStorage.getItem(pendingKeyFor(event)))).toHaveLength(1);
  });

  it('retries a failed tap and clears it once it syncs', async () => {
    h.recordImpl = () => Promise.reject(new Error('backend unavailable'));
    const event = await seedLiveEvent();
    renderStation(event);
    fireEvent.pointerDown(await waitFor(recordButton));
    await waitFor(() => expect(screen.getByText(/Not synced/i)).toBeInTheDocument());

    h.recordImpl = null; // backend comes back
    fireEvent.click(screen.getByTitle('Retry sync'));

    await waitFor(() => expect(screen.queryByText(/Not synced/i)).not.toBeInTheDocument());
    expect(JSON.parse(localStorage.getItem('igryt.finish_queue'))).toHaveLength(1);
    expect(localStorage.getItem(pendingKeyFor(event))).toBeNull();
  });

  it('restores unsynced taps after a reload, flagged for explicit retry', async () => {
    const event = await createEvent({ name: 'Reloaded 5K' });
    const live = await updateEvent(event.id, {
      status: 'live',
      started_at: new Date(Date.now() - 30_000).toISOString(),
    });
    localStorage.setItem(
      pendingKeyFor(live),
      JSON.stringify([
        { id: 'tmp_restored', event_id: live.id, timestamp_ms: 12_345, assigned_athlete_id: null, status: 'pending', _optimistic: true },
      ])
    );

    renderStation(live);
    // Restored as an error, never silently re-fired — a re-fire could duplicate a
    // tap that actually did sync before the reload.
    await waitFor(() => expect(screen.getByText(/Not synced/i)).toBeInTheDocument());
  });
});

describe('destructive actions guard unsynced taps', () => {
  it('warns that reset will lose unsynced taps and keeps them when declined', async () => {
    h.recordImpl = () => Promise.reject(new Error('backend unavailable'));
    const event = await seedLiveEvent();
    renderStation(event);
    fireEvent.pointerDown(await waitFor(recordButton));
    await waitFor(() => expect(screen.getByText(/Not synced/i)).toBeInTheDocument());

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    fireEvent.click(screen.getByTitle('Reset clock'));

    expect(confirmSpy).toHaveBeenCalledWith(expect.stringMatching(/not synced yet and will be permanently lost/i));
    expect(screen.getByText(/Not synced/i)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(pendingKeyFor(event)))).toHaveLength(1);
  });

  it('confirms before deleting an unsynced tap and keeps it when declined', async () => {
    h.recordImpl = () => Promise.reject(new Error('backend unavailable'));
    const event = await seedLiveEvent();
    renderStation(event);
    fireEvent.pointerDown(await waitFor(recordButton));
    await waitFor(() => expect(screen.getByText(/Not synced/i)).toBeInTheDocument());

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    fireEvent.click(screen.getByTitle('Delete'));

    expect(confirmSpy).toHaveBeenCalledWith(expect.stringMatching(/has not synced yet/i));
    expect(screen.getByText(/Not synced/i)).toBeInTheDocument();

    // Accepting the warning is the only way an unsynced tap leaves the queue.
    confirmSpy.mockReturnValue(true);
    fireEvent.click(screen.getByTitle('Delete'));
    await waitFor(() => expect(screen.queryByText(/Not synced/i)).not.toBeInTheDocument());
    expect(localStorage.getItem(pendingKeyFor(event))).toBeNull();
  });

  it('registers an unload warning only while taps are unsynced', async () => {
    h.recordImpl = () => Promise.reject(new Error('backend unavailable'));
    const addSpy = vi.spyOn(window, 'addEventListener');
    const event = await seedLiveEvent();
    renderStation(event);

    expect(addSpy.mock.calls.some(([type]) => type === 'beforeunload')).toBe(false);

    fireEvent.pointerDown(await waitFor(recordButton));
    await waitFor(() => expect(screen.getByText(/Not synced/i)).toBeInTheDocument());
    await waitFor(() =>
      expect(addSpy.mock.calls.some(([type]) => type === 'beforeunload')).toBe(true)
    );
  });
});

describe('local-mode status indicator', () => {
  it('shows the local storage badge and no error banner', async () => {
    const event = await seedLiveEvent();
    renderStation(event);
    const badge = await screen.findByLabelText(/Storage status: Local\./i);
    expect(badge).toBeInTheDocument();
    // The default offline app must never show a degraded/offline banner.
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
