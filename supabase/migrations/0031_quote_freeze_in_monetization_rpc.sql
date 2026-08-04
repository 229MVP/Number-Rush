-- Quote freeze column usages in monetization RPCs (reserved keyword).

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
      "freeze" = "freeze" + COALESCE((v_inv ->> 'freeze')::integer, 0),
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
