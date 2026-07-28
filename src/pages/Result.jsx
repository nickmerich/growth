import { forwardRef, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { Download, Copy, Check, MonitorPlay, ArrowLeft } from 'lucide-react';
import { Shell, LoadingState, ErrorState } from '../components/Brand.jsx';
import { useAsyncStore, useCopy } from '../lib/hooks.js';
import { getResultById, getEventById, getScoreboard, subscribeToEvent } from '../lib/storage.js';
import { formatTime, formatPace, formatEventDate, formatMetric } from '../lib/format.js';

const VARIANTS = [
  ['FINISHER', 'finisher'],
  ['LEADERBOARD', 'leaderboard'],
  ['PR', 'pr'],
];

export default function Result() {
  const { id } = useParams();
  const { data: result, loading: resultLoading, error: resultError, refetch } = useAsyncStore(
    () => getResultById(id),
    [id]
  );
  const { data: event } = useAsyncStore(
    () => (result ? getEventById(result.event_id) : Promise.resolve(null)),
    [result?.event_id]
  );
  // Rank derives from the same getScoreboard/calculateRankings path as Scoreboard.
  const { data: scoreboard } = useAsyncStore(
    () => (result ? getScoreboard(result.event_id) : Promise.resolve([])),
    [result?.event_id],
    result ? { subscribe: (cb) => subscribeToEvent(result.event_id, cb) } : {}
  );
  const { copied, copy } = useCopy();
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [variant, setVariant] = useState('finisher');

  const ranked = useMemo(() => (scoreboard || []).find((r) => r.id === id), [scoreboard, id]);
  const rank = ranked?.rank ?? result?.rank ?? null;
  const isPodium = event?.status === 'finished' && rank && rank <= 3;

  if ((resultLoading && result === undefined) || (result && event === undefined)) {
    return <Shell><LoadingState label="Loading result" /></Shell>;
  }
  if (resultError) {
    return <Shell><ErrorState error={resultError} onRetry={refetch} label="Couldn't load result" /></Shell>;
  }
  if (result === null || event === null) {
    return (
      <Shell>
        <p className="mt-12 text-center text-gryt-mute">Result not found.</p>
        <div className="mt-4 text-center"><Link to="/" className="gryt-btn-secondary">Home</Link></div>
      </Shell>
    );
  }

  const effectiveVariant = isPodium ? 'podium' : variant;
  const timeStr = result.final_time_seconds != null ? formatTime(result.final_time_seconds) : null;
  const paceStr = result.final_time_seconds && result.distance_meters
    ? formatPace(result.final_time_seconds, result.distance_meters)
    : null;
  const metricStr = formatMetric(result, { units: true, upper: true });

  const shareText = `I showed up and did the work.\n\n${result.athlete_name} — ${event.name}\n${timeStr ? `Time: ${timeStr}` : `Result: ${metricStr}`}${rank ? `\nRank: #${rank}` : ''}\n\nDO HARD THINGS TOGETHER.`;

  async function download() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0A0A0A',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `proof-of-gryt-${result.athlete_name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Shell>
      <Link to={`/scoreboard/${event.slug}`} className="gryt-btn-ghost mb-2 inline-flex"><ArrowLeft size={16} /> Scoreboard</Link>

      {/* Result summary */}
      <div className="gryt-card p-5 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-gryt-light">{event.name}</div>
        <h1 className="gryt-heading mt-1 text-4xl text-white">{result.athlete_name}</h1>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Result" value={metricStr} />
          <Stat label="Rank" value={rank ? `#${rank}` : '—'} />
          <Stat label="Pace" value={paceStr || '—'} />
        </div>
        {result.splits?.length > 0 && (
          <div className="mt-3 text-xs text-gryt-mute">{result.splits.length} split{result.splits.length === 1 ? '' : 's'} recorded</div>
        )}
      </div>

      {/* Variant switch (hidden if locked to podium) */}
      {!isPodium && (
        <div className="mt-5 flex justify-center gap-2">
          {VARIANTS.map(([label, key]) => (
            <button
              key={key}
              onClick={() => setVariant(key)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition ${
                variant === key ? 'bg-gryt-light text-black' : 'border border-gryt-line text-gryt-mute hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Share card preview (9:16) */}
      <div className="mt-5 flex justify-center">
        <div className="w-full max-w-[320px]">
          <ProofCard
            ref={cardRef}
            variant={effectiveVariant}
            result={result}
            event={event}
            rank={rank}
            metricStr={metricStr}
            paceStr={paceStr}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 space-y-2">
        <button onClick={download} disabled={downloading} className="gryt-btn-primary w-full py-3">
          <Download size={18} /> {downloading ? 'Rendering…' : 'Download Card (PNG)'}
        </button>
        <button onClick={() => copy(shareText, 'text')} className="gryt-btn-secondary w-full">
          {copied === 'text' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />} Copy Share Text
        </button>
        <Link to={`/scoreboard/${event.slug}`} className="gryt-btn-ghost w-full">
          <MonitorPlay size={16} /> Back to Scoreboard
        </Link>
      </div>
    </Shell>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-black/30 py-3">
      <div className="gryt-heading text-2xl text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-gryt-mute">{label}</div>
    </div>
  );
}

const VARIANT_TITLE = {
  finisher: 'PROOF OF GRYT',
  leaderboard: 'PROOF OF GRYT',
  pr: 'PERSONAL BEST',
  podium: 'PODIUM FINISH',
};

// 9:16 share card. Inline styles where html2canvas needs deterministic output.
const ProofCard = forwardRef(function ProofCard(
  { variant, result, event, rank, metricStr, paceStr },
  ref
) {
  const accent = '#8CC8F0';
  const showRankBig = variant === 'leaderboard' || variant === 'podium';
  return (
    <div
      ref={ref}
      className="gryt-slashes relative overflow-hidden rounded-2xl border border-gryt-line"
      style={{ aspectRatio: '9 / 16', backgroundColor: '#0A0A0A' }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 60% at 50% 0%, rgba(70,130,180,0.25), transparent 60%)' }}
      />
      <div className="relative flex h-full flex-col justify-between p-6 text-center">
        {/* top */}
        <div>
          <div className="gryt-heading text-xl tracking-widest text-white">
            i<span style={{ color: accent }}>GRYT</span> CLUB
          </div>
          <div
            className="mt-3 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em]"
            style={{ backgroundColor: 'rgba(140,200,240,0.15)', color: accent }}
          >
            {VARIANT_TITLE[variant]}
          </div>
        </div>

        {/* middle */}
        <div className="-mt-4">
          <div className="gryt-heading text-[13vw] leading-[0.9] text-white" style={{ fontSize: '2.6rem' }}>
            {result.athlete_name}
          </div>
          <div className="mt-1 text-xs uppercase tracking-widest" style={{ color: accent }}>
            {event.name}
          </div>

          {showRankBig && rank ? (
            <div className="mt-5">
              <div className="gryt-heading leading-none text-white" style={{ fontSize: '5rem', color: accent }}>
                #{rank}
              </div>
              <div className="mt-1 font-mono text-2xl text-white">{metricStr}</div>
            </div>
          ) : (
            <div className="mt-5">
              <div className="gryt-heading font-mono leading-none text-white" style={{ fontSize: '4rem' }}>
                {metricStr}
              </div>
              {rank ? <div className="mt-2 text-sm text-gryt-mute">Rank #{rank}</div> : null}
            </div>
          )}

          <div className="mt-4 flex justify-center gap-5 text-xs text-gryt-mute">
            {paceStr && <span>{paceStr}</span>}
            <span>{formatEventDate(event.date, event.start_time)}</span>
          </div>
        </div>

        {/* bottom */}
        <div>
          <div className="gryt-heading text-sm tracking-[0.25em]" style={{ color: accent }}>
            DO HARD THINGS TOGETHER.
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-widest text-gryt-mute">
            Powered by GRYT Club · @grytclub
          </div>
        </div>
      </div>
    </div>
  );
});
