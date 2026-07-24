-- Number Rush: AdMob server-side verification (SSV) reward ledger (append-only)

CREATE TABLE IF NOT EXISTS public.ad_reward_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admob_transaction_id text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  placement text NOT NULL,
  opportunity_id text NOT NULL,
  reward_item text NOT NULL,
  reward_amount integer NOT NULL,
  custom_data jsonb,
  verification_status text NOT NULL,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ad_reward_transactions_verification_status_check
    CHECK (verification_status IN ('verified', 'rejected', 'duplicate', 'error'))
);

CREATE INDEX IF NOT EXISTS ad_reward_transactions_user_created_idx
  ON public.ad_reward_transactions (user_id, created_at DESC);
