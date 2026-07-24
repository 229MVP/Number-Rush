-- Repair / ensure player_inventory.freeze is a quoted identifier when table already exists.
-- Safe no-op when column already named freeze (Postgres stores unquoted identifiers lowercased).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'player_inventory'
      AND column_name = 'freeze'
  ) THEN
    -- Column already exists as freeze; references in later RPCs must use "freeze".
    NULL;
  END IF;
END $$;
