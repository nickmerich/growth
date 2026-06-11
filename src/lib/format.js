// Time + pace formatting helpers shared across the timer, scoreboard, and cards.

// Format seconds -> M:SS or H:MM:SS (no millis). e.g. 1325 -> "22:05"
export function formatTime(totalSeconds) {
  if (totalSeconds == null || Number.isNaN(totalSeconds)) return '--:--';
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

// Format elapsed ms -> MM:SS.CS (centiseconds) for the live race clock.
export function formatClock(ms) {
  if (ms == null || Number.isNaN(ms)) return '00:00.00';
  const total = Math.max(0, ms);
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const cs = Math.floor((total % 1000) / 10);
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  const cc = String(cs).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}.${cc}` : `${mm}:${ss}.${cc}`;
}

// Parse a target distance string like "5K", "5 km", "1600m", "3.1mi" -> meters.
export function parseDistanceMeters(input) {
  if (!input) return null;
  const str = String(input).toLowerCase().trim();
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  if (Number.isNaN(num)) return null;
  if (/mi|mile/.test(str)) return num * 1609.34;
  if (/km|k\b|k$/.test(str)) return num * 1000;
  if (/m\b|meter|metre/.test(str)) return num;
  // Bare number: assume kilometers (most GRYT events are in km).
  return num * 1000;
}

// Pace per km from seconds + meters -> "M:SS /km".
export function formatPace(seconds, meters) {
  if (!seconds || !meters || meters <= 0) return '—';
  const perKm = seconds / (meters / 1000);
  const m = Math.floor(perKm / 60);
  const s = Math.round(perKm % 60);
  const ss = String(s).padStart(2, '0');
  return `${m}:${ss}/km`;
}

// Parse "MM:SS" or "H:MM:SS" or seconds -> seconds.
export function parseTimeToSeconds(input) {
  if (input == null) return null;
  const str = String(input).trim();
  if (!str) return null;
  if (!str.includes(':')) {
    const n = parseFloat(str);
    return Number.isNaN(n) ? null : n;
  }
  const parts = str.split(':').map((p) => parseFloat(p) || 0);
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

export function formatEventDate(date, time) {
  if (!date) return time || '';
  try {
    const d = new Date(`${date}T${time || '00:00'}`);
    const opts = { weekday: 'short', month: 'short', day: 'numeric' };
    const datePart = d.toLocaleDateString('en-US', opts);
    return time ? `${datePart} · ${time}` : datePart;
  } catch {
    return `${date} ${time || ''}`.trim();
  }
}

// Build an absolute URL from an app-relative path (share links, QR targets).
export function originUrl(path) {
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path}`;
}

// The primary metric string for a result, driven by whichever value is set.
// `units` appends a unit suffix (rds/reps/pts/km); `upper` uppercases it.
// Bare mode (no units) is used by the big scoreboard column.
export function formatMetric(result, { units = false, upper = false } = {}) {
  if (!result) return '—';
  if (result.final_time_seconds != null) return formatTime(result.final_time_seconds);
  let value;
  let unit;
  if (result.rounds != null) {
    value = result.rounds;
    unit = 'rds';
  } else if (result.reps != null) {
    value = result.reps;
    unit = 'reps';
  } else if (result.distance_meters != null) {
    value = (result.distance_meters / 1000).toFixed(2);
    unit = 'km';
  } else if (result.score != null) {
    value = result.score;
    unit = 'pts';
  } else {
    return '—';
  }
  if (!units) return unit === 'km' ? `${value}k` : `${value}`;
  return `${value} ${upper ? unit.toUpperCase() : unit}`;
}

// Short column/header label for a scoring method (e.g. "Most Rounds" -> "Rounds").
export function scoringMetricLabel(method) {
  if (method === 'Fastest Time' || !method) return 'Time';
  return method.replace('Most ', '').replace('Longest ', '');
}

// Input field label for manual result entry, keyed off the scoring method.
export function metricFieldLabel(method) {
  switch (method) {
    case 'Most Reps':
      return 'Reps';
    case 'Most Rounds':
      return 'Rounds';
    case 'Longest Distance':
      return 'Distance (m)';
    case 'Custom Points':
      return 'Points';
    case 'Fastest Time':
    default:
      return 'Time (MM:SS)';
  }
}
