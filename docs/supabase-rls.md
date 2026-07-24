# Number Rush — Supabase RLS Summary

Migrations `0012_rpc_functions.sql` and `0013_row_level_security.sql` define how the mobile client (publishable key + user JWT, **never** `service_role`) may access Postgres for the corrected Number Rush schema.

## Principles

- **RLS enabled** on all user-facing tables in `public`.
- **Own-row SELECT** on private player tables (`player_profiles`, `player_progress`, `player_inventory`, `player_statistics`, submissions, ranked history, economy ledger, and sync metadata).
- **No client INSERT** into gameplay or economy ledger tables (`daily_submissions`, `ranked_matches`, `economy_transactions`) or ranked ticket creation (`ranked_run_tickets`). Trusted edge functions/RPCs use privileged execution.
- **No direct client UPDATE** of usernames, coins, gems, inventory counts, economy transactions, ranked points, tickets, submissions, or matches.
- **Direct client UPDATE is limited** to approved offline-first `player_progress` fields and the user's own `sync_metadata` device rows.
- **Cross-user reads** (leaderboards, public profiles) go through **SECURITY DEFINER** RPCs with narrow return shapes.

## Table policies

| Table | SELECT | INSERT | UPDATE | Notes |
|-------|--------|--------|--------|-------|
| `player_profiles` | Own (`id = auth.uid()`) | — | — | Username via `claim_username()`; coins/gems are server-owned |
| `player_progress` | Own | — | Own, approved columns only | `classic_best_score`, `tutorial_completed`, `selected_theme_id`, `progression_payload`, `mission_payload`, `settings_payload`, `local_revision` |
| `player_inventory` | Own | — | — | Inventory changes are server-owned |
| `player_statistics` | Own | — | — | Statistics are updated by trusted validation/sync flows |
| `daily_challenges` | Authenticated and anon | — | — | Also created/read via `ensure_daily_challenge()` / `get_daily_challenge()` |
| `daily_submissions` | Own | — | — | Submit via trusted edge; leaderboard RPC returns `validation_status = accepted` only |
| `ranked_seasons` | Authenticated and anon | — | — | Uses corrected `active` boolean |
| `ranked_profiles` | Own | — | — | `ranked_points` and season stats are trusted-writer only |
| `ranked_run_tickets` | Own | — | — | Issued via `issue_ranked_run_ticket()`; prior active tickets are expired |
| `ranked_matches` | Own (`user_id = auth.uid()`) | — | — | Solo ranked runs; inserted by trusted validation only |
| `economy_transactions` | Own | — | — | Append-only from trusted writers; idempotent by `transaction_id` |
| `sync_metadata` | Own | Own device row | Own | `local_revision`, `server_revision`, `last_synced_at`, `pending_domains` |

## RPC surface

Granted to `authenticated`:

- `claim_username`, `initialize_player_data`, `get_my_cloud_progress`, `delete_my_account_data`
- `ensure_daily_challenge`, `get_daily_challenge`, `has_daily_submission`, `get_daily_leaderboard`
- `issue_ranked_run_ticket`, `get_ranked_leaderboard`
- `calculate_ranked_points_delta` (client display only; trusted validation applies authoritative RP)

Granted to `authenticated` and `anon`:

- `get_public_player_profile`

All RPCs use `SECURITY DEFINER` with `search_path = public`, and each has `REVOKE ALL ... FROM PUBLIC` before role-specific grants.

## Auth bootstrap

`handle_new_user` on `auth.users` calls `private.seed_player_rows`, which inserts defaults for:

- `player_profiles` with a normalized placeholder username and reserved-name protection
- `player_progress` using corrected payload columns (`progression_payload`, `mission_payload`, `settings_payload`) and revisions
- `player_inventory`
- `player_statistics`
- `ranked_profiles` for the active UUID `ranked_seasons.id`

## Gameplay helpers

- Daily challenge seeds use `number-rush-daily-YYYY-MM-DD`.
- Ranked run tickets expire prior active tickets for the same user/season, use a 2 hour expiry, and seed runs as `ranked-{uuid}`.
- Ranked matches are solo runs keyed by unique `run_id` and include validation status, hashes, score stats, RP delta, and previous/new points.
- `calculate_ranked_points_delta(score, strikes_remaining, perfects, max_combo)` uses the shared score brackets and caps the result to `+80 / -40`.

## Account deletion

`delete_my_account_data()` removes Number Rush data rows for `auth.uid()` only. Deleting the Auth user remains an edge/admin step with the service role.
