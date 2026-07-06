import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Settings2, MonitorPlay, Timer, X } from 'lucide-react';
import { Shell, StatusBadge } from '../components/Brand.jsx';
import { useStore } from '../lib/hooks.js';
import { getEvents, createEvent, slugify } from '../lib/storage.js';
import { formatEventDate } from '../lib/format.js';

const CHALLENGE_TYPES = ['Run', 'Time Trial', 'AMRAP', 'EMOM', 'Strength Circuit', 'Custom'];
const SCORING_METHODS = ['Fastest Time', 'Most Reps', 'Most Rounds', 'Longest Distance', 'Custom Points'];
const TIMING_MODES = [
  ['Self-Timed', 'Athletes time themselves'],
  ['Director-Timed', 'You run the timing station'],
  ['Hybrid', 'Both feed one board'],
];

const EMPTY = {
  name: '',
  slug: '',
  date: '',
  start_time: '',
  location: '',
  challenge_type: 'Run',
  scoring_method: 'Fastest Time',
  timing_mode: 'Hybrid',
  distance_target: '',
  instructions: '',
  is_public: true,
};

export default function AdminDashboard() {
  const events = useStore(() => getEvents());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [slugEdited, setSlugEdited] = useState(false);
  const navigate = useNavigate();

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onName(value) {
    set('name', value);
    if (!slugEdited) set('slug', slugify(value));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const created = createEvent({ ...form, status: 'open' });
    setForm(EMPTY);
    setSlugEdited(false);
    setOpen(false);
    navigate(`/admin/event/${created.slug}`);
  }

  return (
    <Shell max="max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="gryt-heading text-4xl text-white">Organizer</h1>
          <p className="text-sm text-gryt-mute">{events.length} event{events.length === 1 ? '' : 's'}</p>
        </div>
        <button onClick={() => setOpen(true)} className="gryt-btn-primary">
          <Plus size={18} /> Create Event
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {events.length === 0 && (
          <div className="gryt-card p-8 text-center text-gryt-mute">
            No events yet. Create your first one to get a QR code and scoreboard.
          </div>
        )}
        {events.map((e) => (
          <div key={e.id} className="gryt-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-lg font-semibold text-white">{e.name}</h3>
                  <StatusBadge status={e.status} />
                </div>
                <p className="mt-0.5 text-xs text-gryt-mute">
                  {formatEventDate(e.date, e.start_time)} · {e.location || 'No location'} · {e.challenge_type}
                </p>
                <p className="mt-1 font-mono text-xs tracking-widest text-gryt-light">
                  CODE {e.event_code}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to={`/admin/event/${e.slug}`} className="gryt-btn-secondary text-xs">
                <Settings2 size={15} /> Manage
              </Link>
              <Link to={`/admin/time/${e.slug}`} className="gryt-btn-secondary text-xs">
                <Timer size={15} /> Timing Station
              </Link>
              <Link to={`/scoreboard/${e.slug}`} className="gryt-btn-secondary text-xs">
                <MonitorPlay size={15} /> Scoreboard
              </Link>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
          <form
            onSubmit={submit}
            className="gryt-card max-h-[92vh] w-full max-w-xl overflow-y-auto p-5 sm:rounded-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="gryt-heading text-2xl text-white">Create Event</h2>
              <button type="button" onClick={() => setOpen(false)} className="gryt-btn-ghost p-2">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="gryt-label">Event name</label>
                <input className="gryt-input" value={form.name} onChange={(e) => onName(e.target.value)} placeholder="Wednesday GRYT Run" autoFocus />
              </div>
              <div>
                <label className="gryt-label">Slug</label>
                <input
                  className="gryt-input font-mono"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    set('slug', slugify(e.target.value));
                  }}
                  placeholder="wednesday-gryt-run"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="gryt-label">Date</label>
                  <input type="date" className="gryt-input" value={form.date} onChange={(e) => set('date', e.target.value)} />
                </div>
                <div>
                  <label className="gryt-label">Start time</label>
                  <input type="time" className="gryt-input" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="gryt-label">Location</label>
                <input className="gryt-input" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="North Shore Trail" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="gryt-label">Challenge type</label>
                  <select className="gryt-input" value={form.challenge_type} onChange={(e) => set('challenge_type', e.target.value)}>
                    {CHALLENGE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="gryt-label">Distance / goal</label>
                  <input className="gryt-input" value={form.distance_target} onChange={(e) => set('distance_target', e.target.value)} placeholder="5K" />
                </div>
              </div>
              <div>
                <label className="gryt-label">Scoring method</label>
                <select className="gryt-input" value={form.scoring_method} onChange={(e) => set('scoring_method', e.target.value)}>
                  {SCORING_METHODS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="gryt-label">Timing mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIMING_MODES.map(([mode, desc]) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => set('timing_mode', mode)}
                      className={`rounded-xl border p-3 text-left transition ${
                        form.timing_mode === mode
                          ? 'border-gryt-light bg-gryt-light/10'
                          : 'border-gryt-line bg-black/30 hover:border-gryt-line'
                      }`}
                    >
                      <div className="text-sm font-bold text-white">{mode}</div>
                      <div className="text-[11px] leading-tight text-gryt-mute">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="gryt-label">Instructions (optional)</label>
                <textarea className="gryt-input" rows={2} value={form.instructions} onChange={(e) => set('instructions', e.target.value)} />
              </div>
              <label className="flex items-center gap-3 text-sm text-white">
                <input
                  type="checkbox"
                  checked={form.is_public}
                  onChange={(e) => set('is_public', e.target.checked)}
                  className="h-5 w-5 accent-gryt-light"
                />
                Public event (shown on home + joinable by link)
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setOpen(false)} className="gryt-btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" className="gryt-btn-primary flex-1" disabled={!form.name.trim()}>
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </Shell>
  );
}
