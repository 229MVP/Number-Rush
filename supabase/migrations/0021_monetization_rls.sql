-- Number Rush: RLS for monetization tables

ALTER TABLE public.ad_reward_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monetization_entitlements ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.ad_reward_opportunities FROM authenticated, anon;
REVOKE ALL ON public.ad_reward_transactions FROM authenticated, anon;
REVOKE ALL ON public.purchase_transactions FROM authenticated, anon;
REVOKE ALL ON public.monetization_entitlements FROM authenticated, anon;

GRANT SELECT ON public.ad_reward_opportunities TO authenticated;
GRANT SELECT ON public.ad_reward_transactions TO authenticated;
GRANT SELECT ON public.purchase_transactions TO authenticated;
GRANT SELECT ON public.monetization_entitlements TO authenticated;

DROP POLICY IF EXISTS ad_reward_opportunities_select_own ON public.ad_reward_opportunities;
DROP POLICY IF EXISTS ad_reward_transactions_select_own ON public.ad_reward_transactions;
DROP POLICY IF EXISTS purchase_transactions_select_own ON public.purchase_transactions;
DROP POLICY IF EXISTS monetization_entitlements_select_own ON public.monetization_entitlements;

CREATE POLICY ad_reward_opportunities_select_own
  ON public.ad_reward_opportunities
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY ad_reward_transactions_select_own
  ON public.ad_reward_transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY purchase_transactions_select_own
  ON public.purchase_transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY monetization_entitlements_select_own
  ON public.monetization_entitlements
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- No INSERT/UPDATE/DELETE policies for authenticated on verified ledgers or entitlements.
-- Opportunities are created via create_ad_reward_opportunity(); fulfillment via Edge + service_role RPCs.
