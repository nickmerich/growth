import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ensureSeeded } from './lib/seed.js';
import './index.css';

function mount() {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

// Seed the local demo store (no-op under Supabase) before first render so the
// dashboard/scoreboard have data. Never block mounting on a seed failure.
ensureSeeded().catch(() => {}).finally(mount);
