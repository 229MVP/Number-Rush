# Number Rush — Live Ops Admin

Minimal Next.js 15 + React 19 TypeScript dashboard for authorized Live Ops operators.

## Setup

```bash
cd admin
cp .env.example .env.local
# Fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon (publishable) key |

**Do not put a service-role key in this app.** The browser and Next.js middleware use only the anon key plus the signed-in user’s session. Privileged mutations belong in RLS-gated RPCs or Edge Functions that verify `operator_roles` server-side.

## Authorization

1. Sign in via `/login` (Supabase Auth email magic link / password — wire as needed).
2. Middleware requires a session for all routes except `/login` and `/unauthorized`.
3. Server pages call `requireOperator()`, which checks `public.operator_roles` (RPC or table select).
4. Active rows in `operator_roles` are required. Non-operators are redirected to `/unauthorized`.
5. Under Live Ops RLS, `operator_roles` is revoked from `anon`/`authenticated`; non-operators are denied, and operators may need a SECURITY DEFINER RPC (e.g. `is_liveops_operator`) or Edge Function until an operator SELECT policy exists.

## Scripts

| Script | Command |
|--------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Node smoke tests (no Jest) |

## Pages

Overview, Remote Config, Seasons, Events, Announcements, Leaderboards, Anti-Cheat, Player Support, Economy, Feature Flags, Release Status, Audit Log.

Each page is a server component shell with placeholder empty/unavailable states — no fabricated LIVE metrics.

## Related

- Edge Function stub: `../supabase/functions/liveops-admin`
- Schema: `operator_roles`, Live Ops migrations under `../supabase/migrations`
