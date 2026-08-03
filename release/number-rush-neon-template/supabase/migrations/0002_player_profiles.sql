-- Number Rush: player profiles (auth-linked)

CREATE TABLE IF NOT EXISTS public.player_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username text NOT NULL,
  username_normalized text NOT NULL,
  level integer NOT NULL DEFAULT 1 CHECK (level >= 1),
  current_xp integer NOT NULL DEFAULT 0 CHECK (current_xp >= 0),
  total_xp bigint NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  coins bigint NOT NULL DEFAULT 500 CHECK (coins >= 0),
  gems bigint NOT NULL DEFAULT 25 CHECK (gems >= 0),
  selected_theme_id text NOT NULL DEFAULT 'neon-classic',
  unlocked_theme_ids jsonb NOT NULL DEFAULT '["neon-classic"]'::jsonb,
  schema_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT player_profiles_username_length CHECK (
    char_length(username) >= 3 AND char_length(username) <= 16
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS player_profiles_username_normalized_key
  ON public.player_profiles (username_normalized);

DROP TRIGGER IF EXISTS player_profiles_set_updated_at ON public.player_profiles;
CREATE TRIGGER player_profiles_set_updated_at
  BEFORE UPDATE ON public.player_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
