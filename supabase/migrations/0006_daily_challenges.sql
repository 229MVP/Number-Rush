-- Number Rush: global daily challenge definitions (UTC date_key)

CREATE TABLE IF NOT EXISTS public.daily_challenges (
  date_key date PRIMARY KEY,
  seed text NOT NULL,
  target_value integer NOT NULL DEFAULT 21 CHECK (target_value >= 1),
  maximum_strikes integer NOT NULL DEFAULT 3 CHECK (maximum_strikes >= 1),
  maximum_tiles integer NOT NULL DEFAULT 40 CHECK (maximum_tiles >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT daily_challenges_seed_unique UNIQUE (seed)
);
