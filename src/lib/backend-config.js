// ─────────────────────────────────────────────────────────────────────────
// Backend selection.
//
// localStorage is the DEFAULT backend. Supabase is strictly opt-in: it activates
// only when a usable VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY pair is present,
// or when VITE_STORAGE_BACKEND=supabase explicitly requests it (and the
// credentials are usable). Anything else — no env, blank env, copied-but-unfilled
// `.env.example` placeholders, a malformed URL — resolves to `local` so the app
// runs fully offline instead of half-configuring itself into runtime failures.
//
// This module is pure (env in, decision out) so the whole selection matrix is
// unit-testable without touching import.meta.env.
// ─────────────────────────────────────────────────────────────────────────

// Distinctive markers from unfilled templates. All contain characters or
// substrings that cannot occur in a real project URL or base64url JWT, so
// matching them can never reject a genuine credential.
const PLACEHOLDER_MARKERS = [
  'your-project',
  'your_project',
  'your-anon',
  'your_anon',
  'your-supabase',
  'placeholder',
  'changeme',
  'change-me',
  'replace-me',
  'replaceme',
  'example.supabase.co',
  '<',
  '>',
];

// Strips whitespace and the surrounding quotes some .env parsers leave behind.
function clean(value) {
  if (typeof value !== 'string') return '';
  let v = value.trim();
  const quoted =
    v.length >= 2 &&
    ((v[0] === '"' && v[v.length - 1] === '"') || (v[0] === "'" && v[v.length - 1] === "'"));
  if (quoted) v = v.slice(1, -1).trim();
  return v;
}

function isPlaceholder(value) {
  const lower = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => lower.includes(marker));
}

export function isUsableUrl(value) {
  const v = clean(value);
  if (!v || isPlaceholder(v)) return false;
  let parsed;
  try {
    parsed = new URL(v);
  } catch {
    return false;
  }
  // A hostname without a dot is a local alias, not a reachable project host.
  return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && parsed.hostname.includes('.');
}

export function isUsableKey(value) {
  const v = clean(value);
  if (!v || isPlaceholder(v)) return false;
  // Anon keys are long, single-token secrets; whitespace means a mangled paste.
  return v.length >= 20 && !/\s/.test(v);
}

export const BACKEND_LOCAL = 'local';
export const BACKEND_SUPABASE = 'supabase';

// Resolves the active backend from a plain env object.
//
// Returns { mode, url, anonKey, requested, configError }:
//   mode        — 'local' | 'supabase', the backend that will actually be used
//   requested   — the explicit VITE_STORAGE_BACKEND value, or 'auto'
//   configError — human-readable string when the caller asked for Supabase but
//                 we fell back to local. `null` on the normal default path, so
//                 running with no env is never treated as an error.
export function resolveBackendConfig(env = {}) {
  const url = clean(env.VITE_SUPABASE_URL);
  const anonKey = clean(env.VITE_SUPABASE_ANON_KEY);
  const flag = clean(env.VITE_STORAGE_BACKEND).toLowerCase();
  const requested = flag || 'auto';

  const local = (configError = null) => ({
    mode: BACKEND_LOCAL,
    url: null,
    anonKey: null,
    requested,
    configError,
  });

  if (requested !== 'auto' && requested !== BACKEND_LOCAL && requested !== BACKEND_SUPABASE) {
    return local(
      `VITE_STORAGE_BACKEND="${flag}" is not a valid backend (expected "local" or "supabase"). Using localStorage.`
    );
  }

  // An explicit opt-out wins over any credentials that happen to be present —
  // this is the race-day escape hatch back to a known-good offline app.
  if (requested === BACKEND_LOCAL) return local();

  const urlOk = isUsableUrl(url);
  const keyOk = isUsableKey(anonKey);

  if (urlOk && keyOk) {
    return { mode: BACKEND_SUPABASE, url: clean(url), anonKey, requested, configError: null };
  }

  if (requested === BACKEND_SUPABASE) {
    const missing = [];
    if (!urlOk) missing.push(url ? 'VITE_SUPABASE_URL is not a valid URL' : 'VITE_SUPABASE_URL is missing');
    if (!keyOk) missing.push(anonKey ? 'VITE_SUPABASE_ANON_KEY is not a valid key' : 'VITE_SUPABASE_ANON_KEY is missing');
    return local(
      `VITE_STORAGE_BACKEND=supabase but ${missing.join(' and ')}. Falling back to localStorage.`
    );
  }

  // Partial credentials on the auto path are worth surfacing: the operator
  // clearly intended Supabase but only filled in half of it.
  if (url || anonKey) {
    const detail = urlOk ? 'VITE_SUPABASE_ANON_KEY' : keyOk ? 'VITE_SUPABASE_URL' : 'both Supabase variables';
    return local(`Supabase config incomplete (${detail} missing or invalid). Using localStorage.`);
  }

  // The clean default: no Supabase env at all, pure offline app, not an error.
  return local();
}
