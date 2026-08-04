-- Live Ops RPCs: server time, published config, seasons, events, announcements
-- Privileged finalize/publish functions are stubs that require operator role checks.

CREATE OR REPLACE FUNCTION public.get_server_time()
RETURNS timestamptz
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT now();
$$;

REVOKE ALL ON FUNCTION public.get_server_time() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_server_time() TO anon, authenticated;

CREATE OR REPLACE FUNCTION private.operator_has_role(p_user_id uuid, p_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.operator_roles r
    WHERE r.user_id = p_user_id
      AND r.active = true
      AND r.role = ANY (p_roles)
  );
$$;

REVOKE ALL ON FUNCTION private.operator_has_role(uuid, text[]) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.get_published_remote_config(p_environment text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config jsonb;
BEGIN
  IF p_environment NOT IN ('development', 'preview', 'production') THEN
    RETURN NULL;
  END IF;

  SELECT configuration
  INTO v_config
  FROM public.remote_config_versions
  WHERE environment = p_environment
    AND status = 'published'
  ORDER BY published_at DESC NULLS LAST, version DESC
  LIMIT 1;

  RETURN v_config;
END;
$$;

REVOKE ALL ON FUNCTION public.get_published_remote_config(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_published_remote_config(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_current_ranked_season()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.ranked_seasons%ROWTYPE;
BEGIN
  SELECT *
  INTO v_row
  FROM public.ranked_seasons
  WHERE status = 'active'
     OR (active = true AND (status IS NULL OR status = 'active'))
  ORDER BY starts_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id', v_row.id,
    'season_key', v_row.season_key,
    'name', v_row.name,
    'description', v_row.description,
    'starts_at', v_row.starts_at,
    'ends_at', v_row.ends_at,
    'status', COALESCE(v_row.status, 'active')
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_current_ranked_season() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_current_ranked_season() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_upcoming_ranked_season()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.ranked_seasons%ROWTYPE;
BEGIN
  SELECT * INTO v_row
  FROM public.ranked_seasons
  WHERE status = 'scheduled' AND starts_at > now()
  ORDER BY starts_at ASC
  LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  RETURN jsonb_build_object(
    'id', v_row.id,
    'season_key', v_row.season_key,
    'name', v_row.name,
    'description', v_row.description,
    'starts_at', v_row.starts_at,
    'ends_at', v_row.ends_at,
    'status', v_row.status
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_upcoming_ranked_season() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_upcoming_ranked_season() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_previous_ranked_season()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.ranked_seasons%ROWTYPE;
BEGIN
  SELECT * INTO v_row
  FROM public.ranked_seasons
  WHERE status IN ('completed', 'archived')
  ORDER BY ends_at DESC
  LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  RETURN jsonb_build_object(
    'id', v_row.id,
    'season_key', v_row.season_key,
    'name', v_row.name,
    'description', v_row.description,
    'starts_at', v_row.starts_at,
    'ends_at', v_row.ends_at,
    'status', v_row.status
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_previous_ranked_season() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_previous_ranked_season() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_active_live_events()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE(
    (
      SELECT jsonb_agg(jsonb_build_object(
        'id', e.id,
        'event_key', e.event_key,
        'name', e.name,
        'description', e.description,
        'event_type', e.event_type,
        'starts_at', e.starts_at,
        'ends_at', e.ends_at,
        'status', e.status,
        'accent_color', e.accent_color,
        'banner_asset_url', e.banner_asset_url
      ) ORDER BY e.starts_at)
      FROM public.live_events e
      WHERE e.status = 'active'
        AND e.starts_at <= now()
        AND e.ends_at > now()
    ),
    '[]'::jsonb
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_active_live_events() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_active_live_events() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_active_announcements()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE(
    (
      SELECT jsonb_agg(jsonb_build_object(
        'id', a.id,
        'title', a.title,
        'body', a.body,
        'announcement_type', a.announcement_type,
        'audience', a.audience,
        'starts_at', a.starts_at,
        'ends_at', a.ends_at,
        'priority', a.priority,
        'dismissible', a.dismissible,
        'action_type', a.action_type,
        'action_value', a.action_value,
        'image_url', a.image_url
      ) ORDER BY a.priority DESC, a.starts_at DESC)
      FROM public.announcements a
      WHERE a.status = 'published'
        AND a.starts_at <= now()
        AND (a.ends_at IS NULL OR a.ends_at > now())
    ),
    '[]'::jsonb
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_active_announcements() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_active_announcements() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.join_live_event(p_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_event public.live_events%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;
  SELECT * INTO v_event FROM public.live_events WHERE id = p_event_id;
  IF NOT FOUND OR v_event.status <> 'active' OR v_event.starts_at > now() OR v_event.ends_at <= now() THEN
    RAISE EXCEPTION 'event not active';
  END IF;
  INSERT INTO public.event_participation (event_id, user_id)
  VALUES (p_event_id, v_uid)
  ON CONFLICT (event_id, user_id) DO NOTHING;
  RETURN jsonb_build_object('ok', true, 'event_id', p_event_id);
END;
$$;

REVOKE ALL ON FUNCTION public.join_live_event(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_live_event(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_season_reward(p_season_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_season public.ranked_seasons%ROWTYPE;
  v_profile public.ranked_season_profiles%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;
  SELECT * INTO v_season FROM public.ranked_seasons WHERE id = p_season_id;
  IF NOT FOUND OR v_season.status NOT IN ('completed', 'archived') THEN
    RAISE EXCEPTION 'season rewards unavailable';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.season_reward_claims
    WHERE user_id = v_uid AND season_id = p_season_id
  ) THEN
    RAISE EXCEPTION 'already claimed';
  END IF;
  SELECT * INTO v_profile
  FROM public.ranked_season_profiles
  WHERE user_id = v_uid AND season_id = p_season_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'no season profile';
  END IF;

  INSERT INTO public.season_reward_claims (user_id, season_id, reward_payload)
  VALUES (
    v_uid,
    p_season_id,
    COALESCE(v_season.reward_configuration -> v_profile.final_division, '{}'::jsonb)
  );

  UPDATE public.ranked_season_profiles
  SET reward_claimed_at = now(), updated_at = now()
  WHERE user_id = v_uid AND season_id = p_season_id;

  RETURN jsonb_build_object('ok', true, 'season_id', p_season_id);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_season_reward(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_season_reward(uuid) TO authenticated;

-- Soft-reset map helper (data-driven; used by finalize stub)
CREATE OR REPLACE FUNCTION private.soft_reset_points(p_points integer, p_config jsonb)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v_bronze_cap integer := COALESCE((p_config ->> 'bronze_cap')::integer, 299);
  v_silver integer := COALESCE((p_config ->> 'silver')::integer, 300);
  v_gold integer := COALESCE((p_config ->> 'gold')::integer, 600);
  v_plat integer := COALESCE((p_config ->> 'platinum')::integer, 1000);
  v_diamond integer := COALESCE((p_config ->> 'diamond')::integer, 1500);
  v_blaze integer := COALESCE((p_config ->> 'blaze')::integer, 2000);
BEGIN
  -- Soft reset floors by current tier band (data-driven).
  IF p_points >= 2500 THEN RETURN v_blaze; END IF;
  IF p_points >= 1800 THEN RETURN v_diamond; END IF;
  IF p_points >= 1200 THEN RETURN v_plat; END IF;
  IF p_points >= 800 THEN RETURN v_gold; END IF;
  IF p_points >= 400 THEN RETURN v_silver; END IF;
  RETURN LEAST(p_points, v_bronze_cap);
END;
$$;

REVOKE ALL ON FUNCTION private.soft_reset_points(integer, jsonb) FROM PUBLIC;

-- Finalize is operator-only and idempotent; do not execute remotely without approval.
CREATE OR REPLACE FUNCTION public.finalize_ranked_season(p_season_id uuid, p_reason text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_season public.ranked_seasons%ROWTYPE;
BEGIN
  IF v_uid IS NULL OR NOT private.operator_has_role(
    v_uid,
    ARRAY['release_manager', 'administrator', 'liveops_manager']
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO v_season FROM public.ranked_seasons WHERE id = p_season_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'season not found'; END IF;
  IF v_season.status = 'completed' THEN
    RETURN jsonb_build_object('ok', true, 'already_finalized', true);
  END IF;
  IF v_season.ends_at > now() THEN
    RAISE EXCEPTION 'season has not ended';
  END IF;

  INSERT INTO public.ranked_season_profiles (
    user_id, season_id, ranked_points, season_high_points, games_played,
    wins, losses, draws, best_win_streak
  )
  SELECT
    rp.user_id, p_season_id, rp.ranked_points, rp.season_high_points, rp.games_played,
    rp.wins, rp.losses, rp.draws, rp.best_win_streak
  FROM public.ranked_profiles rp
  WHERE rp.season_id = p_season_id
  ON CONFLICT (user_id, season_id) DO NOTHING;

  UPDATE public.ranked_seasons
  SET status = 'completed', active = false
  WHERE id = p_season_id;

  INSERT INTO public.operator_audit_log (actor_user_id, action, target_type, target_id, reason, new_state)
  VALUES (
    v_uid,
    'finalize_ranked_season',
    'ranked_season',
    p_season_id::text,
    p_reason,
    jsonb_build_object('status', 'completed')
  );

  RETURN jsonb_build_object('ok', true, 'season_id', p_season_id);
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_ranked_season(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.finalize_ranked_season(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_beta_feedback(
  p_category text,
  p_description text,
  p_current_screen text DEFAULT NULL,
  p_app_version text DEFAULT NULL,
  p_platform text DEFAULT NULL,
  p_release_channel text DEFAULT NULL,
  p_diagnostic_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;
  INSERT INTO public.beta_feedback (
    user_id, category, description, current_screen, app_version, platform, release_channel, diagnostic_id
  ) VALUES (
    v_uid, p_category, p_description, p_current_screen, p_app_version, p_platform, p_release_channel, p_diagnostic_id
  ) RETURNING id INTO v_id;
  RETURN jsonb_build_object('ok', true, 'id', v_id);
END;
$$;

REVOKE ALL ON FUNCTION public.submit_beta_feedback(text, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_beta_feedback(text, text, text, text, text, text, text) TO authenticated;
