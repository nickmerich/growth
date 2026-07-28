import { useEffect, useRef, useState, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// useAsyncStore — the async replacement for the old synchronous useStore.
//
// Distinguishes the four states the app now has to represent:
//   data === undefined  → request has not resolved yet (show loading)
//   data === null       → resolved, record does not exist (show not-found)
//   data === []         → resolved, collection is empty (show empty state)
//   data (value)        → resolved with data
//
// `options.subscribe(refetch)` may register a realtime subscription that calls
// refetch when relevant changes arrive; it must return an unsubscribe function.
// ─────────────────────────────────────────────────────────────────────────
export function useAsyncStore(fetcher, deps = [], options = {}) {
  const { subscribe } = options;
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const mountedRef = useRef(true);
  // Guards against out-of-order resolutions overwriting newer data.
  const callIdRef = useRef(0);

  const runFetch = useCallback(async ({ silent = false } = {}) => {
    const callId = (callIdRef.current += 1);
    if (!silent) setLoading(true);
    try {
      const result = await fetcherRef.current();
      if (mountedRef.current && callId === callIdRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current && callId === callIdRef.current) setError(err);
    } finally {
      if (mountedRef.current && callId === callIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    runFetch();
    let unsub;
    if (subscribe) {
      // Realtime updates refetch silently so the UI never flashes a spinner.
      unsub = subscribe(() => runFetch({ silent: true }));
    }
    return () => {
      mountedRef.current = false;
      if (typeof unsub === 'function') unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refetch = useCallback(() => runFetch({ silent: true }), [runFetch]);
  return { data, loading, error, refetch };
}

// Keep the screen awake during timing / scoreboard sessions.
export function useWakeLock(active = true) {
  const lockRef = useRef(null);
  useEffect(() => {
    if (!active) return undefined;
    let released = false;

    async function request() {
      try {
        if ('wakeLock' in navigator) {
          lockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch {
        /* wake lock can fail silently (e.g. low battery) */
      }
    }
    request();

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !released) request();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      released = true;
      document.removeEventListener('visibilitychange', onVisible);
      try {
        lockRef.current?.release();
      } catch {
        /* noop */
      }
      lockRef.current = null;
    };
  }, [active]);
}

// requestAnimationFrame-driven elapsed clock anchored to an absolute start
// timestamp so it never drifts. Accepts an epoch ms number or an ISO/timestamptz
// string (Supabase returns the latter).
export function useRaceClock(startedAt) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const startMs =
      startedAt == null ? null : typeof startedAt === 'number' ? startedAt : new Date(startedAt).getTime();
    if (!startMs || Number.isNaN(startMs)) {
      setElapsed(0);
      return undefined;
    }
    let raf;
    const tick = () => {
      setElapsed(Date.now() - startMs);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [startedAt]);
  return elapsed;
}

// Small helper for "copied!" affordances.
export function useCopy() {
  const [copied, setCopied] = useState(null);
  const copy = useCallback(async (text, label = 'copied') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard may be blocked */
    }
  }, []);
  return { copied, copy };
}
