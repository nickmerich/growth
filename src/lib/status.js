// ─────────────────────────────────────────────────────────────────────────
// Backend health status.
//
// In local mode this is permanently `online` — there is no network to lose, so
// the UI must never show a scary indicator for the default offline app.
//
// In Supabase mode every backend call reports its outcome here, which lets the
// UI tell the operator whether writes are actually reaching the server. This
// matters most on the timing station: unsynced finish taps are already persisted
// and retryable, but the operator needs to *know* that syncing is broken.
// ─────────────────────────────────────────────────────────────────────────
import { useEffect, useState, useSyncExternalStore } from 'react';
import { backendMode, backendConfigError } from './supabase.js';
import { BACKEND_LOCAL } from './backend-config.js';

export const STATUS_ONLINE = 'online';
export const STATUS_OFFLINE = 'offline';
export const STATUS_DEGRADED = 'degraded';
export const STATUS_UNKNOWN = 'unknown';

const isLocal = backendMode === BACKEND_LOCAL;

// Transport-level failures: the request never got an answer from the server.
export function isUnreachableError(err) {
  if (!err) return false;
  if (err.name === 'AbortError' || err.name === 'TimeoutError') return true;
  const message = String(err.message || err);
  if (/failed to fetch|networkerror|network request failed|load failed|err_|fetch failed|timeout|socket hang up|ENOTFOUND|EAI_AGAIN|ECONNREFUSED/i.test(message)) {
    return true;
  }
  if (typeof err.status === 'number' && err.status >= 500) return true;
  // PostgREST/GoTrue errors always carry a code or status. An error with neither
  // is an opaque transport failure.
  return err.code == null && err.status == null && err.name === 'TypeError';
}

// Reachable, but the project is not set up the way the app expects: bad API key,
// or the migration was never applied. These are silent-failure traps on race day,
// so they get their own state rather than being reported as ordinary errors.
export function isMisconfigurationError(err) {
  if (!err) return false;
  const code = err.code ? String(err.code) : '';
  // 42P01 undefined_table, 42883 undefined_function, 3F000 invalid_schema,
  // PGRST202 function not found, PGRST205 table not found in schema cache,
  // PGRST301 JWT/apikey rejected.
  if (['42P01', '42883', '3F000', 'PGRST202', 'PGRST205', 'PGRST301'].includes(code)) return true;
  return /invalid api key|no api key|jwt expired|invalid jwt|schema cache/i.test(
    String(err.message || '')
  );
}

const initialState = {
  backend: backendMode,
  status: isLocal ? STATUS_ONLINE : STATUS_UNKNOWN,
  // A config problem means Supabase was requested but we are running local.
  configError: backendConfigError ?? null,
  lastError: null,
  lastOkAt: null,
  lastErrorAt: null,
};

let state = initialState;
const listeners = new Set();

function setState(patch) {
  const next = { ...state, ...patch };
  if (
    next.status === state.status &&
    next.lastError === state.lastError &&
    next.configError === state.configError
  ) {
    // Still record timestamps, but skip notifying when nothing observable changed.
    state = next;
    return;
  }
  state = next;
  listeners.forEach((fn) => {
    try {
      fn(state);
    } catch {
      /* a status listener must never break a data write */
    }
  });
}

export function getBackendStatus() {
  return state;
}

export function subscribeBackendStatus(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function reportBackendOk() {
  if (isLocal) return;
  setState({ status: STATUS_ONLINE, lastError: null, lastOkAt: Date.now() });
}

export function reportBackendError(err) {
  if (isLocal) return;
  const unreachable = isUnreachableError(err);
  const misconfigured = !unreachable && isMisconfigurationError(err);
  if (!unreachable && !misconfigured) {
    // An ordinary rejected operation (validation, RLS denial) still proves the
    // server is reachable and correctly set up.
    setState({ status: STATUS_ONLINE, lastOkAt: Date.now() });
    return;
  }
  setState({
    status: unreachable ? STATUS_OFFLINE : STATUS_DEGRADED,
    lastError: err?.message ? String(err.message) : 'Supabase request failed',
    lastErrorAt: Date.now(),
  });
}

export function useBackendStatus() {
  return useSyncExternalStore(subscribeBackendStatus, getBackendStatus, getBackendStatus);
}

// Browser-level connectivity, folded into the indicator so the operator sees a
// lost network immediately rather than only after the next failed write.
export function useNetworkOnline() {
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine !== false
  );
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  return online;
}
