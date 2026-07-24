-- Number Rush: row level security
-- Client uses publishable/anon + authenticated JWT only (never service_role in the app).
-- Mutations to economy, submissions, and usernames go through RPC / edge functions.

-- ---------------------------------------------------------------------------
-- Enable RLS on all player-facing tables
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
GRANT SELECT ON public.daily_challenges TO authenticated;
GRANT SELECT ON public.daily_submissions TO authenticated;
GRANT SELECT ON public.ranked_seasons TO authenticated;
GRANT SELECT ON public.ranked_profiles TO authenticated;
GRANT SELECT ON public.ranked_run_tickets TO authenticated;
GRANT SELECT ON public.ranked_matches TO authenticated;
GRANT SELECT ON public.economy_transactions TO authenticated;
GRANT SELECT ON public.sync_metadata TO authenticated;

-- Offline-first sync: clients may patch mission payloads and per-device sync rows only.
GRANT UPDATE (mission_daily_state, mission_weekly_state, applied_reward_ids)
  ON public.player_progress TO authenticated;
GRANT UPDATE (local_revision, server_revision, last_synced_at, pending_domains)
  ON public.sync_metadata TO authenticated;
GRANT INSERT (user_id, device_id, local_revision, server_revision, last_synced_at, pending_domains)
  ON public.sync_metadata TO authenticated;

-- Public read of challenge metadata (optional anon read of challenge rows only).
GRANT SELECT ON public.daily_challenges TO anon;
GRANT SELECT ON public.ranked_seasons TO anon;

-- ---------------------------------------------------------------------------
-- player_profiles — SELECT own row; username changes via claim_username() only
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS player_profiles_select_own ON public.player_profiles;
CREATE POLICY player_profiles_select_own
  ON public.player_profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- ---------------------------------------------------------------------------
-- player_progress — SELECT own; UPDATE limited mission sync columns (see GRANT)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS player_progress_select_own ON public.player_progress;
CREATE POLICY player_progress_select_own
  ON public.player_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS player_progress_update_sync ON public.player_progress;
CREATE POLICY player_progress_update_sync
  ON public.player_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND highest_classic_score IS NOT DISTINCT FROM (
      SELECT p.highest_classic_score
      FROM public.player_progress p
      WHERE p.user_id = auth.uid()
    )
    AND tutorial_completed IS NOT DISTINCT FROM (
      SELECT p.tutorial_completed
      FROM public.player_progress p
      WHERE p.user_id = auth.uid()
    )
    AND schema_version IS NOT DISTINCT FROM (
      SELECT p.schema_version
      FROM public.player_progress p
      WHERE p.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- player_inventory / player_statistics — SELECT own; no client writes
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS player_inventory_select_own ON public.player_inventory;
CREATE POLICY player_inventory_select_own
  ON public.player_inventory
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS player_statistics_select_own ON public.player_statistics;
CREATE POLICY player_statistics_select_own
  ON public.player_statistics
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- daily_challenges — read challenge definition (authenticated + anon)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS daily_challenges_select_authenticated ON public.daily_challenges;
CREATE POLICY daily_challenges_select_authenticated
  ON public.daily_challenges
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS daily_challenges_select_anon ON public.daily_challenges;
CREATE POLICY daily_challenges_select_anon
  ON public.daily_challenges
  FOR SELECT
  TO anon
  USING (true);

-- ---------------------------------------------------------------------------
-- daily_submissions — SELECT own; inserts/validation via edge (service role)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS daily_submissions_select_own ON public.daily_submissions;
CREATE POLICY daily_submissions_select_own
  ON public.daily_submissions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- ranked_seasons — read season metadata
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS ranked_seasons_select_authenticated ON public.ranked_seasons;
CREATE POLICY ranked_seasons_select_authenticated
  ON public.ranked_seasons
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS ranked_seasons_select_anon ON public.ranked_seasons;
CREATE POLICY ranked_seasons_select_anon
  ON public.ranked_seasons
  FOR SELECT
  TO anon
  USING (true);

-- ---------------------------------------------------------------------------
-- ranked_profiles — SELECT own; RP updates via edge / RPC only
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS ranked_profiles_select_own ON public.ranked_profiles;
CREATE POLICY ranked_profiles_select_own
  ON public.ranked_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- ranked_run_tickets — SELECT own open/history tickets
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS ranked_run_tickets_select_own ON public.ranked_run_tickets;
CREATE POLICY ranked_run_tickets_select_own
  ON public.ranked_run_tickets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- ranked_matches — SELECT matches the user participated in
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS ranked_matches_select_participant ON public.ranked_matches;
CREATE POLICY ranked_matches_select_participant
  ON public.ranked_matches
  FOR SELECT
  TO authenticated
  USING (
    player_a_id = auth.uid()
    OR player_b_id = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- economy_transactions — SELECT own ledger; append via trusted writers only
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS economy_transactions_select_own ON public.economy_transactions;
CREATE POLICY economy_transactions_select_own
  ON public.economy_transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- sync_metadata — SELECT/INSERT/UPDATE own device rows
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS sync_metadata_select_own ON public.sync_metadata;
CREATE POLICY sync_metadata_select_own
  ON public.sync_metadata
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS sync_metadata_insert_own ON public.sync_metadata;
CREATE POLICY sync_metadata_insert_own
  ON public.sync_metadata
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS sync_metadata_update_own ON public.sync_metadata;
CREATE POLICY sync_metadata_update_own
  ON public.sync_metadata
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Leaderboards and cross-user profile views: use get_daily_leaderboard,
-- get_ranked_leaderboard, and get_public_player_profile() RPCs only.
