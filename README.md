# iGRYT Event Timer

A GRYT Club–branded **multi-athlete event timing system** — a race-day operating
system with a live TV scoreboard and shareable "PROOF OF GRYT" stat cards.

> **DO HARD THINGS TOGETHER.**

An organizer creates an event, athletes join via QR code (no login), results feed
a live leaderboard, and every finisher walks away with a branded digital card.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview the production build
```

The app seeds itself with Pittsburgh-themed sample data on first load (a finished
"Saturday GRYT 5K" and an open "Wednesday AMRAP Challenge"), so it looks alive
immediately.

## Roles & routes

| Route | Role | Purpose |
|-------|------|---------|
| `/` | — | Landing page |
| `/admin` | Organizer | Dashboard: list + create events |
| `/admin/event/:slug` | Organizer | Manage roster, results, QR, share links |
| `/admin/time/:slug` | Organizer | **Director Timing Station** (race-day console) |
| `/event/:slug` | Athlete | Public join flow (QR target) |
| `/timer/:slug` | Athlete | Self-timer |
| `/scoreboard/:slug` | Spectator | Live TV/projector scoreboard |
| `/result/:id` | Athlete | Individual result + PROOF OF GRYT card |

## Key feature: the Finish Queue

The Director Timing Station handles **pack finishes**. Tap the giant
`RECORD FINISHER` button once per athlete as they cross the line — each tap logs a
raw timestamp against the master race clock with zero debounce. Assign names from
the queue afterwards. Self-timed and director-timed results feed the same ranked
leaderboard.

Timing screens use the **Wake Lock API** to keep the display on, an absolute
`started_at` timestamp to prevent clock drift over long events, and audio/haptic
cues on each tap.

## Architecture

- **React 18 + Vite + Tailwind CSS**, `react-router-dom`, `lucide-react`.
- `qrcode` for join QR codes, `html2canvas` for PNG card export.
- All persistence goes through `src/lib/storage.js` (localStorage for the MVP).
  Every read/write is funnelled through this service layer so swapping in
  **Supabase** later only touches one file. Cross-tab updates propagate live via
  the `storage` event, which drives the real-time scoreboard.

### Data model

`events`, `athletes`, `finish_queue`, `results` — see `src/lib/storage.js`.

## Brand

Near-black `#0A0A0A`, light-blue accent `#8CC8F0`, dark-blue secondary `#4682B4`,
Bebas Neue display type, monospace race clock, diagonal slash + grit texture.
