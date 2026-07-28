import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import { ensureSeeded } from './lib/seed.js';
import { clearAll } from './lib/backends/local.js';

// The credential-free default configuration: mounting the app must produce a
// working offline experience with no network traffic and no console errors.
vi.mock('./lib/sound.js', () => ({
  beep: vi.fn(),
  buzzer: vi.fn(),
  click: vi.fn(),
  vibrate: vi.fn(),
  primeAudio: vi.fn(),
}));

beforeEach(() => {
  clearAll();
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe('app in default local mode', () => {
  it('seeds and renders the home page with no fetch and no console errors', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await ensureSeeded();
    renderAt('/');

    // Demo data from the local seed is visible, so the offline app is usable.
    await waitFor(() => expect(screen.getByText(/Saturday GRYT 5K/i)).toBeInTheDocument());
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('renders organizer surfaces without a sign-in gate', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await ensureSeeded();
    renderAt('/admin');

    // authRequired is false in local mode, so the dashboard renders directly.
    await waitFor(() => expect(screen.getByText(/Saturday GRYT 5K/i)).toBeInTheDocument());
    expect(screen.queryByText(/Organizer sign-in/i)).not.toBeInTheDocument();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('shows the local storage badge rather than a sync warning', async () => {
    await ensureSeeded();
    renderAt('/');
    expect(await screen.findByLabelText(/Storage status: Local\./i)).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders the public scoreboard for a seeded event', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await ensureSeeded();
    renderAt('/scoreboard/saturday-gryt-5k');
    await waitFor(() => expect(screen.getByText(/Nick M\./i)).toBeInTheDocument());
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
