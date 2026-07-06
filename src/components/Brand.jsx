import { Link } from 'react-router-dom';

// GRYT wordmark — geometric blue shards + bold type.
export function Logo({ className = '', to = '/', size = 'md' }) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };
  const inner = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 36 36" className="h-7 w-7" aria-hidden>
        <path d="M6 28 L17 8 L20 8 L9 28 Z" fill="#8CC8F0" />
        <path d="M17 28 L28 8 L31 8 L20 28 Z" fill="#4682B4" />
      </svg>
      <span className={`gryt-heading ${sizes[size]} leading-none text-white`}>
        i<span className="text-gryt-light">GRYT</span>
      </span>
    </span>
  );
  return to ? (
    <Link to={to} aria-label="iGRYT home">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export const TAGLINE = 'DO HARD THINGS TOGETHER.';

export function Tagline({ className = '' }) {
  return (
    <span className={`gryt-heading tracking-[0.25em] text-gryt-mute ${className}`}>{TAGLINE}</span>
  );
}

const STATUS_STYLES = {
  draft: 'bg-white/5 text-gryt-mute',
  open: 'bg-gryt-light/15 text-gryt-light',
  live: 'bg-red-500/20 text-red-300 animate-pulse',
  finished: 'bg-gryt-blue/20 text-gryt-light',
};

export function StatusBadge({ status }) {
  const s = status || 'draft';
  return (
    <span className={`gryt-badge ${STATUS_STYLES[s] || STATUS_STYLES.draft}`}>
      {s === 'live' && <span className="h-1.5 w-1.5 rounded-full bg-red-400" />}
      {s}
    </span>
  );
}

// Shared page chrome for the standard (non-fullscreen) screens.
export function Shell({ children, header = true, max = 'max-w-2xl' }) {
  return (
    <div className="gryt-noise relative min-h-screen">
      <div className="gryt-slashes pointer-events-none fixed inset-0 z-0" />
      <div className="relative z-10">
        {header && (
          <header className="sticky top-0 z-20 border-b border-gryt-line/70 bg-gryt-black/85 backdrop-blur">
            <div className={`mx-auto flex items-center justify-between px-4 py-3 ${max}`}>
              <Logo />
              <Tagline className="hidden text-[10px] sm:block" />
            </div>
          </header>
        )}
        <main className={`mx-auto px-4 pb-24 pt-6 ${max}`}>{children}</main>
      </div>
    </div>
  );
}
