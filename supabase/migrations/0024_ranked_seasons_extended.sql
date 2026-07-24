-- Live Ops: extend ranked seasons + season profile history + rewards

ALTER TABLE public.ranked_seasons
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS placement_matches integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS soft_reset_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS reward_configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS soft_reset_configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

UPDATE public.ranked_seasons
SET status = CASE WHEN active THEN 'active' ELSE 'archived' END
WHERE status IS NULL;

ALTER TABLE public.ranked_seasons
  ALTER COLUMN status SET DEFAULT 'draft';

ALTER TABLE public.ranked_seasons
  ALTER COLUMN status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ranked_seasons_status_check'
  ) THEN
    ALTER TABLE public.ranked_seasons
      ADD CONSTRAINT ranked_seasons_status_check
      CHECK (status IN ('draft', 'scheduled', 'active', 'completed', 'archived'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.ranked_season_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  season_id uuid NOT NULL REFERENCES public.ranked_seasons (id) ON DELETE CASCADE,
  ranked_points integer NOT NULL DEFAULT 0 CHECK (ranked_points >= 0),
  season_high_points integer NOT NULL DEFAULT 0 CHECK (season_high_points >= 0),
  games_played integer NOT NULL DEFAULT 0 CHECK (games_played >= 0),
  wins integer NOT NULL DEFAULT 0 CHECK (wins >= 0),
  losses integer NOT NULL DEFAULT 0 CHECK (losses >= 0),
  draws integer NOT NULL DEFAULT 0 CHECK (draws >= 0),
  best_win_streak integer NOT NULL DEFAULT 0 CHECK (best_win_streak >= 0),
  final_division text,
  final_subdivision text,
  reward_claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, season_id)
);

CREATE TABLE IF NOT EXISTS public.season_reward_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  season_id uuid NOT NULL REFERENCES public.ranked_seasons (id) ON DELETE CASCADE,
  reward_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, season_id)
);
