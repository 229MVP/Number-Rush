-- Number Rush: per-player progress (critical fields structured; expandable JSON)

CREATE TABLE IF NOT EXISTS public.player_progress (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  classic_best_score integer NOT NULL DEFAULT 0 CHECK (classic_best_score >= 0),
  tutorial_completed boolean NOT NULL DEFAULT false,
  selected_theme_id text NOT NULL DEFAULT 'neon-classic',
  progression_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  mission_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  settings_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  local_revision bigint NOT NULL DEFAULT 0 CHECK (local_revision >= 0),
  server_revision bigint NOT NULL DEFAULT 0 CHECK (server_revision >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS player_progress_set_updated_at ON public.player_progress;
CREATE TRIGGER player_progress_set_updated_at
  BEFORE UPDATE ON public.player_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
