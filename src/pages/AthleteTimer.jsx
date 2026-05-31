import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Play, Pause, Square, Flag, ArrowLeft } from 'lucide-react';
import { Logo, Tagline } from '../components/Brand.jsx';
import { useStore, useWakeLock } from '../lib/hooks.js';
import { primeAudio } from '../lib/sound.js';
import { getEventBySlug, getEventRoster, registerAthlete, saveResult } from '../lib/storage.js';
import { formatClock, parseDistanceMeters } from '../lib/format.js';

export default function AthleteTimer() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const event = useStore(() => getEventBySlug(slug), [slug]);
  const roster = useStore(() => (event ? getEventRoster(event.id) : []), [slug, event?.id]);
  useWakeLock(true);

  const athleteId = params.get('athlete');
  const athlete = athleteId ? roster.find((a) => a.id === athleteId) : null;

  const [name, setName] = useState('');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState([]);
  const startRef = useRef(0);
  const baseRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!running) return undefined;
    const tick = () => {
      setElapsed(baseRef.current + (Date.now() - startRef.current));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  if (!event) {
    return <div className="flex min-h-screen items-center justify-center text-gryt-mute">Event not found.</div>;
  }

  function start() {
    primeAudio();
    startRef.current = Date.now();
    setRunning(true);
  }
  function pause() {
    baseRef.current = elapsed;
    setRunning(false);
  }
  function lap() {
    setLaps((l) => [...l, elapsed]);
  }
  function reset() {
    setRunning(false);
    setElapsed(0);
    baseRef.current = 0;
    setLaps([]);
  }

  function stopAndSave() {
    setRunning(false);
    const finalSeconds = elapsed / 1000;
    let resolved = athlete;
    if (!resolved) {
      if (!name.trim()) return;
      resolved = registerAthlete(event.id, { name });
    }
    const splits = laps.map((l, i) => ({ lap: i + 1, time_seconds: l / 1000 }));
    const result = saveResult({
      event_id: event.id,
      athlete_id: resolved.id,
      athlete_name: resolved.name,
      team: resolved.team,
      final_time_seconds: finalSeconds,
      distance_meters: parseDistanceMeters(event.distance_target),
      splits,
      source: 'self_timed',
      status: 'finished',
    });
    navigate(`/result/${result.id}`);
  }

  const needsName = !athlete;

  return (
    <div className="relative flex min-h-screen flex-col bg-gryt-black">
      <header className="flex items-center justify-between px-4 py-3">
        <Link to={`/event/${slug}`} className="gryt-btn-ghost p-2"><ArrowLeft size={18} /></Link>
        <Logo to={null} size="sm" />
        <span className="w-9" />
      </header>

      <div className="px-4 text-center">
        <div className="text-[11px] uppercase tracking-[0.4em] text-gryt-mute">{event.name}</div>
        {athlete && <div className="mt-1 text-sm text-gryt-light">{athlete.name}</div>}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="gryt-heading font-mono text-[22vw] leading-none text-white tabular sm:text-[16vw]">
          {formatClock(elapsed)}
        </div>

        {needsName && elapsed === 0 && (
          <input
            className="gryt-input mt-4 max-w-xs text-center"
            placeholder="Your name (to save result)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <div className="mt-8 flex items-center gap-4">
          {!running ? (
            <button onClick={start} className="flex h-28 w-28 items-center justify-center rounded-full bg-gryt-light text-black active:scale-95">
              <Play size={44} fill="currentColor" />
            </button>
          ) : (
            <button onClick={pause} className="flex h-28 w-28 items-center justify-center rounded-full bg-gryt-blue text-white active:scale-95">
              <Pause size={44} fill="currentColor" />
            </button>
          )}
          <button
            onClick={lap}
            disabled={!running}
            className="flex h-20 w-20 items-center justify-center rounded-full border border-gryt-line bg-white/5 text-white active:scale-95 disabled:opacity-30"
          >
            <Flag size={26} />
          </button>
          <button
            onClick={stopAndSave}
            disabled={elapsed === 0 || (needsName && !name.trim())}
            className="flex h-20 w-20 items-center justify-center rounded-full border border-red-500/40 bg-red-500/10 text-red-300 active:scale-95 disabled:opacity-30"
            title="Stop & save"
          >
            <Square size={24} fill="currentColor" />
          </button>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-gryt-mute">
          <button onClick={reset} className="hover:text-white">Reset</button>
          {elapsed > 0 && !running && (
            <button onClick={stopAndSave} disabled={needsName && !name.trim()} className="font-bold text-gryt-light disabled:opacity-40">
              Save Result →
            </button>
          )}
        </div>

        {laps.length > 0 && (
          <div className="mt-6 w-full max-w-xs space-y-1">
            {laps.map((l, i) => (
              <div key={i} className="flex justify-between border-b border-gryt-line/50 py-1 text-sm">
                <span className="text-gryt-mute">Lap {i + 1}</span>
                <span className="font-mono text-white">{formatClock(l - (laps[i - 1] || 0))}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pb-6 text-center"><Tagline className="text-[10px]" /></div>
    </div>
  );
}
