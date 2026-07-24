-- Number Rush: RPC functions, auth bootstrap trigger, and schema helpers for edge workflows.
-- Assumes migrations 0001–0011. Does not apply auth user deletion (edge function + service role).

-- ---------------------------------------------------------------------------
-- Columns required by RPC contracts (safe IF NOT EXISTS for idempotent apply)
-- ---------------------------------------------------------------------------

ALTER TABLE public.daily_submissions
  ADD COLUMN IF NOT EXISTS validation_status text NOT NULL DEFAULT 'pending';

ALTER TABLE public.daily_submissions
  DROP CONSTRAINT IF EXISTS daily_submissions_validation_status_check;

ALTER TABLE public.daily_submissions
  ADD CONSTRAINT daily_submissions_validation_status_check
  CHECK (validation_status IN ('pending', 'accepted', 'rejected'));

ALTER TABLE public.ranked_run_tickets
  ADD COLUMN IF NOT EXISTS seed text;

-- ---------------------------------------------------------------------------
-- Private helpers (SECURITY DEFINER bodies stay off the public attack surface)
-- ---------------------------------------------------------------------------

REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO postgres, service_role;

CREATE OR REPLACE FUNCTION private.assert_authenticated()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated'
      USING ERRCODE = '28000';
  END IF;
  RETURN v_uid;
END;
$$;

REVOKE ALL ON FUNCTION private.assert_authenticated() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.assert_authenticated() TO postgres, service_role;

CREATE OR REPLACE FUNCTION private.normalize_username_display(raw text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT regexp_replace(btrim(COALESCE(raw, '')), '\s+', ' ', 'g');
$$;

CREATE OR REPLACE FUNCTION private.normalize_username_key(raw text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT lower(
    regexp_replace(private.normalize_username_display(raw), '\s+', '', 'g')
  );
$$;

CREATE OR REPLACE FUNCTION private.is_reserved_username(p_key text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT COALESCE(p_key, '') = ANY (
    ARRAY[
      'admin',
      'administrator',
      'moderator',
      'numberrush',
      'support',
      'system'
    ]::text[]
  );
$$;

CREATE OR REPLACE FUNCTION private.active_ranked_season_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.ranked_seasons
  WHERE is_active = true
  ORDER BY starts_at DESC
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION private.active_ranked_season_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.active_ranked_season_id() TO postgres, service_role;

CREATE OR REPLACE FUNCTION private.generate_placeholder_username()
RETURNS TABLE (display_username text, normalized_username text)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_suffix text;
  v_display text;
  v_key text;
  v_attempt integer := 0;
BEGIN
  LOOP
    v_attempt := v_attempt + 1;
    v_suffix := substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
    v_display := 'Player' || v_suffix;
    v_key := private.normalize_username_key(v_display);
  EXIT
    WHEN NOT private.is_reserved_username(v_key)
      AND NOT EXISTS (
        SELECT 1
        FROM public.player_profiles p
        WHERE p.username_normalized = v_key
      )
      OR v_attempt >= 12;
  END LOOP;

  display_username := v_display;
  normalized_username := v_key;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION private.generate_placeholder_username() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.generate_placeholder_username() TO postgres, service_role;

CREATE OR REPLACE FUNCTION private.seed_player_rows(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_display text;
  v_key text;
  v_season_id text;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.player_profiles WHERE id = p_user_id) THEN
    SELECT g.display_username, g.normalized_username
    INTO v_display, v_key
    FROM private.generate_placeholder_username() AS g;

    INSERT INTO public.player_profiles (id, username, username_normalized)
    VALUES (p_user_id, v_display, v_key)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  INSERT INTO public.player_progress (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.player_inventory (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.player_statistics (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  v_season_id := private.active_ranked_season_id();
  IF v_season_id IS NOT NULL THEN
    INSERT INTO public.ranked_profiles (user_id, season_id)
    VALUES (p_user_id, v_season_id)
    ON CONFLICT (user_id, season_id) DO NOTHING;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION private.seed_player_rows(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.seed_player_rows(uuid) TO postgres, service_role;

-- Ranked point delta for edge validation / match completion.
-- Base score brackets, plus survival bonuses. Returned delta is capped (+80 / -40).
-- When applying to a profile: new_points = GREATEST(0, current_ranked_points + delta).
CREATE OR REPLACE FUNCTION public.calculate_ranked_points_delta(
  score integer,
  strikes_remaining integer,
  perfects integer,
  max_combo integer
)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
AS $$
DECLARE
  v_base integer := 0;
  v_bonus integer := 0;
  v_delta integer;
  v_score integer := COALESCE(score, 0);
  v_strikes integer := GREATEST(COALESCE(strikes_remaining, 0), 0);
  v_perfects integer := GREATEST(COALESCE(perfects, 0), 0);
  v_combo integer := GREATEST(COALESCE(max_combo, 0), 0);
BEGIN
  IF v_score < 300 THEN
    v_base := -25;
  ELSIF v_score < 600 THEN
    v_base := -10;
  ELSIF v_score < 900 THEN
    v_base := 5;
  ELSIF v_score < 1200 THEN
    v_base := 20;
  ELSIF v_score < 1500 THEN
    v_base := 40;
  ELSE
    v_base := 60;
  END IF;

  v_bonus :=
    (v_strikes * 5)
    + (v_perfects * 2)
    + (GREATEST(v_combo - 1, 0) * 3);

  v_delta := v_base + v_bonus;
  v_delta := LEAST(v_delta, 80);
  v_delta := GREATEST(v_delta, -40);
  RETURN v_delta;
END;
$$;

COMMENT ON FUNCTION public.calculate_ranked_points_delta(integer, integer, integer, integer) IS
  'Computes capped ranked RP delta from run stats. Apply with floor: GREATEST(0, current_points + delta).';

-- ---------------------------------------------------------------------------
-- Auth trigger: default rows for new users
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM private.seed_player_rows(NEW.id);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Public RPCs
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.claim_username(desired_username text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := private.assert_authenticated();
  v_display text;
  v_key text;
BEGIN
  v_display := private.normalize_username_display(desired_username);
  v_key := private.normalize_username_key(desired_username);

  IF char_length(v_display) < 3 OR char_length(v_display) > 16 THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'username_length',
      'username', NULL
    );
  END IF;

  IF v_key !~ '^[a-z0-9_]+$' OR v_key = '' THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'username_invalid',
      'username', NULL
    );
  END IF;

  IF private.is_reserved_username(v_key) THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'username_reserved',
      'username', NULL
    );
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.player_profiles p
    WHERE p.username_normalized = v_key
      AND p.id <> v_uid
  ) THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'username_taken',
      'username', NULL
    );
  END IF;

  UPDATE public.player_profiles
  SET
    username = v_display,
    username_normalized = v_key
  WHERE id = v_uid;

  IF NOT FOUND THEN
    PERFORM private.seed_player_rows(v_uid);
    UPDATE public.player_profiles
    SET
      username = v_display,
      username_normalized = v_key
    WHERE id = v_uid;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'error', NULL,
    'username', v_display
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_daily_challenge(challenge_date date)
RETURNS public.daily_challenges
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.daily_challenges;
  v_seed text := 'number-rush-daily-' || to_char(challenge_date, 'YYYY-MM-DD');
BEGIN
  INSERT INTO public.daily_challenges (date_key, seed)
  VALUES (challenge_date, v_seed)
  ON CONFLICT (date_key) DO NOTHING;

  SELECT *
  INTO v_row
  FROM public.daily_challenges
  WHERE date_key = challenge_date;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_daily_challenge(challenge_date date DEFAULT CURRENT_DATE)
RETURNS public.daily_challenges
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.ensure_daily_challenge(challenge_date);
$$;

CREATE OR REPLACE FUNCTION public.has_daily_submission(challenge_date date)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.daily_submissions ds
    WHERE ds.user_id = private.assert_authenticated()
      AND ds.date_key = challenge_date
  );
$$;

CREATE OR REPLACE FUNCTION public.get_daily_leaderboard(
  p_date date,
  p_limit integer DEFAULT 100
)
RETURNS TABLE (
  rank bigint,
  username text,
  score integer,
  perfect_clears integer,
  max_combo_multiplier integer,
  submitted_at timestamptz,
  is_current_user boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH v_uid AS (
    SELECT private.assert_authenticated() AS uid
  ),
  ranked AS (
    SELECT
      ROW_NUMBER() OVER (
        ORDER BY
          ds.score DESC,
          ds.perfect_clears DESC,
          ds.max_combo_multiplier DESC,
          ds.submitted_at ASC
      ) AS rank,
      p.username,
      ds.score,
      ds.perfect_clears,
      ds.max_combo_multiplier,
      ds.submitted_at,
      (ds.user_id = (SELECT uid FROM v_uid)) AS is_current_user
    FROM public.daily_submissions ds
    INNER JOIN public.player_profiles p ON p.id = ds.user_id
    WHERE ds.date_key = p_date
      AND ds.validation_status = 'accepted'
  )
  SELECT
    ranked.rank,
    ranked.username,
    ranked.score,
    ranked.perfect_clears,
    ranked.max_combo_multiplier,
    ranked.submitted_at,
    ranked.is_current_user
  FROM ranked
  ORDER BY ranked.rank
  LIMIT GREATEST(LEAST(COALESCE(p_limit, 100), 500), 1);
$$;

CREATE OR REPLACE FUNCTION public.issue_ranked_run_ticket()
RETURNS TABLE (
  id uuid,
  seed text,
  season_id text,
  expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := private.assert_authenticated();
  v_season_id text;
  v_ticket_id uuid;
  v_seed text;
  v_expires timestamptz;
BEGIN
  v_season_id := private.active_ranked_season_id();
  IF v_season_id IS NULL THEN
    RAISE EXCEPTION 'No active ranked season'
      USING ERRCODE = 'P0001';
  END IF;

  PERFORM private.seed_player_rows(v_uid);

  UPDATE public.ranked_run_tickets t
  SET expires_at = now()
  WHERE t.user_id = v_uid
    AND t.season_id = v_season_id
    AND t.consumed_at IS NULL
    AND t.expires_at > now();

  v_seed := 'ranked-' || gen_random_uuid()::text;
  v_expires := now() + interval '2 hours';

  INSERT INTO public.ranked_run_tickets (user_id, season_id, seed, expires_at)
  VALUES (v_uid, v_season_id, v_seed, v_expires)
  RETURNING ranked_run_tickets.id, ranked_run_tickets.seed, ranked_run_tickets.season_id, ranked_run_tickets.expires_at
  INTO v_ticket_id, v_seed, v_season_id, v_expires;

  id := v_ticket_id;
  seed := v_seed;
  season_id := v_season_id;
  expires_at := v_expires;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_ranked_leaderboard(p_limit integer DEFAULT 100)
RETURNS TABLE (
  rank bigint,
  username text,
  ranked_points integer,
  division text,
  subdivision integer,
  wins integer,
  losses integer,
  is_current_user boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH v_ctx AS (
    SELECT
      private.assert_authenticated() AS uid,
      private.active_ranked_season_id() AS season_id
  ),
  ranked AS (
    SELECT
      ROW_NUMBER() OVER (
        ORDER BY
          rp.ranked_points DESC,
          rp.wins DESC,
          rp.updated_at ASC
      ) AS rank,
      p.username,
      rp.ranked_points,
      rp.division,
      rp.subdivision,
      rp.wins,
      rp.losses,
      (rp.user_id = v_ctx.uid) AS is_current_user
    FROM public.ranked_profiles rp
    INNER JOIN public.player_profiles p ON p.id = rp.user_id
    CROSS JOIN v_ctx
    WHERE rp.season_id = v_ctx.season_id
  )
  SELECT
    ranked.rank,
    ranked.username,
    ranked.ranked_points,
    ranked.division,
    ranked.subdivision,
    ranked.wins,
    ranked.losses,
    ranked.is_current_user
  FROM ranked
  ORDER BY ranked.rank
  LIMIT GREATEST(LEAST(COALESCE(p_limit, 100), 500), 1);
$$;

CREATE OR REPLACE FUNCTION public.get_my_cloud_progress()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := private.assert_authenticated();
  v_season_id text := private.active_ranked_season_id();
  v_result jsonb;
BEGIN
  PERFORM private.seed_player_rows(v_uid);

  SELECT jsonb_build_object(
    'profile', (
      SELECT to_jsonb(p) - 'username_normalized'
      FROM public.player_profiles p
      WHERE p.id = v_uid
    ),
    'progress', (
      SELECT to_jsonb(pr)
      FROM public.player_progress pr
      WHERE pr.user_id = v_uid
    ),
    'inventory', (
      SELECT to_jsonb(i)
      FROM public.player_inventory i
      WHERE i.user_id = v_uid
    ),
    'statistics', (
      SELECT to_jsonb(s)
      FROM public.player_statistics s
      WHERE s.user_id = v_uid
    ),
    'ranked', (
      SELECT to_jsonb(rp)
      FROM public.ranked_profiles rp
      WHERE rp.user_id = v_uid
        AND rp.season_id = v_season_id
    ),
    'sync_devices', (
      SELECT COALESCE(jsonb_agg(to_jsonb(sm)), '[]'::jsonb)
      FROM public.sync_metadata sm
      WHERE sm.user_id = v_uid
    )
  )
  INTO v_result;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.initialize_player_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := private.assert_authenticated();
BEGIN
  PERFORM private.seed_player_rows(v_uid);
  RETURN public.get_my_cloud_progress();
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_my_account_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := private.assert_authenticated();
BEGIN
  DELETE FROM public.economy_transactions WHERE user_id = v_uid;
  DELETE FROM public.daily_submissions WHERE user_id = v_uid;
  DELETE FROM public.ranked_matches
  WHERE player_a_id = v_uid OR player_b_id = v_uid;
  DELETE FROM public.ranked_run_tickets WHERE user_id = v_uid;
  DELETE FROM public.ranked_profiles WHERE user_id = v_uid;
  DELETE FROM public.sync_metadata WHERE user_id = v_uid;
  DELETE FROM public.player_statistics WHERE user_id = v_uid;
  DELETE FROM public.player_inventory WHERE user_id = v_uid;
  DELETE FROM public.player_progress WHERE user_id = v_uid;
  DELETE FROM public.player_profiles WHERE id = v_uid;

  RETURN jsonb_build_object('ok', true, 'user_id', v_uid);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_player_profile(p_username text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'username', p.username,
    'level', p.level,
    'selected_theme_id', p.selected_theme_id,
    'statistics', jsonb_build_object(
      'highest_classic_score', s.highest_classic_score,
      'games_played', s.games_played,
      'daily_wins', s.daily_wins,
      'ranked_wins', s.ranked_wins,
      'highest_combo_multiplier', s.highest_combo_multiplier
    )
  )
  FROM public.player_profiles p
  INNER JOIN public.player_statistics s ON s.user_id = p.id
  WHERE p.username_normalized = private.normalize_username_key(p_username)
  LIMIT 1;
$$;

-- ---------------------------------------------------------------------------
-- Grants: no PUBLIC execute; authenticated clients call RPCs only (no service role in app)
-- ---------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.calculate_ranked_points_delta(integer, integer, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_username(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.ensure_daily_challenge(date) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_daily_challenge(date) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_daily_submission(date) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_daily_leaderboard(date, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.issue_ranked_run_ticket() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_ranked_leaderboard(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_cloud_progress() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.initialize_player_data() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_my_account_data() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_player_profile(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.calculate_ranked_points_delta(integer, integer, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_username(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_daily_challenge(date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_challenge(date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_daily_submission(date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_leaderboard(date, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.issue_ranked_run_ticket() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ranked_leaderboard(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_cloud_progress() TO authenticated;
GRANT EXECUTE ON FUNCTION public.initialize_player_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_my_account_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_player_profile(text) TO authenticated, anon;
