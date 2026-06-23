import { Link } from 'react-router-dom';
import { Activity, MonitorPlay, QrCode, Timer, Trophy, Users } from 'lucide-react';
import { Shell, Tagline, StatusBadge } from '../components/Brand.jsx';
import { useAsyncStore } from '../lib/hooks.js';
import { getEvents, subscribeAll } from '../lib/storage.js';
import { formatEventDate } from '../lib/format.js';

const FEATURES = [
  { icon: QrCode, title: 'Join by QR', body: 'Athletes register in under 30 seconds. No login, no email.' },
  { icon: Timer, title: 'Finish Queue timing', body: 'Rapid-tap finishers, assign names after. Built for pack finishes.' },
  { icon: MonitorPlay, title: 'TV scoreboard', body: 'Broadcast-ready live leaderboard for the projector or finish line.' },
  { icon: Trophy, title: 'PROOF OF GRYT', body: 'Every finisher walks away with a shareable branded stat card.' },
];

export default function Home() {
  const { data } = useAsyncStore(() => getEvents(), [], { subscribe: subscribeAll });
  const events = (data || []).filter((e) => e.is_public).slice(0, 4);

  return (
    <Shell>
      <section className="pt-6 text-center">
        <p className="gryt-heading text-sm tracking-[0.3em] text-gryt-light">RACE DAY OPERATING SYSTEM</p>
        <h1 className="gryt-heading mt-3 text-5xl leading-[0.95] text-white sm:text-6xl">
          iGRYT <span className="text-gryt-light">EVENT TIMER</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-gryt-mute">
          Create an event, athletes join via QR, results feed a live scoreboard, and every finisher
          gets a PROOF OF GRYT card.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/admin" className="gryt-btn-primary w-full sm:w-auto">
            <Activity size={18} /> Organizer Dashboard
          </Link>
          <Link to="/scoreboard/saturday-gryt-5k" className="gryt-btn-secondary w-full sm:w-auto">
            <MonitorPlay size={18} /> See a live scoreboard
          </Link>
        </div>
      </section>

      <section className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="gryt-card p-5">
            <f.icon className="text-gryt-light" size={24} />
            <h3 className="gryt-heading mt-3 text-xl text-white">{f.title}</h3>
            <p className="mt-1 text-sm text-gryt-mute">{f.body}</p>
          </div>
        ))}
      </section>

      {events.length > 0 && (
        <section className="mt-12">
          <h2 className="gryt-heading mb-3 flex items-center gap-2 text-2xl text-white">
            <Users size={20} className="text-gryt-light" /> Public events
          </h2>
          <div className="space-y-2">
            {events.map((e) => (
              <Link
                key={e.id}
                to={`/event/${e.slug}`}
                className="gryt-card flex items-center justify-between p-4 transition hover:border-gryt-light/40"
              >
                <div>
                  <div className="font-semibold text-white">{e.name}</div>
                  <div className="text-xs text-gryt-mute">
                    {formatEventDate(e.date, e.start_time)} · {e.location || 'TBD'}
                  </div>
                </div>
                <StatusBadge status={e.status} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-16 text-center">
        <Tagline className="text-xs" />
        <p className="mt-2 text-xs text-gryt-mute">@grytclub</p>
      </div>
    </Shell>
  );
}
