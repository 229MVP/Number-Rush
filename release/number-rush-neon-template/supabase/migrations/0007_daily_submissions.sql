-- Number Rush: official daily run submissions (one official attempt per user per day)

CREATE TABLE IF NOT EXISTS public.daily_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  date_key date NOT NULL REFERENCES public.daily_challenges (date_key) ON DELETE RESTRICT,
  run_id uuid NOT NULL,
  score integer NOT NULL CHECK (score >= 0),
  perfect_clears integer NOT NULL DEFAULT 0 CHECK (perfect_clears >= 0),
  max_combo_multiplier integer NOT NULL DEFAULT 1
    CHECK (max_combo_multiplier BETWEEN 1 AND 4),
  longest_perfect_streak integer NOT NULL DEFAULT 0 CHECK (longest_perfect_streak >= 0),
  tiles_placed integer NOT NULL DEFAULT 0 CHECK (tiles_placed BETWEEN 0 AND 40),
  strikes_used integer NOT NULL DEFAULT 0 CHECK (strikes_used BETWEEN 0 AND 3),
  completion_reason text NOT NULL CHECK (
    completion_reason IN ('strikes', 'tileLimit', 'forfeit', 'quit')
  ),
  duration_ms integer CHECK (duration_ms IS NULL OR duration_ms >= 0),
  tile_sequence_hash text,
  event_hash text,
  validation_status text NOT NULL DEFAULT 'pending'
    CHECK (validation_status IN ('pending', 'accepted', 'rejected', 'review')),
  validation_reason text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT daily_submissions_user_date_key UNIQUE (user_id, date_key),
  CONSTRAINT daily_submissions_run_id_unique UNIQUE (run_id)
);
