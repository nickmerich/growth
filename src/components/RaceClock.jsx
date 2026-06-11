import { useRaceClock } from '../lib/hooks.js';
import { formatClock } from '../lib/format.js';

// Isolates the per-frame race clock so its ~60fps state updates only re-render
// this node — not the surrounding scoreboard rows or timing-station panels.
export function MasterClock({ startedAt, active = true, className = '' }) {
  const elapsed = useRaceClock(active ? startedAt : null);
  return <span className={className}>{formatClock(active ? elapsed : 0)}</span>;
}
