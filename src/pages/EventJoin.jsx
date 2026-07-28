import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, MonitorPlay, ArrowRight } from 'lucide-react';
import { Shell, StatusBadge, Tagline, LoadingState, ErrorState } from '../components/Brand.jsx';
import { useAsyncStore } from '../lib/hooks.js';
import { getEventBySlug, getEventRoster, registerAthlete, subscribeToEvent } from '../lib/storage.js';
import { formatEventDate } from '../lib/format.js';

export default function EventJoin() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: event, loading, error, refetch } = useAsyncStore(() => getEventBySlug(slug), [slug]);
  const { data: roster } = useAsyncStore(
    () => (event ? getEventRoster(event.id) : Promise.resolve([])),
    [event?.id],
    event ? { subscribe: (cb) => subscribeToEvent(event.id, cb) } : {}
  );

  const [step, setStep] = useState('preview'); // preview | register | done
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [athlete, setAthlete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [joinError, setJoinError] = useState(null);

  if (loading && event === undefined) {
    return <Shell><LoadingState label="Loading event" /></Shell>;
  }
  if (error) {
    return <Shell><ErrorState error={error} onRetry={refetch} label="Couldn't load event" /></Shell>;
  }
  if (event === null) {
    return (
      <Shell>
        <p className="mt-12 text-center text-gryt-mute">Event not found.</p>
      </Shell>
    );
  }

  const selfAllowed = event.timing_mode === 'Self-Timed' || event.timing_mode === 'Hybrid';

  async function join(e) {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    setJoinError(null);
    try {
      // A stable per-device token prevents duplicate athletes on refresh/rejoin.
      const tokenKey = `igryt.athlete_token.${event.id}`;
      let token = localStorage.getItem(tokenKey);
      if (!token) {
        token = `tok_${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
        localStorage.setItem(tokenKey, token);
      }
      const a = await registerAthlete(event.id, { name, team, session_token: token });
      setAthlete(a);
      setStep('done');
    } catch (err) {
      setJoinError(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Shell>
      {step === 'preview' && (
        <div className="pt-4">
          <div className="text-center">
            <StatusBadge status={event.status} />
            <h1 className="gryt-heading mt-3 text-5xl leading-[0.95] text-white">{event.name}</h1>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-gryt-mute">
              <span className="flex items-center gap-1.5"><Calendar size={15} /> {formatEventDate(event.date, event.start_time) || 'TBD'}</span>
              {event.location && <span className="flex items-center gap-1.5"><MapPin size={15} /> {event.location}</span>}
              <span className="flex items-center gap-1.5"><Users size={15} /> {roster?.length ?? 0} registered</span>
            </div>
            <p className="mt-3 inline-block rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-gryt-light">
              {event.challenge_type} · {event.scoring_method}
              {event.distance_target ? ` · ${event.distance_target}` : ''}
            </p>
          </div>

          {event.instructions && (
            <div className="gryt-card mt-6 p-4 text-sm text-gray-300">{event.instructions}</div>
          )}

          <div className="mt-8 space-y-3">
            <button onClick={() => setStep('register')} className="gryt-btn-primary w-full py-4 text-lg">
              JOIN EVENT
            </button>
            <Link to={`/scoreboard/${slug}`} className="gryt-btn-secondary w-full">
              <MonitorPlay size={16} /> View Scoreboard
            </Link>
          </div>
          <div className="mt-12 text-center"><Tagline className="text-[10px]" /></div>
        </div>
      )}

      {step === 'register' && (
        <form onSubmit={join} className="pt-10">
          <h1 className="gryt-heading text-center text-4xl text-white">Quick Check-In</h1>
          <p className="mt-1 text-center text-sm text-gryt-mute">No login. No email. Under 30 seconds.</p>
          <div className="gryt-card mt-6 space-y-4 p-5">
            <div>
              <label className="gryt-label">Name</label>
              <input className="gryt-input text-lg" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoFocus />
            </div>
            <div>
              <label className="gryt-label">Team / group (optional)</label>
              <input className="gryt-input" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="North Shore" />
            </div>
          </div>
          {joinError && (
            <p className="mt-3 text-center text-sm text-red-400">
              {joinError.message || 'Could not check you in. Try again.'}
            </p>
          )}
          <button type="submit" className="gryt-btn-primary mt-5 w-full py-4 text-lg" disabled={!name.trim() || saving}>
            {saving ? 'CHECKING IN…' : "I'M IN — LET'S GO"}
          </button>
          <button type="button" onClick={() => setStep('preview')} className="gryt-btn-ghost mt-2 w-full" disabled={saving}>
            Back
          </button>
        </form>
      )}

      {step === 'done' && athlete && (
        <div className="pt-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gryt-light/15 text-3xl">✓</div>
          <h1 className="gryt-heading mt-5 text-4xl text-white">You're in, {athlete.name.split(' ')[0]}.</h1>
          {selfAllowed ? (
            <>
              <p className="mt-2 text-gryt-mute">When you're ready, start the work.</p>
              <button
                onClick={() => navigate(`/timer/${slug}?athlete=${athlete.id}`)}
                className="gryt-btn-primary mt-7 w-full py-4 text-lg"
              >
                START THE WORK <ArrowRight size={18} />
              </button>
            </>
          ) : (
            <p className="mt-3 text-lg text-gryt-light">You're registered. Listen for GO.</p>
          )}
          <Link to={`/scoreboard/${slug}`} className="gryt-btn-secondary mt-3 w-full">
            <MonitorPlay size={16} /> View Live Scoreboard
          </Link>
          <div className="mt-12"><Tagline className="text-[10px]" /></div>
        </div>
      )}
    </Shell>
  );
}
