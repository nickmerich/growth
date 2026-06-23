import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Flag, MonitorPlay, Plus, RotateCcw, Trash2, RefreshCw } from 'lucide-react';
import { Logo, LoadingState } from '../components/Brand.jsx';
import { MasterClock } from '../components/RaceClock.jsx';
import { useAsyncStore, useWakeLock } from '../lib/hooks.js';
import { beep, buzzer, click, vibrate, primeAudio } from '../lib/sound.js';
import {
  getEventBySlug,
  getEventRoster,
  getFinishQueue,
  getScoreboard,
  startEventClock,
  recordFinishTimestamp,
  assignFinisherToAthlete,
  deleteFinishTimestamp,
  updateEvent,
  saveResult,
  markDNF,
  subscribeToEvent,
} from '../lib/storage.js';
import {
  formatClock,
  formatMetric,
  metricFieldLabel,
  parseTimeToSeconds,
  parseDistanceMeters,
} from '../lib/format.js';

export default function TimingStation() {
  const { slug } = useParams();
  const { data: event, loading, refetch: refetchEvent } = useAsyncStore(
    () => getEventBySlug(slug),
    [slug]
  );
  const sub = event ? { subscribe: (cb) => subscribeToEvent(event.id, cb) } : {};
  const { data: roster } = useAsyncStore(
    () => (event ? getEventRoster(event.id) : Promise.resolve([])),
    [event?.id],
    sub
  );
  const { data: serverQueue, refetch: refetchQueue } = useAsyncStore(
    () => (event ? getFinishQueue(event.id) : Promise.resolve([])),
    [event?.id],
    sub
  );
  const { data: scoreboardData, refetch: refetchBoard } = useAsyncStore(
    () => (event ? getScoreboard(event.id) : Promise.resolve([])),
    [event?.id],
    sub
  );

  useWakeLock(true);

  const [countdown, setCountdown] = useState(null);
  const [flash, setFlash] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState(null);
  const [search, setSearch] = useState('');
  const [showManual, setShowManual] = useState(false);
  // Optimistic finish taps awaiting (or failing) their backend insert.
  const [pending, setPending] = useState([]);
  const [assigning, setAssigning] = useState(null);

  const rosterRows = roster || [];
  const scoreboard = scoreboardData || [];
  // Merge confirmed server rows with optimistic pending taps (newest last).
  const queue = useMemo(() => [...(serverQueue || []), ...pending], [serverQueue, pending]);

  const distanceMeters = useMemo(() => parseDistanceMeters(event?.distance_target), [event?.distance_target]);
  const assignedIds = useMemo(
    () => new Set(queue.filter((q) => q.assigned_athlete_id).map((q) => q.assigned_athlete_id)),
    [queue]
  );
  const unassigned = queue.filter((q) => !q.assigned_athlete_id);

  if (loading && event === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gryt-black">
        <LoadingState label="Loading timing station" />
      </div>
    );
  }
  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gryt-mute">
        Event not found. <Link to="/admin" className="ml-2 text-gryt-light">Dashboard</Link>
      </div>
    );
  }

  const isLive = event.status === 'live' && event.started_at;

  function startRace() {
    primeAudio();
    let n = 3;
    setCountdown(n);
    beep();
    const iv = setInterval(() => {
      n -= 1;
      if (n > 0) {
        setCountdown(n);
        beep();
      } else {
        clearInterval(iv);
        setCountdown('GO');
        buzzer();
        // Await + refetch so every device re-anchors its clock from started_at.
        startEventClock(event.id).then(refetchEvent).catch(() => {});
        setTimeout(() => setCountdown(null), 700);
      }
    }, 1000);
  }

  // Send the finish insert for an optimistic row; reconcile on success/failure.
  async function syncFinish(temp) {
    try {
      await recordFinishTimestamp(event.id, temp.timestamp_ms);
      await refetchQueue();
      // Drop the optimistic row once the confirmed row is loaded.
      setPending((p) => p.filter((x) => x.id !== temp.id));
    } catch {
      // Never pretend a failed insert succeeded — mark it for retry.
      setPending((p) => p.map((x) => (x.id === temp.id ? { ...x, status: 'error' } : x)));
    }
  }

  function recordFinish() {
    if (!isLive) return;
    // Instant feedback first; the network write happens in the background.
    const temp = {
      id: `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      event_id: event.id,
      timestamp_ms: Date.now() - new Date(event.started_at).getTime(),
      assigned_athlete_id: null,
      status: 'pending',
      _optimistic: true,
    };
    setPending((p) => [...p, temp]);
    click();
    vibrate(14);
    setFlash((f) => f + 1);
    syncFinish(temp);
  }

  function retryFinish(temp) {
    setPending((p) => p.map((x) => (x.id === temp.id ? { ...x, status: 'pending' } : x)));
    syncFinish(temp);
  }

  async function assign(finishId, athleteId) {
    setAssigning(finishId);
    try {
      await assignFinisherToAthlete(finishId, athleteId);
      await Promise.all([refetchQueue(), refetchBoard()]);
      setSelectedFinish(null);
      setSearch('');
    } catch (err) {
      window.alert(err?.message || 'Could not assign finisher. Try again.');
    } finally {
      setAssigning(null);
    }
  }

  async function removeFinish(q) {
    if (q._optimistic) {
      setPending((p) => p.filter((x) => x.id !== q.id));
      return;
    }
    try {
      await deleteFinishTimestamp(q.id);
      await refetchQueue();
    } catch (err) {
      window.alert(err?.message || 'Could not delete finish.');
    }
  }

  async function resetRace() {
    if (window.confirm('Reset the race clock? This clears the gun time but keeps results.')) {
      await updateEvent(event.id, { status: 'open', started_at: null });
      setPending([]);
      await refetchEvent();
    }
  }

  const filteredRoster = rosterRows.filter(
    (a) => !search || a.name.toLowerCase().includes(search.toLowerCase()) || (a.team || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-gryt-black select-none">
      {/* tap flash overlay */}
      <div key={flash} className={flash ? 'pointer-events-none fixed inset-0 z-30 animate-tapFlash' : 'hidden'} />

      {/* Countdown overlay */}
      {countdown != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <span className="gryt-heading text-[28vw] leading-none text-gryt-light">{countdown}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between border-b border-gryt-line px-4 py-2">
        <div className="flex items-center gap-3">
          <Link to={`/admin/event/${slug}`} className="gryt-btn-ghost p-2">
            <ArrowLeft size={18} />
          </Link>
          <Logo to={null} size="sm" />
        </div>
        <div className="truncate px-2 text-center text-sm font-semibold text-gryt-mute">{event.name}</div>
        <div className="flex items-center gap-1">
          {isLive && (
            <button onClick={resetRace} className="gryt-btn-ghost p-2" title="Reset clock">
              <RotateCcw size={16} />
            </button>
          )}
          <Link to={`/scoreboard/${slug}`} className="gryt-btn-ghost p-2" title="Scoreboard">
            <MonitorPlay size={18} />
          </Link>
        </div>
      </header>

      {/* Master clock — ~30% */}
      <div className="flex min-h-[26vh] flex-col items-center justify-center border-b border-gryt-line bg-black/40">
        <div className="text-[11px] uppercase tracking-[0.4em] text-gryt-mute">Master Race Clock</div>
        <MasterClock
          startedAt={event.started_at}
          active={isLive}
          className={`gryt-heading font-mono text-[18vw] leading-none text-white tabular sm:text-[14vw] ${isLive ? '' : 'text-gryt-mute'}`}
        />
        {isLive && <div className="text-xs text-gryt-light">{unassigned.length} unassigned · {scoreboard.filter((r) => r.rank).length} ranked</div>}
      </div>

      {/* The big action button */}
      {!isLive ? (
        <button
          onClick={startRace}
          className="gryt-heading flex flex-1 items-center justify-center bg-gryt-light text-[12vw] text-black transition active:bg-white"
        >
          START RACE
        </button>
      ) : (
        <button
          onPointerDown={recordFinish}
          className="gryt-heading flex min-h-[34vh] flex-1 select-none flex-col items-center justify-center bg-gryt-light/90 text-[10vw] leading-none text-black transition active:bg-white"
          style={{ touchAction: 'manipulation' }}
        >
          RECORD
          <span className="text-[5vw]">FINISHER</span>
          <span className="mt-2 text-[2.6vw] font-sans font-semibold normal-case tracking-normal opacity-70">
            tap once per athlete crossing — assign names below
          </span>
        </button>
      )}

      {/* Bottom panels */}
      {isLive && (
        <div className="grid grid-cols-1 gap-px border-t border-gryt-line bg-gryt-line md:grid-cols-2">
          {/* Finish Queue */}
          <div className="bg-gryt-black p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="gryt-heading text-lg text-white">
                Finish Queue <span className="text-gryt-light">{unassigned.length}</span>
              </h3>
              <button onClick={() => setShowManual((s) => !s)} className="gryt-btn-ghost text-xs">
                <Plus size={14} /> Manual time
              </button>
            </div>
            {showManual && (
              <ManualEntry
                event={event}
                distanceMeters={distanceMeters}
                onSaved={() => Promise.all([refetchQueue(), refetchBoard()])}
                onDone={() => setShowManual(false)}
              />
            )}
            <div className="max-h-[34vh] space-y-1.5 overflow-y-auto">
              {queue.length === 0 && <p className="py-4 text-center text-sm text-gryt-mute">Tap RECORD FINISHER as athletes cross.</p>}
              {[...queue].reverse().map((q, idx) => {
                const num = queue.length - idx;
                const assignedAthlete = q.assigned_athlete_id ? rosterRows.find((a) => a.id === q.assigned_athlete_id) : null;
                const active = selectedFinish === q.id;
                const isError = q.status === 'error';
                const isPending = q.status === 'pending';
                const selectable = !q._optimistic;
                let subtitle;
                if (isError) subtitle = '⚠ Not synced — tap retry';
                else if (isPending) subtitle = 'Syncing…';
                else if (assignedAthlete) subtitle = `✓ ${assignedAthlete.name}`;
                else subtitle = 'Unassigned — tap to assign';
                return (
                  <button
                    key={q.id}
                    onClick={() => selectable && setSelectedFinish(active ? null : q.id)}
                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                      isError
                        ? 'border-red-500/40 bg-red-500/5'
                        : isPending
                          ? 'border-amber-400/30 bg-amber-400/5'
                          : assignedAthlete
                            ? 'border-green-500/30 bg-green-500/5'
                            : active
                              ? 'border-gryt-light bg-gryt-light/10'
                              : 'border-gryt-line bg-white/[0.03] hover:border-gryt-light/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="gryt-heading text-xl text-gryt-light">#{num}</span>
                      <div>
                        <div className="font-mono text-sm text-white">{formatClock(q.timestamp_ms)}</div>
                        <div className={`text-[11px] ${isError ? 'text-red-300' : 'text-gryt-mute'}`}>{subtitle}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isError && (
                        <button
                          onClick={(e) => { e.stopPropagation(); retryFinish(q); }}
                          className="gryt-btn-ghost p-1.5 text-amber-300"
                          title="Retry sync"
                        >
                          <RefreshCw size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFinish(q); }}
                        className="gryt-btn-ghost p-1.5"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assign panel / roster */}
          <div className="bg-gryt-black p-3">
            <h3 className="gryt-heading mb-2 text-lg text-white">
              {selectedFinish ? 'Assign to…' : 'Roster'}
            </h3>
            <input
              className="gryt-input mb-2"
              placeholder="Search athlete or team…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="max-h-[30vh] space-y-1.5 overflow-y-auto">
              {filteredRoster.length === 0 && <p className="py-4 text-center text-sm text-gryt-mute">No athletes match.</p>}
              {filteredRoster.map((a) => {
                const done = assignedIds.has(a.id) || a.status === 'finished';
                return (
                  <div
                    key={a.id}
                    className={`flex items-center justify-between rounded-xl border p-2.5 ${
                      done ? 'border-gryt-line bg-white/[0.02] opacity-60' : 'border-gryt-line bg-white/[0.03]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">{a.name}</div>
                      <div className="text-[11px] text-gryt-mute">{a.team || '—'} · {a.status}</div>
                    </div>
                    {selectedFinish ? (
                      <button
                        onClick={() => assign(selectedFinish, a.id)}
                        disabled={assigning === selectedFinish}
                        className="gryt-btn-primary px-3 py-2 text-xs disabled:opacity-50"
                      >
                        {assigning === selectedFinish ? '…' : 'Assign'}
                      </button>
                    ) : (
                      a.status !== 'dnf' && (
                        <button
                          onClick={() => markDNF(event.id, a).then(() => Promise.all([refetchQueue(), refetchBoard()])).catch(() => {})}
                          className="gryt-btn-ghost p-2"
                          title="Mark DNF"
                        >
                          <Flag size={14} />
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </div>

            {/* Self-timed results visibility */}
            <div className="mt-3 border-t border-gryt-line pt-2">
              <div className="mb-1 text-[11px] uppercase tracking-widest text-gryt-mute">Live leaderboard</div>
              <div className="max-h-[18vh] space-y-1 overflow-y-auto">
                {scoreboard.filter((r) => r.rank).slice(0, 12).map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-white">
                      <span className="text-gryt-light">#{r.rank}</span> {r.athlete_name}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase ${r.source === 'self_timed' ? 'text-gryt-blue' : 'text-gryt-mute'}`}>
                        {r.source === 'self_timed' ? 'self' : r.source === 'manual' ? 'man' : 'dir'}
                      </span>
                      <span className="font-mono text-white">
                        {formatMetric(r, { units: true })}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Manual time/score entry for an athlete (no live finish tap).
function ManualEntry({ event, distanceMeters, onDone, onSaved }) {
  const { data: roster } = useAsyncStore(() => getEventRoster(event.id), [event.id]);
  const rosterRows = roster || [];
  const [athleteId, setAthleteId] = useState('');
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const isTime = event.scoring_method === 'Fastest Time';
  const fieldLabel = metricFieldLabel(event.scoring_method);

  async function submit(e) {
    e.preventDefault();
    const athlete = rosterRows.find((a) => a.id === athleteId);
    if (!athlete || saving) return;
    const payload = {
      event_id: event.id,
      athlete_id: athlete.id,
      athlete_name: athlete.name,
      team: athlete.team,
      source: 'manual',
      status: 'finished',
    };
    if (isTime) {
      payload.final_time_seconds = parseTimeToSeconds(value);
      payload.distance_meters = distanceMeters || null;
    } else if (event.scoring_method === 'Most Reps') payload.reps = parseFloat(value) || 0;
    else if (event.scoring_method === 'Most Rounds') payload.rounds = parseFloat(value) || 0;
    else if (event.scoring_method === 'Longest Distance') payload.distance_meters = parseFloat(value) || 0;
    else payload.score = parseFloat(value) || 0;
    setSaving(true);
    try {
      await saveResult(payload);
      setAthleteId('');
      setValue('');
      onSaved?.();
      onDone?.();
    } catch (err) {
      window.alert(err?.message || 'Could not save result.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mb-2 flex flex-wrap items-end gap-2 rounded-xl border border-gryt-line bg-white/[0.03] p-2">
      <select className="gryt-input flex-1" value={athleteId} onChange={(e) => setAthleteId(e.target.value)}>
        <option value="">Select athlete…</option>
        {rosterRows.map((a) => (
          <option key={a.id} value={a.id}>{a.name}{a.team ? ` (${a.team})` : ''}</option>
        ))}
      </select>
      <input className="gryt-input w-28" placeholder={fieldLabel} value={value} onChange={(e) => setValue(e.target.value)} />
      <button type="submit" className="gryt-btn-primary" disabled={!athleteId || !value || saving}>{saving ? '…' : 'Save'}</button>
    </form>
  );
}
