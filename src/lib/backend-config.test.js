import { describe, it, expect } from 'vitest';
import {
  resolveBackendConfig,
  isUsableUrl,
  isUsableKey,
  BACKEND_LOCAL,
  BACKEND_SUPABASE,
} from './backend-config.js';

// A structurally realistic anon key (long, single token, no placeholder markers).
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.s1gn4tur3_v4lu3_here';
const URL = 'https://abcdefghijklm.supabase.co';

describe('local is the default backend', () => {
  it('uses localStorage with no env at all', () => {
    const config = resolveBackendConfig({});
    expect(config.mode).toBe(BACKEND_LOCAL);
    expect(config.requested).toBe('auto');
    // No env is the supported default, so it must never look like a failure.
    expect(config.configError).toBeNull();
  });

  it('uses localStorage for blank env values', () => {
    const config = resolveBackendConfig({ VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '   ' });
    expect(config.mode).toBe(BACKEND_LOCAL);
    expect(config.configError).toBeNull();
  });

  it('never leaks credentials into local mode', () => {
    const config = resolveBackendConfig({ VITE_STORAGE_BACKEND: 'local', VITE_SUPABASE_URL: URL, VITE_SUPABASE_ANON_KEY: KEY });
    expect(config.url).toBeNull();
    expect(config.anonKey).toBeNull();
  });
});

describe('Supabase is strictly opt-in', () => {
  it('activates when both credentials are usable', () => {
    const config = resolveBackendConfig({ VITE_SUPABASE_URL: URL, VITE_SUPABASE_ANON_KEY: KEY });
    expect(config.mode).toBe(BACKEND_SUPABASE);
    expect(config.url).toBe(URL);
    expect(config.anonKey).toBe(KEY);
    expect(config.configError).toBeNull();
  });

  it('tolerates surrounding whitespace and quotes from .env parsing', () => {
    const config = resolveBackendConfig({
      VITE_SUPABASE_URL: `  "${URL}"  `,
      VITE_SUPABASE_ANON_KEY: `'${KEY}'`,
    });
    expect(config.mode).toBe(BACKEND_SUPABASE);
    expect(config.url).toBe(URL);
    expect(config.anonKey).toBe(KEY);
  });

  it('stays local when only the URL is set', () => {
    const config = resolveBackendConfig({ VITE_SUPABASE_URL: URL });
    expect(config.mode).toBe(BACKEND_LOCAL);
    // Half-filled config is worth flagging — the operator clearly intended Supabase.
    expect(config.configError).toMatch(/VITE_SUPABASE_ANON_KEY/);
  });

  it('stays local when only the key is set', () => {
    const config = resolveBackendConfig({ VITE_SUPABASE_ANON_KEY: KEY });
    expect(config.mode).toBe(BACKEND_LOCAL);
    expect(config.configError).toMatch(/VITE_SUPABASE_URL/);
  });

  it('stays local for unfilled .env.example placeholders', () => {
    for (const [url, key] of [
      ['https://your-project.supabase.co', 'your-anon-key'],
      ['<YOUR_SUPABASE_URL>', '<YOUR_ANON_KEY>'],
      ['https://example.supabase.co', 'CHANGEME_CHANGEME_CHANGEME'],
      ['https://placeholder.supabase.co', KEY],
    ]) {
      const config = resolveBackendConfig({ VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: key });
      expect(config.mode, `${url} / ${key}`).toBe(BACKEND_LOCAL);
    }
  });

  it('stays local for a malformed URL', () => {
    const config = resolveBackendConfig({
      VITE_SUPABASE_URL: 'not-a-url',
      VITE_SUPABASE_ANON_KEY: KEY,
    });
    expect(config.mode).toBe(BACKEND_LOCAL);
    expect(config.configError).toMatch(/VITE_SUPABASE_URL/);
  });

  it('stays local for a truncated key', () => {
    const config = resolveBackendConfig({ VITE_SUPABASE_URL: URL, VITE_SUPABASE_ANON_KEY: 'short' });
    expect(config.mode).toBe(BACKEND_LOCAL);
    expect(config.configError).toMatch(/VITE_SUPABASE_ANON_KEY/);
  });
});

describe('VITE_STORAGE_BACKEND override', () => {
  it('forces local even when valid credentials are present', () => {
    const config = resolveBackendConfig({
      VITE_STORAGE_BACKEND: 'local',
      VITE_SUPABASE_URL: URL,
      VITE_SUPABASE_ANON_KEY: KEY,
    });
    expect(config.mode).toBe(BACKEND_LOCAL);
    expect(config.requested).toBe('local');
    // An intentional opt-out is not a misconfiguration.
    expect(config.configError).toBeNull();
  });

  it('selects supabase when explicitly requested with valid credentials', () => {
    const config = resolveBackendConfig({
      VITE_STORAGE_BACKEND: 'supabase',
      VITE_SUPABASE_URL: URL,
      VITE_SUPABASE_ANON_KEY: KEY,
    });
    expect(config.mode).toBe(BACKEND_SUPABASE);
    expect(config.configError).toBeNull();
  });

  it('falls back to local (with an explanation) when supabase is requested without credentials', () => {
    const config = resolveBackendConfig({ VITE_STORAGE_BACKEND: 'supabase' });
    expect(config.mode).toBe(BACKEND_LOCAL);
    expect(config.configError).toMatch(/VITE_STORAGE_BACKEND=supabase/);
    expect(config.configError).toMatch(/VITE_SUPABASE_URL is missing/);
    expect(config.configError).toMatch(/VITE_SUPABASE_ANON_KEY is missing/);
  });

  it('is case- and whitespace-insensitive', () => {
    const config = resolveBackendConfig({
      VITE_STORAGE_BACKEND: '  SUPABASE ',
      VITE_SUPABASE_URL: URL,
      VITE_SUPABASE_ANON_KEY: KEY,
    });
    expect(config.mode).toBe(BACKEND_SUPABASE);
  });

  it('falls back to local for an unrecognised flag value', () => {
    const config = resolveBackendConfig({
      VITE_STORAGE_BACKEND: 'postgres',
      VITE_SUPABASE_URL: URL,
      VITE_SUPABASE_ANON_KEY: KEY,
    });
    expect(config.mode).toBe(BACKEND_LOCAL);
    expect(config.configError).toMatch(/not a valid backend/);
  });
});

describe('credential validators', () => {
  it('accepts real-looking values', () => {
    expect(isUsableUrl(URL)).toBe(true);
    expect(isUsableUrl('http://localhost.localdomain:54321')).toBe(true);
    expect(isUsableKey(KEY)).toBe(true);
    expect(isUsableKey('sb_publishable_abcdefghijklmnopqrstuvwxyz')).toBe(true);
  });

  it('rejects unusable values', () => {
    expect(isUsableUrl(undefined)).toBe(false);
    expect(isUsableUrl('supabase.co')).toBe(false);
    expect(isUsableUrl('ftp://abc.supabase.co')).toBe(false);
    // A dotless hostname is a local alias, not a reachable project host.
    expect(isUsableUrl('http://localhost:54321')).toBe(false);
    expect(isUsableKey(undefined)).toBe(false);
    expect(isUsableKey('a b c d e f g h i j k l m n o')).toBe(false);
  });
});
