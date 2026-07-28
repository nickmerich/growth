// ─────────────────────────────────────────────────────────────────────────
// Supabase client singleton.
//
// localStorage is the default backend; this module only produces a real client
// when `resolveBackendConfig` says Supabase was opted into with usable
// credentials (see src/lib/backend-config.js). If client construction itself
// fails we degrade to local rather than throwing at import time, because a
// module-level throw here would white-screen the whole app.
// ─────────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';
import { resolveBackendConfig, BACKEND_LOCAL, BACKEND_SUPABASE } from './backend-config.js';

const config = resolveBackendConfig(import.meta.env ?? {});

let client = null;
let initError = config.configError;

if (config.mode === BACKEND_SUPABASE) {
  try {
    client = createClient(config.url, config.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 10 } },
    });
  } catch (err) {
    client = null;
    initError = `Could not initialise the Supabase client (${err?.message || err}). Falling back to localStorage.`;
  }
}

export const supabase = client;

// The single switch the storage layer, auth and seed all read.
export const backendMode = client ? BACKEND_SUPABASE : BACKEND_LOCAL;
export const isSupabaseConfigured = backendMode === BACKEND_SUPABASE;

// Set when Supabase was asked for but could not be used. Null on the normal
// credential-free default path.
export const backendConfigError = initError;
