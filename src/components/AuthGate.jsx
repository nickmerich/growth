import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Shell, LoadingState } from './Brand.jsx';
import { authRequired, useAuth, signIn, signUp, signOut } from '../lib/auth.js';

// Route guard for organizer surfaces. In localStorage mode (authRequired ===
// false) it renders children untouched; in Supabase mode it requires a signed-in
// organizer and otherwise shows the sign-in form.
export function RequireOrganizer({ children }) {
  const { user, loading } = useAuth();
  if (!authRequired) return children;
  if (loading) {
    return (
      <Shell>
        <LoadingState label="Checking session" />
      </Shell>
    );
  }
  if (!user) return <OrganizerSignIn />;
  return children;
}

function OrganizerSignIn() {
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (busy || !email.trim() || !password) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
        // useAuth's onAuthStateChange swaps the guard to the real page.
      } else {
        await signUp(email, password);
        setNotice(
          'Account created. If your project requires email confirmation, confirm via the link we sent, then sign in.'
        );
        setMode('signin');
        setPassword('');
      }
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell max="max-w-md">
      <div className="pt-10">
        <h1 className="gryt-heading text-4xl text-white">Organizer sign-in</h1>
        <p className="mt-1 text-sm text-gryt-mute">
          Creating and timing events needs an organizer account so only you can manage your events.
        </p>
        <form onSubmit={submit} className="gryt-card mt-6 space-y-4 p-5">
          <div>
            <label className="gryt-label">Email</label>
            <input
              type="email"
              className="gryt-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@club.com"
              autoComplete="email"
              autoFocus
            />
          </div>
          <div>
            <label className="gryt-label">Password</label>
            <input
              type="password"
              className="gryt-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>
          {error && (
            <p className="text-sm text-red-400">{error.message || 'Could not sign in. Try again.'}</p>
          )}
          {notice && <p className="text-sm text-gryt-light">{notice}</p>}
          <button type="submit" className="gryt-btn-primary w-full" disabled={busy || !email.trim() || !password}>
            {busy ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
            setError(null);
            setNotice(null);
          }}
          className="gryt-btn-ghost mt-3 w-full text-sm"
        >
          {mode === 'signin' ? 'Need an account? Create one' : 'Have an account? Sign in'}
        </button>
      </div>
    </Shell>
  );
}

// Sign-out control shown in organizer chrome — only when auth is actually in use.
export function SignOutButton({ className = '' }) {
  if (!authRequired) return null;
  return (
    <button
      onClick={() => signOut()}
      className={`gryt-btn-ghost text-xs ${className}`}
      title="Sign out"
    >
      <LogOut size={15} /> Sign out
    </button>
  );
}
