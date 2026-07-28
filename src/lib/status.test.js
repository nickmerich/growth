import { describe, it, expect, vi, afterEach } from 'vitest';

// status.js reads the resolved backend at module load, so each case loads a fresh
// copy with src/lib/supabase.js mocked to the mode under test.
async function loadStatus({ backendMode = 'local', backendConfigError = null } = {}) {
  vi.resetModules();
  vi.doMock('./supabase.js', () => ({
    supabase: null,
    backendMode,
    isSupabaseConfigured: backendMode === 'supabase',
    backendConfigError,
  }));
  return import('./status.js');
}

afterEach(() => {
  vi.doUnmock('./supabase.js');
  vi.resetModules();
});

describe('local mode status', () => {
  it('is healthy with no network involved', async () => {
    const s = await loadStatus({ backendMode: 'local' });
    const state = s.getBackendStatus();
    expect(state.backend).toBe('local');
    expect(state.status).toBe(s.STATUS_ONLINE);
    expect(state.configError).toBeNull();
    expect(state.lastError).toBeNull();
  });

  it('ignores error reports so the offline default app never shows a sync failure', async () => {
    const s = await loadStatus({ backendMode: 'local' });
    s.reportBackendError(new TypeError('Failed to fetch'));
    s.reportBackendError({ code: '42P01', message: 'relation does not exist' });
    const state = s.getBackendStatus();
    expect(state.status).toBe(s.STATUS_ONLINE);
    expect(state.lastError).toBeNull();
  });

  it('surfaces a config error when Supabase was requested but could not be used', async () => {
    const s = await loadStatus({
      backendMode: 'local',
      backendConfigError: 'VITE_STORAGE_BACKEND=supabase but VITE_SUPABASE_URL is missing.',
    });
    expect(s.getBackendStatus().configError).toMatch(/VITE_SUPABASE_URL is missing/);
    expect(s.getBackendStatus().status).toBe(s.STATUS_ONLINE);
  });

  it('does not notify subscribers for local-mode reports', async () => {
    const s = await loadStatus({ backendMode: 'local' });
    const seen = vi.fn();
    s.subscribeBackendStatus(seen);
    s.reportBackendError(new TypeError('Failed to fetch'));
    s.reportBackendOk();
    expect(seen).not.toHaveBeenCalled();
  });
});

describe('supabase mode status transitions', () => {
  it('starts unknown until the first response', async () => {
    const s = await loadStatus({ backendMode: 'supabase' });
    expect(s.getBackendStatus().status).toBe(s.STATUS_UNKNOWN);
  });

  it('goes online on a successful call', async () => {
    const s = await loadStatus({ backendMode: 'supabase' });
    s.reportBackendOk();
    expect(s.getBackendStatus().status).toBe(s.STATUS_ONLINE);
    expect(s.getBackendStatus().lastOkAt).toBeTypeOf('number');
  });

  it('goes offline when the server is unreachable', async () => {
    const s = await loadStatus({ backendMode: 'supabase' });
    s.reportBackendError(new TypeError('Failed to fetch'));
    const state = s.getBackendStatus();
    expect(state.status).toBe(s.STATUS_OFFLINE);
    expect(state.lastError).toMatch(/Failed to fetch/);
  });

  it('goes degraded when the project is reachable but misconfigured', async () => {
    const s = await loadStatus({ backendMode: 'supabase' });
    s.reportBackendError({ code: '42P01', message: 'relation "public.results" does not exist' });
    expect(s.getBackendStatus().status).toBe(s.STATUS_DEGRADED);
  });

  it('treats a rejected-but-answered request as proof the backend is healthy', async () => {
    const s = await loadStatus({ backendMode: 'supabase' });
    // A unique-violation / RLS denial is a real server response, not an outage.
    s.reportBackendError({ code: '23505', message: 'duplicate key value' });
    expect(s.getBackendStatus().status).toBe(s.STATUS_ONLINE);
  });

  it('recovers from offline once a call succeeds again', async () => {
    const s = await loadStatus({ backendMode: 'supabase' });
    s.reportBackendError(new TypeError('Failed to fetch'));
    expect(s.getBackendStatus().status).toBe(s.STATUS_OFFLINE);
    s.reportBackendOk();
    expect(s.getBackendStatus().status).toBe(s.STATUS_ONLINE);
    expect(s.getBackendStatus().lastError).toBeNull();
  });

  it('notifies subscribers on change and stops after unsubscribe', async () => {
    const s = await loadStatus({ backendMode: 'supabase' });
    const seen = vi.fn();
    const unsubscribe = s.subscribeBackendStatus(seen);
    s.reportBackendError(new TypeError('Failed to fetch'));
    expect(seen).toHaveBeenCalledTimes(1);
    unsubscribe();
    s.reportBackendOk();
    expect(seen).toHaveBeenCalledTimes(1);
  });

  it('survives a throwing subscriber so a status listener cannot break a write', async () => {
    const s = await loadStatus({ backendMode: 'supabase' });
    s.subscribeBackendStatus(() => {
      throw new Error('listener blew up');
    });
    expect(() => s.reportBackendError(new TypeError('Failed to fetch'))).not.toThrow();
    expect(s.getBackendStatus().status).toBe(s.STATUS_OFFLINE);
  });
});

describe('error classification', () => {
  it('recognises transport failures', async () => {
    const s = await loadStatus({ backendMode: 'supabase' });
    expect(s.isUnreachableError(new TypeError('Failed to fetch'))).toBe(true);
    expect(s.isUnreachableError({ name: 'AbortError' })).toBe(true);
    expect(s.isUnreachableError({ message: 'NetworkError when attempting to fetch' })).toBe(true);
    expect(s.isUnreachableError({ message: 'request timeout' })).toBe(true);
    expect(s.isUnreachableError({ status: 503, message: 'service unavailable' })).toBe(true);
    expect(s.isUnreachableError(null)).toBe(false);
    expect(s.isUnreachableError({ code: '23505', message: 'duplicate key' })).toBe(false);
  });

  it('recognises setup problems', async () => {
    const s = await loadStatus({ backendMode: 'supabase' });
    expect(s.isMisconfigurationError({ code: 'PGRST301', message: 'JWT expired' })).toBe(true);
    expect(s.isMisconfigurationError({ code: '42883', message: 'function does not exist' })).toBe(true);
    expect(s.isMisconfigurationError({ message: 'Invalid API key' })).toBe(true);
    expect(
      s.isMisconfigurationError({ message: 'Could not find the function in the schema cache' })
    ).toBe(true);
    expect(s.isMisconfigurationError({ code: '23505', message: 'duplicate key' })).toBe(false);
    expect(s.isMisconfigurationError(null)).toBe(false);
  });
});
