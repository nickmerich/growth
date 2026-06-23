// ─────────────────────────────────────────────────────────────────────────
// Supabase client singleton.
//
// Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. When either is missing the
// app runs against a localStorage backend instead (see src/lib/backends), so the
// project still builds and demos without real credentials. `isSupabaseConfigured`
// is the single switch the storage layer uses to pick a backend.
// ─────────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env?.VITE_SUPABASE_URL;
const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : null;
