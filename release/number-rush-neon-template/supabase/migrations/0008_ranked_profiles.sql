-- Number Rush: ranked seasons + profiles (season table first)

CREATE TABLE IF NOT EXISTS public.ranked_seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_key text NOT NULL UNIQUE,
  name text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ranked_seasons_window CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS public.ranked_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  season_id uuid REFERENCES public.ranked_seasons (id) ON DELETE SET NULL,
  ranked_points integer NOT NULL DEFAULT 0 CHECK (ranked_points >= 0),
  season_high_points integer NOT NULL DEFAULT 0 CHECK (season_high_points >= 0),
  games_played integer NOT NULL DEFAULT 0 CHECK (games_played >= 0),
  wins integer NOT NULL DEFAULT 0 CHECK (wins >= 0),
  losses integer NOT NULL DEFAULT 0 CHECK (losses >= 0),
  draws integer NOT NULL DEFAULT 0 CHECK (draws >= 0),
  current_win_streak integer NOT NULL DEFAULT 0 CHECK (current_win_streak >= 0),
  best_win_streak integer NOT NULL DEFAULT 0 CHECK (best_win_streak >= 0),
  promotions integer NOT NULL DEFAULT 0 CHECK (promotions >= 0),
  demotions integer NOT NULL DEFAULT 0 CHECK (demotions >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS ranked_profiles_set_updated_at ON public.ranked_profiles;
CREATE TRIGGER ranked_profiles_set_updated_at
  BEFORE UPDATE ON public.ranked_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
