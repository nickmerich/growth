// ─────────────────────────────────────────────────────────────────────────
// Organizer auth.
//
// Supabase RLS gates every organizer write on `owner_id = auth.uid()`, so the
// Supabase backend needs a real signed-in user to create/manage/time events.
// This module is that minimal flow: email + password sign-in/up against Supabase
// Auth, plus a `useAuth` hook the route guard uses.
//
// In localStorage mode there is no auth (and no RLS) — organizers work as a
// single implicit local user, so every function short-circuits to a synthetic
// user and the guard becomes a no-op. This keeps the credential-free demo build
// working exactly as before.
// ─────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase.js';

// The guard only enforces sign-in when a real Supabase backend is configured.
export const authRequired = isSupabaseConfigured;

const LOCAL_USER = { id: 'local-organizer', email: 'local demo' };

export async function getUser() {
  if (!isSupabaseConfigured) return LOCAL_USER;
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user ?? null;
}

export async function signIn(email, password) {
  if (!isSupabaseConfigured) return LOCAL_USER;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  return data.user;
}

export async function signUp(email, password) {
  if (!isSupabaseConfigured) return LOCAL_USER;
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut();
}

// Tracks the current organizer session. `user === undefined` means the initial
// check is still in flight; `null` means signed out; an object means signed in.
export function useAuth() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    let active = true;
    getUser().then((u) => {
      if (active) setUser(u);
    });
    if (!isSupabaseConfigured) return undefined;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { user, loading: user === undefined };
}
