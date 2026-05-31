import { useEffect, useRef, useState, useCallback } from 'react';
import { subscribe } from './storage.js';

// Re-render a component whenever the data store changes (any tab).
export function useStore(selector, deps = []) {
  const [value, setValue] = useState(selector);
  useEffect(() => {
    const refresh = () => setValue(() => selector());
    refresh();
    return subscribe(refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
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
// timestamp so it never drifts over a long event.
export function useRaceClock(startedAt) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return undefined;
    }
    let raf;
    const tick = () => {
      setElapsed(Date.now() - startedAt);
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
