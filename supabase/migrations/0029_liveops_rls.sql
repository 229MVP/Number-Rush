-- Live Ops RLS: players read public live content; no client writes to admin tables

ALTER TABLE public.remote_config_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remote_config_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economy_config_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranked_season_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_reward_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.username_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.run_validation_reviews ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.remote_config_versions FROM authenticated, anon;
REVOKE ALL ON public.remote_config_audit_log FROM authenticated, anon;
REVOKE ALL ON public.economy_config_versions FROM authenticated, anon;
REVOKE ALL ON public.operator_roles FROM authenticated, anon;
REVOKE ALL ON public.operator_audit_log FROM authenticated, anon;
REVOKE ALL ON public.leaderboard_moderation_actions FROM authenticated, anon;
REVOKE ALL ON public.run_validation_reviews FROM authenticated, anon;

-- Players may read their own season history / claims / participation / reads / feedback
GRANT SELECT ON public.ranked_season_profiles TO authenticated;
GRANT SELECT ON public.season_reward_claims TO authenticated;
GRANT SELECT ON public.event_participation TO authenticated;
GRANT SELECT ON public.event_mission_progress TO authenticated;
GRANT SELECT ON public.announcement_reads TO authenticated;
GRANT SELECT ON public.beta_feedback TO authenticated;
GRANT SELECT ON public.live_events TO authenticated, anon;
GRANT SELECT ON public.event_missions TO authenticated, anon;
GRANT SELECT ON public.announcements TO authenticated, anon;

DROP POLICY IF EXISTS ranked_season_profiles_select_own ON public.ranked_season_profiles;
CREATE POLICY ranked_season_profiles_select_own
  ON public.ranked_season_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS season_reward_claims_select_own ON public.season_reward_claims;
CREATE POLICY season_reward_claims_select_own
  ON public.season_reward_claims FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS event_participation_select_own ON public.event_participation;
CREATE POLICY event_participation_select_own
  ON public.event_participation FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS event_mission_progress_select_own ON public.event_mission_progress;
CREATE POLICY event_mission_progress_select_own
  ON public.event_mission_progress FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS announcement_reads_select_own ON public.announcement_reads;
CREATE POLICY announcement_reads_select_own
  ON public.announcement_reads FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS beta_feedback_select_own ON public.beta_feedback;
CREATE POLICY beta_feedback_select_own
  ON public.beta_feedback FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS live_events_public_read_active ON public.live_events;
CREATE POLICY live_events_public_read_active
  ON public.live_events FOR SELECT TO authenticated, anon
  USING (status IN ('scheduled', 'active', 'completed'));

DROP POLICY IF EXISTS event_missions_public_read ON public.event_missions;
CREATE POLICY event_missions_public_read
  ON public.event_missions FOR SELECT TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.live_events e
      WHERE e.id = event_id AND e.status IN ('scheduled', 'active', 'completed')
    )
  );

DROP POLICY IF EXISTS announcements_public_read_published ON public.announcements;
CREATE POLICY announcements_public_read_published
  ON public.announcements FOR SELECT TO authenticated, anon
  USING (status = 'published');

-- No INSERT/UPDATE/DELETE policies for players on admin tables (default deny).
