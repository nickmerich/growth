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

`events`, `athletes`, `finishes`, `results` — see `src/lib/storage.js` and
`supabase/migrations/0001_init.sql`.

## Supabase mode: auth & security model

When `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are set the app talks to
Supabase and Row Level Security is enforced. The security contract:

- **Organizers must sign in.** `/admin`, `/admin/event/:slug`, and
  `/admin/time/:slug` are gated by `RequireOrganizer` (email + password via
  Supabase Auth). Created events get `owner_id = auth.uid()`, and every RLS
  policy keys organizer writes on owner identity. In localStorage mode there is
  no auth and the gate is a no-op, so the credential-free demo is unchanged.
- **`assign_finisher` is locked down.** It is `SECURITY DEFINER`, checks
  `is_event_owner(...)` internally, and `EXECUTE` is revoked from `public`/`anon`
  and granted only to `authenticated`. Anonymous clients cannot forge or
  overwrite director-timed results.
- **Anonymous result writes are RPC-only.** `results` INSERT/UPDATE policies are
  owner-only. Self-timed athletes never write `results` directly; they call the
  `submit_self_result` RPC, which forces `source = 'self_timed'`, binds the row
  to their own athlete (by per-device session token, or by claiming a
  pre-registered roster athlete id), and upserts so re-saves replace in place
  without tripping the owner-only UPDATE policy.
- **Anonymous athlete self-join is constrained** to creating a `registered`
  athlete on a public event; `finished`/`dnf` status and all roster mutations
  stay owner-only.
- **Realtime deletes propagate.** Event-scoped tables use `REPLICA IDENTITY
  FULL` so DELETE/UPDATE payloads carry the `event_id` subscribers filter on;
  scoreboards stay consistent after deletions/corrections.

### Residual risk (documented)

- A self-timed athlete reports their own metrics, so self-timed times are
  inherently self-asserted (as with any unattended stopwatch). Organizers can
  delete/override any result. Director-timed results cannot be forged.
- Knowing a public event id **and** a victim's per-device session token would
  let a client write that athlete's self-timed result, but the token is a
  client-only random secret never exposed by the API.

### Manual Supabase validation

Automated tests cover the localStorage backend and the shared semantics; the
Supabase RLS/RPC/realtime paths need a live project. To validate manually:

1. Create a Supabase project, enable **Email** auth (disable "Confirm email" for
   the quickest loop), and run `supabase/migrations/0001_init.sql` then
   (optionally) `supabase/seed.sql` in the SQL editor.
2. Copy `.env.example` → `.env.local`, fill `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY`, and `npm run dev`.
3. Visit `/admin` → you should be required to sign in. Create an account, then
   create an event and confirm it appears (owner-scoped).
4. In a second (incognito) browser, open `/event/<slug>`, join, self-time, and
   **Save** — the result appears on the scoreboard as `self`. Save again and
   confirm it **updates in place** (no duplicate). This exercises
   `submit_self_result` against the owner-only `results` UPDATE policy.
5. From the anon session, confirm a direct `results` insert is rejected, e.g.
   `supabase.from('results').insert({ event_id, source: 'director_timed' })`
   returns an RLS error, and `supabase.rpc('assign_finisher', …)` is denied.
6. As the organizer, open the Timing Station, run a race, assign finishers, and
   confirm director-timed results write and the second browser's scoreboard
   updates live — including after you **delete** a result (realtime DELETE).
7. Timing Station: tap RECORD FINISHER offline (or block the network), confirm
   taps show "Not synced", reload the page and confirm they are **restored** for
   retry, and that **Reset** warns before discarding unsynced taps.

## Brand

Near-black `#0A0A0A`, light-blue accent `#8CC8F0`, dark-blue secondary `#4682B4`,
Bebas Neue display type, monospace race clock, diagonal slash + grit texture.
