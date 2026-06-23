// ─────────────────────────────────────────────────────────────────────────
// Pure, synchronous helpers shared by the storage layer and both backends.
// These never touch the database, so they stay sync and are safe to import
// anywhere (including from tests) without pulling in Supabase.
// ─────────────────────────────────────────────────────────────────────────

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 48);
}

export function makeEventCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// Comparator metric for a result given the event scoring method.
export function scoringValue(result, method) {
  switch (method) {
    case 'Most Reps':
      return result.reps ?? 0;
    case 'Most Rounds':
      return result.rounds ?? 0;
    case 'Longest Distance':
      return result.distance_meters ?? 0;
    case 'Custom Points':
      return result.score ?? 0;
    case 'Fastest Time':
    default:
      return result.final_time_seconds ?? Infinity;
  }
}

// Lower-is-better only for time; everything else is higher-is-better.
export function lowerIsBetter(method) {
  return method === 'Fastest Time' || !method;
}

// The single source of truth for ranking. Scoreboard, EventManage,
// TimingStation, and Result all derive ranks from here so views never diverge.
export function calculateRankings(results, method = 'Fastest Time') {
  const ranked = results.filter((r) => r.status !== 'dnf');
  const dnf = results.filter((r) => r.status === 'dnf');
  const asc = lowerIsBetter(method);
  ranked.sort((a, b) => {
    const av = scoringValue(a, method);
    const bv = scoringValue(b, method);
    return asc ? av - bv : bv - av;
  });
  const withRank = ranked.map((r, i) => ({ ...r, rank: i + 1 }));
  return [...withRank, ...dnf.map((r) => ({ ...r, rank: null }))];
}
