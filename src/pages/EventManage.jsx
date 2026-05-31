import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Copy, Check, Timer, MonitorPlay, Trash2, UserPlus, Flag, Pencil, CheckCircle2 } from 'lucide-react';
import { Shell, StatusBadge, Tagline } from '../components/Brand.jsx';
import { QRCode } from '../components/QRCode.jsx';
import { useStore, useCopy } from '../lib/hooks.js';
import {
  getEventBySlug,
  getEventRoster,
  getScoreboard,
  registerAthlete,
  deleteAthlete,
  deleteResult,
  finishEvent,
  markDNF,
} from '../lib/storage.js';
import { formatEventDate, formatTime, formatPace } from '../lib/format.js';

function originUrl(path) {
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path}`;
}

const ROSTER_STATUS = {
  registered: 'text-gryt-mute',
  started: 'text-gryt-light',
  finished: 'text-green-400',
  dnf: 'text-red-400',
};

export default function EventManage() {
  const { slug } = useParams();
  const event = useStore(() => getEventBySlug(slug), [slug]);
  const roster = useStore(() => (event ? getEventRoster(event.id) : []), [slug, event?.id]);
  const scoreboard = useStore(() => (event ? getScoreboard(event.id) : []), [slug, event?.id]);
  const { copied, copy } = useCopy();
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');

  const joinUrl = useMemo(() => originUrl(`/event/${slug}`), [slug]);
  const boardUrl = useMemo(() => originUrl(`/scoreboard/${slug}`), [slug]);

  if (!event) {
    return (
      <Shell>
        <p className="mt-12 text-center text-gryt-mute">Event not found.</p>
        <div className="mt-4 text-center">
          <Link to="/admin" className="gryt-btn-secondary">Back to dashboard</Link>
        </div>
      </Shell>
    );
  }

  function addWalkup(e) {
    e.preventDefault();
    if (!name.trim()) return;
    registerAthlete(event.id, { name, team });
    setName('');
    setTeam('');
  }

  function markFinished() {
    if (window.confirm('Lock final rankings and issue PROOF OF GRYT cards for all finishers?')) {
      finishEvent(event.id);
    }
  }

  const rankByAthlete = Object.fromEntries(
    scoreboard.filter((r) => r.athlete_id).map((r) => [r.athlete_id, r])
  );

  return (
    <Shell max="max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="gryt-heading text-4xl text-white">{event.name}</h1>
            <StatusBadge status={event.status} />
          </div>
          <p className="mt-1 text-sm text-gryt-mute">
            {formatEventDate(event.date, event.start_time)} · {event.location || 'No location'}
          </p>
          <p className="mt-1 text-xs text-gryt-mute">
            {event.challenge_type} · {event.scoring_method} · {event.timing_mode}
            {event.distance_target ? ` · ${event.distance_target}` : ''}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/admin/time/${slug}`} className="gryt-btn-primary text-xs">
          <Timer size={15} /> Open Timing Station
        </Link>
        <Link to={`/scoreboard/${slug}`} className="gryt-btn-secondary text-xs">
          <MonitorPlay size={15} /> Scoreboard
        </Link>
        {event.status !== 'finished' && (
          <button onClick={markFinished} className="gryt-btn-secondary text-xs">
            <CheckCircle2 size={15} /> Mark Finished
          </button>
        )}
      </div>

      {/* Join + share */}
      <section className="gryt-card mt-6 grid grid-cols-1 gap-6 p-5 sm:grid-cols-[auto,1fr]">
        <div className="flex justify-center">
          <QRCode value={joinUrl} downloadName={`${slug}-qr.png`} size={200} />
        </div>
        <div className="space-y-3">
          <div>
            <span className="gryt-label">Event code</span>
            <div className="gryt-heading text-3xl tracking-[0.3em] text-gryt-light">{event.event_code}</div>
          </div>
          <ShareRow label="Join URL" value={joinUrl} onCopy={() => copy(joinUrl, 'join')} copied={copied === 'join'} />
          <ShareRow label="Scoreboard URL" value={boardUrl} onCopy={() => copy(boardUrl, 'board')} copied={copied === 'board'} />
          <p className="text-xs text-gryt-mute">Athletes scan the QR or open the join URL — no login required.</p>
        </div>
      </section>

      {/* Roster */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="gryt-heading text-2xl text-white">Roster ({roster.length})</h2>
        </div>
        <form onSubmit={addWalkup} className="gryt-card mb-3 flex flex-wrap items-end gap-2 p-3">
          <div className="min-w-[140px] flex-1">
            <label className="gryt-label">Walk-up name</label>
            <input className="gryt-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Add athlete" />
          </div>
          <div className="min-w-[120px] flex-1">
            <label className="gryt-label">Team</label>
            <input className="gryt-input" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Optional" />
          </div>
          <button type="submit" className="gryt-btn-primary" disabled={!name.trim()}>
            <UserPlus size={16} /> Add
          </button>
        </form>

        <div className="gryt-card divide-y divide-gryt-line/60">
          {roster.length === 0 && <div className="p-4 text-sm text-gryt-mute">No athletes registered yet.</div>}
          {roster.map((a) => {
            const res = rankByAthlete[a.id];
            return (
              <div key={a.id} className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <div className="truncate font-medium text-white">{a.name}</div>
                  <div className="text-xs text-gryt-mute">
                    {a.team || '—'} · <span className={ROSTER_STATUS[a.status]}>{a.status}</span>
                    {res?.rank ? ` · #${res.rank}` : ''}
                    {res?.final_time_seconds != null ? ` · ${formatTime(res.final_time_seconds)}` : ''}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  {a.status !== 'dnf' && (
                    <button onClick={() => markDNF(event.id, a)} className="gryt-btn-ghost p-2 text-xs" title="Mark DNF">
                      <Flag size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm(`Remove ${a.name} from this event?`)) deleteAthlete(a.id);
                    }}
                    className="gryt-btn-ghost p-2 text-xs"
                    title="Remove"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Results */}
      <section className="mt-8">
        <h2 className="gryt-heading mb-3 text-2xl text-white">Results ({scoreboard.length})</h2>
        <div className="gryt-card divide-y divide-gryt-line/60">
          {scoreboard.length === 0 && <div className="p-4 text-sm text-gryt-mute">No results yet.</div>}
          {scoreboard.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-2 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="gryt-heading w-8 text-center text-xl text-gryt-light">
                  {r.status === 'dnf' ? 'DNF' : `#${r.rank}`}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-medium text-white">{r.athlete_name}</div>
                  <div className="text-xs text-gryt-mute">
                    {r.team || '—'} · {r.source.replace('_', '-')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-mono text-sm text-white">
                    {r.final_time_seconds != null
                      ? formatTime(r.final_time_seconds)
                      : r.rounds != null
                        ? `${r.rounds} rds`
                        : r.reps != null
                          ? `${r.reps} reps`
                          : r.score != null
                            ? `${r.score} pts`
                            : '—'}
                  </div>
                  {r.distance_meters && r.final_time_seconds ? (
                    <div className="text-[11px] text-gryt-mute">{formatPace(r.final_time_seconds, r.distance_meters)}</div>
                  ) : null}
                </div>
                <Link to={`/result/${r.id}`} className="gryt-btn-ghost p-2" title="View card">
                  <Pencil size={15} />
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this result?')) deleteResult(r.id);
                  }}
                  className="gryt-btn-ghost p-2"
                  title="Delete result"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12 text-center">
        <Tagline className="text-[10px]" />
      </div>
    </Shell>
  );
}

function ShareRow({ label, value, onCopy, copied }) {
  return (
    <div>
      <span className="gryt-label">{label}</span>
      <div className="flex items-center gap-2">
        <input readOnly value={value} className="gryt-input flex-1 text-xs" onFocus={(e) => e.target.select()} />
        <button onClick={onCopy} className="gryt-btn-secondary shrink-0 px-3 py-3">
          {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}
