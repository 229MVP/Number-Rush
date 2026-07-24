# Number Rush — Connected Backend Completion Report

**Branch:** `cursor/supabase-backend-dca3`  
**Date:** 2026-07-24  
**Remote migrations applied:** **NO** (explicitly withheld)

## Critical safety note

The environment’s default Supabase MCP project is **not** Number Rush (sports/draft schema). Migrations and Edge Functions were authored **locally only**. Do not `db push` until a dedicated Number Rush project is linked.

## Packages installed

- `@supabase/supabase-js`
- `expo-secure-store`
- `react-native-url-polyfill`
- `expo-network`
- `expo-linking`

## Environment

`.env.example` adds:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Feature flags `EXPO_PUBLIC_FEATURE_*`

## Database (local SQL)

Migrations `0001`–`0015` under `supabase/migrations/` plus `seed.sql` and `config.toml`.

Tables: player_profiles, player_progress, player_inventory, player_statistics, daily_challenges, daily_submissions, ranked_seasons, ranked_profiles, ranked_run_tickets, ranked_matches, economy_transactions, sync_metadata.

RPCs include: claim_username, ensure/get_daily_challenge, has_daily_submission, get_daily_leaderboard, issue_ranked_run_ticket, get_ranked_leaderboard, get_my_cloud_progress, initialize_player_data, delete_my_account_data, get_public_player_profile, calculate_ranked_points_delta.

RLS enabled with own-row SELECT; protected economy/competitive writes via RPC / Edge Functions only.

## Edge Functions (source only)

- `supabase/functions/validate-run`
- `supabase/functions/delete-account`

## Client features

- AuthProvider + magic link screens + AuthCallback deep link
- Guest mode preserved for Classic / local progression
- Cloud sync + migration helpers + pending submission queue
- Network provider
- Live Daily/Ranked leaderboard services (fallback LOCAL PREVIEW)
- Ranked mode config (30 tiles, no power-ups) + Ranked lobby UI
- Feature flags keep offline play working when Supabase unset

## Validation run in this environment

| Check | Result |
|-------|--------|
| `tsc --noEmit` | PASS |
| Jest | PASS (71 tests / 19 suites at last run) |
| Remote Supabase apply | **NOT RUN** |
| Local `supabase start` / SQL tests | **NOT RUN** (no Docker DB exercised) |
| Edge Function deploy | **NOT RUN** |

## Not production-ready until

- Dedicated Number Rush project linked
- Migrations applied + RLS tests executed
- validate-run replay tested end-to-end
- Duplicate daily / ticket reuse tested
- Account deletion tested
- Confirm no service-role in client bundle

## Operator next commands

```bash
# 1) Create Number Rush Supabase project in dashboard
# 2) Fill .env with URL + anon key
npx supabase link --project-ref <NUMBER_RUSH_REF>
# APPROVE before:
npx supabase db push
npx supabase functions deploy validate-run
npx supabase functions deploy delete-account
```
