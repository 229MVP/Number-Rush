-- Number Rush: durable monetization entitlements (non-consumable / subscription flags)

CREATE TABLE IF NOT EXISTS public.monetization_entitlements (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  remove_ads boolean NOT NULL DEFAULT false,
  club_active boolean NOT NULL DEFAULT false,
  club_expiration_date timestamptz,
  starter_bundle_claimed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS monetization_entitlements_set_updated_at ON public.monetization_entitlements;
CREATE TRIGGER monetization_entitlements_set_updated_at
  BEFORE UPDATE ON public.monetization_entitlements
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
