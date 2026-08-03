-- Number Rush: append-only economy ledger (idempotent by transaction_id)

CREATE TABLE IF NOT EXISTS public.economy_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  transaction_type text NOT NULL,
  coins_delta integer NOT NULL DEFAULT 0,
  gems_delta integer NOT NULL DEFAULT 0,
  inventory_delta jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL,
  source_run_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
