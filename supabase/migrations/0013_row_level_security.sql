-- Number Rush: row level security for the corrected schema.
-- Client uses publishable/anon + authenticated JWT only (never service_role in the app).
-- Economy, submissions, ranked tickets, ranked matches, and username changes go through RPCs / edge functions.

-- ---------------------------------------------------------------------------
-- Enable RLS on all player-facing tables in public
-- ---------------------------------------------------------------------------

ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranked_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranked_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranked_run_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranked_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economy_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_metadata ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Column-level table privileges (defense in depth with RLS)
-- ---------------------------------------------------------------------------

REVOKE ALL ON public.player_profiles FROM authenticated, anon;
REVOKE ALL ON public.player_progress FROM authenticated, anon;
REVOKE ALL ON public.player_inventory FROM authenticated, anon;
REVOKE ALL ON public.player_statistics FROM authenticated, anon;
REVOKE ALL ON public.daily_challenges FROM authenticated, anon;
REVOKE ALL ON public.daily_submissions FROM authenticated, anon;
REVOKE ALL ON public.ranked_seasons FROM authenticated, anon;
REVOKE ALL ON public.ranked_profiles FROM authenticated, anon;
REVOKE ALL ON public.ranked_run_tickets FROM authenticated, anon;
REVOKE ALL ON public.ranked_matches FROM authenticated, anon;
REVOKE ALL ON public.economy_transactions FROM authenticated, anon;
REVOKE ALL ON public.sync_metadata FROM authenticated, anon;

GRANT SELECT ON public.player_profiles TO authenticated;
GRANT SELECT ON public.player_progress TO authenticated;
GRANT SELECT ON public.player_inventory TO authenticated;
GRANT SELECT ON public.player_statistics TO authenticated;
GRANT SELECT ON public.daily_submissions TO authenticated;
GRANT SELECT ON public.ranked_profiles TO authenticated;
GRANT SELECT ON public.ranked_run_tickets TO authenticated;
GRANT SELECT ON public.ranked_matches TO authenticated;
GRANT SELECT ON public.economy_transactions TO authenticated;
GRANT SELECT ON public.sync_metadata TO authenticated;

GRANT SELECT ON public.daily_challenges TO authenticated, anon;
GRANT SELECT ON public.ranked_seasons TO authenticated, anon;

-- Offline-first client progress writes. Coins/gems, inventory, usernames, and ranked points are not granted.
GRANT UPDATE (
  classic_best_score,
  tutorial_completed,
  selected_theme_id,
  progression_payload,
  mission_payload,
  settings_payload,
  local_revision
) ON public.player_progress TO authenticated;

GRANT INSERT (
  user_id,
  device_id,
  local_revision,
  last_synced_at,
  pending_domains
) ON public.sync_metadata TO authenticated;
GRANT UPDATE (
  local_revision,
  server_revision,
  last_synced_at,
  pending_domains
) ON public.sync_metadata TO authenticated;

-- ---------------------------------------------------------------------------
-- Drop old/new policy names for idempotent re-apply
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS player_profiles_select_own ON public.player_profiles;
DROP POLICY IF EXISTS player_progress_select_own ON public.player_progress;
DROP POLICY IF EXISTS player_progress_update_sync ON public.player_progress;
DROP POLICY IF EXISTS player_progress_update_allowed_columns ON public.player_progress;
DROP POLICY IF EXISTS player_inventory_select_own ON public.player_inventory;
DROP POLICY IF EXISTS player_statistics_select_own ON public.player_statistics;
DROP POLICY IF EXISTS daily_challenges_select_authenticated ON public.daily_challenges;
DROP POLICY IF EXISTS daily_challenges_select_anon ON public.daily_challenges;
DROP POLICY IF EXISTS daily_submissions_select_own ON public.daily_submissions;
DROP POLICY IF EXISTS ranked_seasons_select_authenticated ON public.ranked_seasons;
DROP POLICY IF EXISTS ranked_seasons_select_anon ON public.ranked_seasons;
DROP POLICY IF EXISTS ranked_profiles_select_own ON public.ranked_profiles;
DROP POLICY IF EXISTS ranked_run_tickets_select_own ON public.ranked_run_tickets;
DROP POLICY IF EXISTS ranked_matches_select_participant ON public.ranked_matches;
DROP POLICY IF EXISTS ranked_matches_select_own ON public.ranked_matches;
DROP POLICY IF EXISTS economy_transactions_select_own ON public.economy_transactions;
DROP POLICY IF EXISTS sync_metadata_select_own ON public.sync_metadata;
DROP POLICY IF EXISTS sync_metadata_insert_own ON public.sync_metadata;
DROP POLICY IF EXISTS sync_metadata_update_own ON public.sync_metadata;

-- ---------------------------------------------------------------------------
-- player_profiles: SELECT own row; username changes via claim_username() only
-- ---------------------------------------------------------------------------

CREATE POLICY player_profiles_select_own
  ON public.player_profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- ---------------------------------------------------------------------------
-- player_progress: SELECT own; UPDATE only granted client-sync columns
-- ---------------------------------------------------------------------------

CREATE POLICY player_progress_select_own
  ON public.player_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY player_progress_update_allowed_columns
  ON public.player_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- player_inventory / player_statistics: SELECT own; no client writes
-- ---------------------------------------------------------------------------

CREATE POLICY player_inventory_select_own
  ON public.player_inventory
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY player_statistics_select_own
  ON public.player_statistics
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- daily_challenges: read challenge definitions (authenticated + anon)
-- ---------------------------------------------------------------------------

CREATE POLICY daily_challenges_select_authenticated
  ON public.daily_challenges
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY daily_challenges_select_anon
  ON public.daily_challenges
  FOR SELECT
  TO anon
  USING (true);

-- ---------------------------------------------------------------------------
-- daily_submissions: SELECT own; inserts/validation via trusted writers only
-- ---------------------------------------------------------------------------

CREATE POLICY daily_submissions_select_own
  ON public.daily_submissions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- ranked_seasons: read active/archived season metadata
-- ---------------------------------------------------------------------------

CREATE POLICY ranked_seasons_select_authenticated
  ON public.ranked_seasons
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY ranked_seasons_select_anon
  ON public.ranked_seasons
  FOR SELECT
  TO anon
  USING (true);

-- ---------------------------------------------------------------------------
-- ranked_profiles: SELECT own; ranked_points updates via trusted writers only
-- ---------------------------------------------------------------------------

CREATE POLICY ranked_profiles_select_own
  ON public.ranked_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- ranked_run_tickets: SELECT own tickets; issue/consume via RPC/edge only
-- ---------------------------------------------------------------------------

CREATE POLICY ranked_run_tickets_select_own
  ON public.ranked_run_tickets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- ranked_matches: solo runs, SELECT own result history only
-- ---------------------------------------------------------------------------

CREATE POLICY ranked_matches_select_own
  ON public.ranked_matches
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- economy_transactions: SELECT own ledger; append via trusted writers only
-- ---------------------------------------------------------------------------

CREATE POLICY economy_transactions_select_own
  ON public.economy_transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- sync_metadata: SELECT/INSERT/UPDATE own device rows
-- ---------------------------------------------------------------------------

CREATE POLICY sync_metadata_select_own
  ON public.sync_metadata
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY sync_metadata_insert_own
  ON public.sync_metadata
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY sync_metadata_update_own
  ON public.sync_metadata
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Leaderboards and cross-user profile views use get_daily_leaderboard,
-- get_ranked_leaderboard, and get_public_player_profile() RPCs only.
