-- Number Rush: store purchase fulfillment ledger (RevenueCat / Play / App Store)

CREATE TABLE IF NOT EXISTS public.purchase_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_transaction_id text NOT NULL UNIQUE,
  revenuecat_event_id text UNIQUE,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  product_id text NOT NULL,
  purchase_kind text NOT NULL,
  gems_granted integer NOT NULL DEFAULT 0,
  inventory_granted jsonb NOT NULL DEFAULT '{}'::jsonb,
  entitlement_granted text,
  environment text NOT NULL,
  purchased_at timestamptz,
  processed_at timestamptz,
  status text NOT NULL,
  raw_event_reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS purchase_transactions_user_created_idx
  ON public.purchase_transactions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS purchase_transactions_product_idx
  ON public.purchase_transactions (product_id, created_at DESC);
