-- Number Rush: monetization RPCs (opportunities, entitlements, fulfillment, refunds)
--
-- Product reward map (RevenueCat / store product_id → fulfillment):
--   gems_80      → 80 gems
--   gems_450     → 450 gems
--   gems_1000    → 1000 gems
--   gems_2500    → 2500 gems
--   starter_bundle → 500 gems + multiplier+5, swap+5, bomb+3, freeze+3, shield+2 + remove_ads (once per account)
--   remove_ads   → remove_ads entitlement only (no gems)
--   number_rush_club → DISABLED until launch (RPC rejects)

-- ---------------------------------------------------------------------------
-- Private economy helper (gems + inventory + ledger)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION private.apply_monetization_grant(
  p_user_id uuid,
  p_transaction_id text,
  p_source text,
  p_gems_delta integer,
  p_inventory_delta jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gems integer := COALESCE(p_gems_delta, 0);
  v_inv jsonb := COALESCE(p_inventory_delta, '{}'::jsonb);
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id is required';
  END IF;

  PERFORM private.seed_player_rows(p_user_id);

  IF v_gems <> 0 THEN
    UPDATE public.player_profiles
    SET gems = gems + v_gems
    WHERE id = p_user_id;

    IF v_gems > 0 THEN
      UPDATE public.player_statistics
      SET total_gems_earned = total_gems_earned + v_gems
      WHERE user_id = p_user_id;
    END IF;
  END IF;

  IF v_inv <> '{}'::jsonb THEN
    UPDATE public.player_inventory
    SET
      multiplier = multiplier + COALESCE((v_inv ->> 'multiplier')::integer, 0),
      swap = swap + COALESCE((v_inv ->> 'swap')::integer, 0),
      bomb = bomb + COALESCE((v_inv ->> 'bomb')::integer, 0),
      freeze = freeze + COALESCE((v_inv ->> 'freeze')::integer, 0),
      shield = shield + COALESCE((v_inv ->> 'shield')::integer, 0),
      wild = wild + COALESCE((v_inv ->> 'wild')::integer, 0)
    WHERE user_id = p_user_id;
  END IF;

  INSERT INTO public.economy_transactions (
    transaction_id,
    user_id,
    transaction_type,
    coins_delta,
    gems_delta,
    inventory_delta,
    source
  )
  VALUES (
    p_transaction_id,
    p_user_id,
    'monetization_grant',
    0,
    v_gems,
    v_inv,
    p_source
  )
  ON CONFLICT (transaction_id) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION private.apply_monetization_grant(uuid, text, text, integer, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.apply_monetization_grant(uuid, text, text, integer, jsonb) TO postgres, service_role;

-- ---------------------------------------------------------------------------
-- Product resolution
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION private.monetization_product_fulfillment(p_product_id text)
RETURNS TABLE (
  gems integer,
  inventory jsonb,
  grant_remove_ads boolean,
  grant_club boolean,
  is_starter_bundle boolean,
  purchase_kind text,
  entitlement_label text,
  enabled boolean
)
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CASE COALESCE(p_product_id, '')
    WHEN 'gems_80' THEN
      RETURN QUERY SELECT 80, '{}'::jsonb, false, false, false, 'consumable', NULL::text, true;
    WHEN 'numberrush.gems_80' THEN
      RETURN QUERY SELECT 80, '{}'::jsonb, false, false, false, 'consumable', NULL::text, true;
    WHEN 'gems_450' THEN
      RETURN QUERY SELECT 450, '{}'::jsonb, false, false, false, 'consumable', NULL::text, true;
    WHEN 'numberrush.gems_450' THEN
      RETURN QUERY SELECT 450, '{}'::jsonb, false, false, false, 'consumable', NULL::text, true;
    WHEN 'gems_1000' THEN
      RETURN QUERY SELECT 1000, '{}'::jsonb, false, false, false, 'consumable', NULL::text, true;
    WHEN 'numberrush.gems_1000' THEN
      RETURN QUERY SELECT 1000, '{}'::jsonb, false, false, false, 'consumable', NULL::text, true;
    WHEN 'gems_2500' THEN
      RETURN QUERY SELECT 2500, '{}'::jsonb, false, false, false, 'consumable', NULL::text, true;
    WHEN 'numberrush.gems_2500' THEN
      RETURN QUERY SELECT 2500, '{}'::jsonb, false, false, false, 'consumable', NULL::text, true;
    WHEN 'starter_bundle' THEN
      RETURN QUERY SELECT
        500,
        jsonb_build_object(
          'multiplier', 5,
          'swap', 5,
          'bomb', 3,
          'freeze', 3,
          'shield', 2
        ),
        true,
        false,
        true,
        'non_consumable',
        'starter_bundle',
        true;
    WHEN 'numberrush.starter_bundle' THEN
      RETURN QUERY SELECT
        500,
        jsonb_build_object(
          'multiplier', 5,
          'swap', 5,
          'bomb', 3,
          'freeze', 3,
          'shield', 2
        ),
        true,
        false,
        true,
        'non_consumable',
        'starter_bundle',
        true;
    WHEN 'remove_ads' THEN
      RETURN QUERY SELECT 0, '{}'::jsonb, true, false, false, 'non_consumable', 'remove_ads', true;
    WHEN 'numberrush.remove_ads' THEN
      RETURN QUERY SELECT 0, '{}'::jsonb, true, false, false, 'non_consumable', 'remove_ads', true;
    WHEN 'number_rush_club' THEN
      RETURN QUERY SELECT 0, '{}'::jsonb, false, true, false, 'subscription', 'number_rush_club', false;
    WHEN 'numberrush.club.monthly' THEN
      RETURN QUERY SELECT 0, '{}'::jsonb, false, true, false, 'subscription', 'number_rush_club', false;
    WHEN 'numberrush.club.annual' THEN
      RETURN QUERY SELECT 0, '{}'::jsonb, false, true, false, 'subscription', 'number_rush_club', false;
    ELSE
      RETURN QUERY SELECT 0, '{}'::jsonb, false, false, false, 'unknown', NULL::text, false;
  END CASE;
END;
$$;

REVOKE ALL ON FUNCTION private.monetization_product_fulfillment(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.monetization_product_fulfillment(text) TO postgres, service_role;

-- ---------------------------------------------------------------------------
-- Client: create ad reward opportunity (15 minute TTL)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_ad_reward_opportunity(
  placement text,
  reward_payload jsonb
)
RETURNS public.ad_reward_opportunities
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := private.assert_authenticated();
  v_row public.ad_reward_opportunities;
BEGIN
  IF COALESCE(btrim(placement), '') = '' THEN
    RAISE EXCEPTION 'placement is required';
  END IF;

  IF reward_payload IS NULL OR reward_payload = 'null'::jsonb THEN
    RAISE EXCEPTION 'reward_payload is required';
  END IF;

  INSERT INTO public.ad_reward_opportunities (
    user_id,
    placement,
    reward_payload,
    expires_at
  )
  VALUES (
    v_uid,
    placement,
    reward_payload,
    now() + interval '15 minutes'
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- ---------------------------------------------------------------------------
-- Client: read entitlements (upsert default row)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_my_monetization_entitlements()
RETURNS public.monetization_entitlements
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := private.assert_authenticated();
  v_row public.monetization_entitlements;
BEGIN
  INSERT INTO public.monetization_entitlements (user_id)
  VALUES (v_uid)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_row
  FROM public.monetization_entitlements
  WHERE user_id = v_uid;

  RETURN v_row;
END;
$$;

-- ---------------------------------------------------------------------------
-- Edge (service_role): verified AdMob SSV fulfillment
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.apply_verified_ad_reward(
  p_admob_transaction_id text,
  p_user_id uuid,
  p_placement text,
  p_opportunity_id text,
  p_reward_item text,
  p_reward_amount integer,
  p_custom_data jsonb DEFAULT NULL
)
RETURNS public.ad_reward_transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_opp public.ad_reward_opportunities;
  v_row public.ad_reward_transactions;
  v_payload_item text;
  v_payload_amount integer;
  v_gems integer := 0;
  v_inv jsonb := '{}'::jsonb;
BEGIN
  IF COALESCE(btrim(p_admob_transaction_id), '') = '' THEN
    RAISE EXCEPTION 'admob_transaction_id is required';
  END IF;

  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id is required';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.ad_reward_transactions t
    WHERE t.admob_transaction_id = p_admob_transaction_id
  ) THEN
    INSERT INTO public.ad_reward_transactions (
      admob_transaction_id,
      user_id,
      placement,
      opportunity_id,
      reward_item,
      reward_amount,
      custom_data,
      verification_status
    )
    VALUES (
      p_admob_transaction_id,
      p_user_id,
      COALESCE(p_placement, ''),
      COALESCE(p_opportunity_id, ''),
      COALESCE(p_reward_item, ''),
      COALESCE(p_reward_amount, 0),
      p_custom_data,
      'duplicate'
    )
    ON CONFLICT (admob_transaction_id) DO NOTHING;

    SELECT * INTO v_row
    FROM public.ad_reward_transactions
    WHERE admob_transaction_id = p_admob_transaction_id;

    RETURN v_row;
  END IF;

  BEGIN
    SELECT * INTO v_opp
    FROM public.ad_reward_opportunities o
    WHERE o.id::text = p_opportunity_id
      AND o.user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invalid or missing opportunity';
    END IF;

    IF v_opp.consumed_at IS NOT NULL THEN
      RAISE EXCEPTION 'Opportunity already consumed';
    END IF;

    IF v_opp.expires_at < now() THEN
      RAISE EXCEPTION 'Opportunity expired';
    END IF;

    IF COALESCE(btrim(v_opp.placement), '') <> COALESCE(btrim(p_placement), '') THEN
      RAISE EXCEPTION 'Placement mismatch';
    END IF;

    v_payload_item := v_opp.reward_payload ->> 'reward_item';
    v_payload_amount := (v_opp.reward_payload ->> 'reward_amount')::integer;

    IF v_payload_item IS DISTINCT FROM p_reward_item
       OR v_payload_amount IS DISTINCT FROM p_reward_amount THEN
      RAISE EXCEPTION 'Reward does not match opportunity payload';
    END IF;

    UPDATE public.ad_reward_opportunities
    SET consumed_at = now()
    WHERE id = v_opp.id;

    IF p_reward_item = 'gems' THEN
      v_gems := GREATEST(COALESCE(p_reward_amount, 0), 0);
    ELSIF p_reward_item IN ('multiplier', 'swap', 'bomb', 'freeze', 'shield', 'wild') THEN
      v_inv := jsonb_build_object(p_reward_item, GREATEST(COALESCE(p_reward_amount, 0), 0));
    ELSE
      RAISE EXCEPTION 'Unsupported reward_item %', p_reward_item;
    END IF;

    PERFORM private.apply_monetization_grant(
      p_user_id,
      'admob:' || p_admob_transaction_id,
      'admob_ssv',
      v_gems,
      v_inv
    );

    INSERT INTO public.ad_reward_transactions (
      admob_transaction_id,
      user_id,
      placement,
      opportunity_id,
      reward_item,
      reward_amount,
      custom_data,
      verification_status,
      verified_at
    )
    VALUES (
      p_admob_transaction_id,
      p_user_id,
      p_placement,
      p_opportunity_id,
      p_reward_item,
      p_reward_amount,
      p_custom_data,
      'verified',
      now()
    )
    RETURNING * INTO v_row;

    RETURN v_row;
  EXCEPTION
    WHEN OTHERS THEN
      INSERT INTO public.ad_reward_transactions (
        admob_transaction_id,
        user_id,
        placement,
        opportunity_id,
        reward_item,
        reward_amount,
        custom_data,
        verification_status
      )
      VALUES (
        p_admob_transaction_id,
        p_user_id,
        COALESCE(p_placement, ''),
        COALESCE(p_opportunity_id, ''),
        COALESCE(p_reward_item, ''),
        COALESCE(p_reward_amount, 0),
        p_custom_data,
        'rejected'
      )
      ON CONFLICT (admob_transaction_id) DO UPDATE
      SET verification_status = 'rejected'
      RETURNING * INTO v_row;

      RETURN v_row;
  END;
END;
$$;

-- ---------------------------------------------------------------------------
-- Edge (service_role): purchase fulfillment
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.apply_purchase_fulfillment(
  p_store_transaction_id text,
  p_revenuecat_event_id text,
  p_user_id uuid,
  p_product_id text,
  p_purchase_kind text,
  p_environment text,
  p_purchased_at timestamptz DEFAULT NULL,
  p_raw_event_reference text DEFAULT NULL,
  p_status text DEFAULT 'completed',
  p_club_expiration timestamptz DEFAULT NULL
)
RETURNS public.purchase_transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_map record;
  v_row public.purchase_transactions;
  v_ent public.monetization_entitlements;
BEGIN
  IF COALESCE(btrim(p_store_transaction_id), '') = '' THEN
    RAISE EXCEPTION 'store_transaction_id is required';
  END IF;

  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id is required';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.purchase_transactions pt
    WHERE pt.store_transaction_id = p_store_transaction_id
  ) THEN
    SELECT * INTO v_row
    FROM public.purchase_transactions
    WHERE store_transaction_id = p_store_transaction_id;
    RETURN v_row;
  END IF;

  IF p_revenuecat_event_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.purchase_transactions pt
    WHERE pt.revenuecat_event_id = p_revenuecat_event_id
  ) THEN
    SELECT * INTO v_row
    FROM public.purchase_transactions
    WHERE revenuecat_event_id = p_revenuecat_event_id;
    RETURN v_row;
  END IF;

  SELECT *
  INTO v_map
  FROM private.monetization_product_fulfillment(p_product_id) AS m;

  IF NOT COALESCE(v_map.enabled, false) THEN
    RAISE EXCEPTION 'Unknown or disabled product_id: %', p_product_id;
  END IF;

  INSERT INTO public.monetization_entitlements (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_ent
  FROM public.monetization_entitlements
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_map.is_starter_bundle AND v_ent.starter_bundle_claimed THEN
    RAISE EXCEPTION 'starter_bundle already claimed';
  END IF;

  PERFORM private.apply_monetization_grant(
    p_user_id,
    'purchase:' || p_store_transaction_id,
    'iap:' || p_product_id,
    v_map.gems,
    v_map.inventory
  );

  UPDATE public.monetization_entitlements
  SET
    remove_ads = remove_ads OR v_map.grant_remove_ads,
    starter_bundle_claimed = starter_bundle_claimed OR v_map.is_starter_bundle,
    club_active = CASE
      WHEN v_map.grant_club THEN true
      ELSE club_active
    END,
    club_expiration_date = CASE
      WHEN v_map.grant_club THEN COALESCE(p_club_expiration, club_expiration_date)
      ELSE club_expiration_date
    END
  WHERE user_id = p_user_id;

  INSERT INTO public.purchase_transactions (
    store_transaction_id,
    revenuecat_event_id,
    user_id,
    product_id,
    purchase_kind,
    gems_granted,
    inventory_granted,
    entitlement_granted,
    environment,
    purchased_at,
    processed_at,
    status,
    raw_event_reference
  )
  VALUES (
    p_store_transaction_id,
    p_revenuecat_event_id,
    p_user_id,
    p_product_id,
    COALESCE(NULLIF(btrim(p_purchase_kind), ''), v_map.purchase_kind),
    v_map.gems,
    v_map.inventory,
    v_map.entitlement_label,
    COALESCE(p_environment, 'UNKNOWN'),
    p_purchased_at,
    now(),
    COALESCE(p_status, 'completed'),
    p_raw_event_reference
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- ---------------------------------------------------------------------------
-- Edge (service_role): purchase refund / revocation
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.record_purchase_refund(
  p_store_transaction_id text,
  p_revenuecat_event_id text DEFAULT NULL,
  p_refund_reason text DEFAULT NULL
)
RETURNS public.purchase_transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_orig public.purchase_transactions;
  v_row public.purchase_transactions;
  v_claw_gems integer;
  v_inv jsonb;
BEGIN
  SELECT * INTO v_orig
  FROM public.purchase_transactions
  WHERE store_transaction_id = p_store_transaction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Purchase not found: %', p_store_transaction_id;
  END IF;

  IF v_orig.status = 'refunded' THEN
    RETURN v_orig;
  END IF;

  v_claw_gems := -LEAST(v_orig.gems_granted, (
    SELECT gems::integer FROM public.player_profiles WHERE id = v_orig.user_id
  ));

  v_inv := '{}'::jsonb;
  IF v_orig.inventory_granted IS NOT NULL AND v_orig.inventory_granted <> '{}'::jsonb THEN
    SELECT jsonb_object_agg(k, -LEAST((v_orig.inventory_granted ->> k)::integer, (
      CASE k
        WHEN 'multiplier' THEN (SELECT multiplier FROM public.player_inventory WHERE user_id = v_orig.user_id)
        WHEN 'swap' THEN (SELECT swap FROM public.player_inventory WHERE user_id = v_orig.user_id)
        WHEN 'bomb' THEN (SELECT bomb FROM public.player_inventory WHERE user_id = v_orig.user_id)
        WHEN 'freeze' THEN (SELECT freeze FROM public.player_inventory WHERE user_id = v_orig.user_id)
        WHEN 'shield' THEN (SELECT shield FROM public.player_inventory WHERE user_id = v_orig.user_id)
        WHEN 'wild' THEN (SELECT wild FROM public.player_inventory WHERE user_id = v_orig.user_id)
        ELSE 0
      END
    )::integer))
    INTO v_inv
    FROM jsonb_object_keys(v_orig.inventory_granted) AS k;
  END IF;

  IF v_orig.user_id IS NOT NULL AND (v_claw_gems <> 0 OR v_inv <> '{}'::jsonb) THEN
    PERFORM private.apply_monetization_grant(
      v_orig.user_id,
      'refund:' || p_store_transaction_id,
      'iap_refund',
      v_claw_gems,
      COALESCE(v_inv, '{}'::jsonb)
    );
  END IF;

  IF v_orig.user_id IS NOT NULL THEN
    UPDATE public.monetization_entitlements
    SET
      remove_ads = CASE
        WHEN v_orig.entitlement_granted = 'remove_ads' OR v_orig.product_id = 'starter_bundle' THEN false
        ELSE remove_ads
      END,
      starter_bundle_claimed = CASE
        WHEN v_orig.product_id = 'starter_bundle' THEN false
        ELSE starter_bundle_claimed
      END,
      club_active = CASE
        WHEN v_orig.entitlement_granted = 'number_rush_club' THEN false
        ELSE club_active
      END,
      club_expiration_date = CASE
        WHEN v_orig.entitlement_granted = 'number_rush_club' THEN NULL
        ELSE club_expiration_date
      END
    WHERE user_id = v_orig.user_id;
  END IF;

  UPDATE public.purchase_transactions
  SET
    status = 'refunded',
    processed_at = now(),
    raw_event_reference = COALESCE(p_refund_reason, raw_event_reference)
  WHERE id = v_orig.id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- ---------------------------------------------------------------------------
-- Account deletion: include monetization tables
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.delete_my_account_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := private.assert_authenticated();
BEGIN
  DELETE FROM public.ad_reward_opportunities WHERE user_id = v_uid;
  DELETE FROM public.ad_reward_transactions WHERE user_id = v_uid;
  DELETE FROM public.purchase_transactions WHERE user_id = v_uid;
  DELETE FROM public.monetization_entitlements WHERE user_id = v_uid;
  DELETE FROM public.economy_transactions WHERE user_id = v_uid;
  DELETE FROM public.daily_submissions WHERE user_id = v_uid;
  DELETE FROM public.ranked_matches WHERE user_id = v_uid;
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

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.create_ad_reward_opportunity(text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_monetization_entitlements() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_verified_ad_reward(text, uuid, text, text, text, integer, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_purchase_fulfillment(text, text, uuid, text, text, text, timestamptz, text, text, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_purchase_refund(text, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_ad_reward_opportunity(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_monetization_entitlements() TO authenticated;

GRANT EXECUTE ON FUNCTION public.apply_verified_ad_reward(text, uuid, text, text, text, integer, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_purchase_fulfillment(text, text, uuid, text, text, text, timestamptz, text, text, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_purchase_refund(text, text, text) TO service_role;

GRANT EXECUTE ON FUNCTION public.delete_my_account_data() TO authenticated;
