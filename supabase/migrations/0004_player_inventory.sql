-- Number Rush: power-up inventory (one row per player)

CREATE TABLE IF NOT EXISTS public.player_inventory (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  multiplier integer NOT NULL DEFAULT 2 CHECK (multiplier >= 0 AND multiplier <= 9999),
  swap integer NOT NULL DEFAULT 3 CHECK (swap >= 0 AND swap <= 9999),
  bomb integer NOT NULL DEFAULT 0 CHECK (bomb >= 0 AND bomb <= 9999),
  -- "freeze" is reserved in PostgreSQL; always quote this identifier.
  "freeze" integer NOT NULL DEFAULT 0 CHECK ("freeze" >= 0 AND "freeze" <= 9999),
  shield integer NOT NULL DEFAULT 0 CHECK (shield >= 0 AND shield <= 9999),
  wild integer NOT NULL DEFAULT 0 CHECK (wild >= 0 AND wild <= 9999),
  schema_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS player_inventory_set_updated_at ON public.player_inventory;
CREATE TRIGGER player_inventory_set_updated_at
  BEFORE UPDATE ON public.player_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
