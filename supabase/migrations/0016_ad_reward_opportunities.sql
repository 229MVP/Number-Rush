-- Number Rush: server-issued ad reward opportunities (client requests before showing rewarded ad)

CREATE TABLE IF NOT EXISTS public.ad_reward_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  placement text NOT NULL,
  reward_payload jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ad_reward_opportunities_user_expires_idx
  ON public.ad_reward_opportunities (user_id, expires_at DESC);

CREATE INDEX IF NOT EXISTS ad_reward_opportunities_user_open_idx
  ON public.ad_reward_opportunities (user_id, created_at DESC)
  WHERE consumed_at IS NULL;
