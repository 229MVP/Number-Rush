# Number Rush — Supabase RLS Summary

Migrations `0012_rpc_functions.sql` and `0013_row_level_security.sql` define how the mobile client (publishable key + user JWT, **never** `service_role`) may access Postgres.

## Principles

- **RLS enabled** on all user data tables in `public`.
- **No client INSERT** into gameplay ledger tables (`daily_submissions`, `economy_transactions`, `ranked_matches`, etc.). Trusted edge functions use the service role.
- **No direct client UPDATE** of coins, gems, power-up counts, ranked points, or usernames. Use RPCs (`claim_username`, `initialize_player_data`, ticket/leaderboard RPCs) or edge validation.
- **Cross-user reads** (leaderboards, public profiles) go through **SECURITY DEFINER** RPCs with narrow return shapes.

## Table policies

| Table | SELECT | INSERT | UPDATE | Notes |
|-------|--------|--------|--------|-------|
| `player_profiles` | Own (`id = auth.uid()`) | — | — | Username via `claim_username()` |
| `player_progress` | Own | — | Own, mission sync columns only | `mission_daily_state`, `mission_weekly_state`, `applied_reward_ids` |
| `player_inventory` | Own | — | — | Quantities changed server-side |
| `player_statistics` | Own | — | — | |
| `daily_challenges` | All authenticated; anon read OK | — | — | Also via `get_daily_challenge()` |
| `daily_submissions` | Own | — | — | Submit via edge; `validation_status = accepted` for leaderboard RPC |
| `ranked_seasons` | All authenticated; anon read OK | — | — | |
| `ranked_profiles` | Own | — | — | Points via edge / `calculate_ranked_points_delta` |
| `ranked_run_tickets` | Own | — | — | Issued via `issue_ranked_run_ticket()` |
| `ranked_matches` | Participant (`player_a_id` / `player_b_id`) | — | — | |
| `economy_transactions` | Own | — | — | Append-only from trusted writers |
| `sync_metadata` | Own | Own device row | Own | `local_revision`, `pending_domains`, sync timestamps |

## RPC surface (authenticated)

Granted to `authenticated` (and `get_public_player_profile` also to `anon`):

- `claim_username`, `initialize_player_data`, `get_my_cloud_progress`, `delete_my_account_data`
- `ensure_daily_challenge`, `get_daily_challenge`, `has_daily_submission`, `get_daily_leaderboard`
- `issue_ranked_run_ticket`, `get_ranked_leaderboard`
- `calculate_ranked_points_delta` (for client display; edge applies authoritative RP)
- `get_public_player_profile`

`REVOKE ALL … FROM PUBLIC` on these functions; no broad `PUBLIC` execute.

## Auth bootstrap

`handle_new_user` trigger on `auth.users` inserts default rows into profiles, progress, inventory, statistics, and `ranked_profiles` for the active season (`private.seed_player_rows`).

## Account deletion

`delete_my_account_data()` removes Number Rush rows for `auth.uid()`. Deleting the Auth user remains an edge/admin step with the service role.
