-- Number Rush: lifetime statistics (nonnegative counters)

CREATE TABLE IF NOT EXISTS public.player_statistics (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  highest_classic_score integer NOT NULL DEFAULT 0 CHECK (highest_classic_score >= 0),
  games_played integer NOT NULL DEFAULT 0 CHECK (games_played >= 0),
  classic_games_played integer NOT NULL DEFAULT 0 CHECK (classic_games_played >= 0),
  daily_games_played integer NOT NULL DEFAULT 0 CHECK (daily_games_played >= 0),
  ranked_games_played integer NOT NULL DEFAULT 0 CHECK (ranked_games_played >= 0),
  total_perfect_clears integer NOT NULL DEFAULT 0 CHECK (total_perfect_clears >= 0),
  total_tiles_placed integer NOT NULL DEFAULT 0 CHECK (total_tiles_placed >= 0),
  total_coins_earned bigint NOT NULL DEFAULT 0 CHECK (total_coins_earned >= 0),
  total_gems_earned bigint NOT NULL DEFAULT 0 CHECK (total_gems_earned >= 0),
  highest_combo_multiplier integer NOT NULL DEFAULT 0 CHECK (highest_combo_multiplier >= 0),
  longest_perfect_streak integer NOT NULL DEFAULT 0 CHECK (longest_perfect_streak >= 0),
  daily_wins integer NOT NULL DEFAULT 0 CHECK (daily_wins >= 0),
  ranked_wins integer NOT NULL DEFAULT 0 CHECK (ranked_wins >= 0),
  schema_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS player_statistics_set_updated_at ON public.player_statistics;
CREATE TRIGGER player_statistics_set_updated_at
  BEFORE UPDATE ON public.player_statistics
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
