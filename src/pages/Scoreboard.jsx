import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Maximize2 } from 'lucide-react';
import { Tagline } from '../components/Brand.jsx';
import { MasterClock } from '../components/RaceClock.jsx';
import { useStore, useWakeLock } from '../lib/hooks.js';
import { getEventBySlug, getScoreboard } from '../lib/storage.js';
import { formatTime, formatPace, formatMetric, scoringMetricLabel } from '../lib/format.js';

const MEDAL = ['', 'text-yellow-300', 'text-slate-300', 'text-amber-600'];
const MEDAL_BG = ['', 'bg-yellow-300/10', 'bg-slate-300/10', 'bg-amber-600/10'];

export default function Scoreboard() {
  const { slug } = useParams();
  const event = useStore(() => getEventBySlug(slug), [slug]);
  const results = useStore(() => (event ? getScoreboard(event.id) : []), [slug, event?.id]);
  useWakeLock(true);

  const [sortKey, setSortKey] = useState('rank'); // rank | time | name
  const [teamFilter, setTeamFilter] = useState('all');
  const scrollRef = useRef(null);
  const seenRef = useRef(new Set());
  const [glow, setGlow] = useState(new Set());

  const teams = useMemo(
    () => Array.from(new Set(results.map((r) => r.team).filter(Boolean))),
    [results]
  );

  const rows = useMemo(() => {
    let list = results.filter((r) => r.status !== 'dnf');
    if (teamFilter !== 'all') list = list.filter((r) => r.team === teamFilter);
    if (sortKey === 'name') list = [...list].sort((a, b) => a.athlete_name.localeCompare(b.athlete_name));
    else if (sortKey === 'time')
      list = [...list].sort((a, b) => (a.final_time_seconds ?? Infinity) - (b.final_time_seconds ?? Infinity));
    // 'rank' keeps calculateRankings order
    return list;
  }, [results, sortKey, teamFilter]);

  // Glow on newly arriving results.
  useEffect(() => {
    const next = new Set();
    results.forEach((r) => {
      if (!seenRef.current.has(r.id)) next.add(r.id);
      seenRef.current.add(r.id);
    });
    if (next.size) {
      setGlow(next);
      const t = setTimeout(() => setGlow(new Set()), 1200);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [results]);

  // Auto-scroll: hold at top, then drift down, loop. Only when 10+ rows.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || rows.length < 10) return undefined;
    let dir = 1;
    let paused = 5; // initial hold in seconds-ish
    const iv = setInterval(() => {
      if (paused > 0) {
        paused -= 0.05;
        return;
      }
      el.scrollTop += dir * 1.1;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
        paused = 4;
        dir = -1;
      } else if (el.scrollTop <= 0) {
        paused = 4;
        dir = 1;
      }
    }, 30);
    return () => clearInterval(iv);
  }, [rows.length]);

  function goFull() {
    const el = document.documentElement;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.();
  }

  if (!event) {
    return <div className="flex min-h-screen items-center justify-center text-gryt-mute">Event not found.</div>;
  }

  const metricLabel = scoringMetricLabel(event.scoring_method);

  return (
    <div className="gryt-noise relative flex h-screen flex-col overflow-hidden bg-gryt-black">
      <div className="gryt-slashes pointer-events-none absolute inset-0" />

      {/* Header with clock */}
      <header className="relative z-10 flex items-center justify-between border-b border-gryt-line px-6 py-4 sm:px-10">
        <div>
          <div className="text-xs uppercase tracking-[0.4em] text-gryt-light">iGRYT Live</div>
          <h1 className="gryt-heading text-4xl leading-none text-white sm:text-6xl">{event.name}</h1>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.4em] text-gryt-mute">
            {event.status === 'live' ? 'Race Clock' : event.status === 'finished' ? 'Final' : 'Standby'}
          </div>
          {event.status === 'live' ? (
            <MasterClock
              startedAt={event.started_at}
              className="gryt-heading animate-pulseClock font-mono text-4xl text-white tabular sm:text-6xl"
            />
          ) : (
            <div className="gryt-heading font-mono text-4xl text-white tabular sm:text-6xl">
              {formatTime(rows[0]?.final_time_seconds ?? 0)}
            </div>
          )}
        </div>
      </header>

      {/* Filters */}
      <div className="relative z-10 flex items-center justify-end gap-2 px-6 py-2 text-xs sm:px-10">
        <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="rounded-lg border border-gryt-line bg-black/40 px-2 py-1 text-white">
          <option value="all">All teams</option>
          {teams.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="rounded-lg border border-gryt-line bg-black/40 px-2 py-1 text-white">
          <option value="rank">Sort: Rank</option>
          <option value="time">Sort: Time</option>
          <option value="name">Sort: Name</option>
        </select>
        <button onClick={goFull} className="gryt-btn-ghost p-1.5" title="Fullscreen (or press F11)">
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Leaderboard */}
      <div ref={scrollRef} className="no-scrollbar relative z-10 flex-1 overflow-y-auto px-4 sm:px-10">
        {/* column header */}
        <div className="sticky top-0 z-10 grid grid-cols-[64px,1fr,auto] items-center gap-3 bg-gryt-black/95 py-2 text-[11px] uppercase tracking-widest text-gryt-mute sm:grid-cols-[80px,1fr,140px,140px]">
          <span>Rank</span>
          <span>Athlete</span>
          <span className="hidden text-right sm:block">Pace</span>
          <span className="text-right">{metricLabel}</span>
        </div>

        {rows.length === 0 && (
          <div className="py-20 text-center text-2xl text-gryt-mute">Awaiting finishers…</div>
        )}

        {rows.map((r) => (
          <div
            key={r.id}
            className={`grid grid-cols-[64px,1fr,auto] items-center gap-3 rounded-xl border-b border-gryt-line/40 py-3 sm:grid-cols-[80px,1fr,140px,140px] ${
              sortKey === 'rank' && r.rank <= 3 ? MEDAL_BG[r.rank] : ''
            } ${glow.has(r.id) ? 'animate-glowIn border border-gryt-light/60' : ''}`}
          >
            <span className={`gryt-heading text-4xl sm:text-5xl ${sortKey === 'rank' && r.rank <= 3 ? MEDAL[r.rank] : 'text-gryt-light'}`}>
              {sortKey === 'rank' ? r.rank : '·'}
            </span>
            <div className="min-w-0">
              <div className="gryt-heading truncate text-2xl text-white sm:text-4xl">{r.athlete_name}</div>
              <div className="text-xs uppercase tracking-widest text-gryt-mute">{r.team || '—'}</div>
            </div>
            <div className="hidden text-right font-mono text-lg text-gryt-mute sm:block">
              {r.final_time_seconds && r.distance_meters ? formatPace(r.final_time_seconds, r.distance_meters) : '—'}
            </div>
            <div className="gryt-heading text-right font-mono text-3xl text-white sm:text-4xl">{formatMetric(r)}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="relative z-10 flex items-center justify-between border-t border-gryt-line px-6 py-3 sm:px-10">
        <Tagline className="text-xs sm:text-sm" />
        <span className="text-xs text-gryt-mute">@grytclub</span>
        <Link to={`/event/${slug}`} className="text-xs text-gryt-light hover:underline">join →</Link>
      </footer>

      <span className="pointer-events-none absolute bottom-2 right-3 z-10 gryt-heading text-xs tracking-widest text-white/20">
        GRYT CLUB
      </span>
    </div>
  );
}
