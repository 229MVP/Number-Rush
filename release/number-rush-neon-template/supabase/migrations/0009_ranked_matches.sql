-- Number Rush: ranked run tickets and solo match results (server-validated)

CREATE TABLE IF NOT EXISTS public.ranked_run_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  season_id uuid NOT NULL REFERENCES public.ranked_seasons (id) ON DELETE CASCADE,
  seed text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'consumed', 'expired', 'forfeited')),
  CONSTRAINT ranked_run_tickets_expiry CHECK (expires_at > issued_at)
);

CREATE TABLE IF NOT EXISTS public.ranked_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  season_id uuid REFERENCES public.ranked_seasons (id) ON DELETE SET NULL,
  ticket_id uuid REFERENCES public.ranked_run_tickets (id) ON DELETE SET NULL,
  seed text NOT NULL,
  score integer NOT NULL CHECK (score >= 0),
  perfect_clears integer NOT NULL DEFAULT 0 CHECK (perfect_clears >= 0),
  max_combo_multiplier integer NOT NULL DEFAULT 1
    CHECK (max_combo_multiplier BETWEEN 1 AND 4),
  longest_perfect_streak integer NOT NULL DEFAULT 0 CHECK (longest_perfect_streak >= 0),
  tiles_placed integer NOT NULL DEFAULT 0 CHECK (tiles_placed BETWEEN 0 AND 30),
  strikes_used integer NOT NULL DEFAULT 0 CHECK (strikes_used BETWEEN 0 AND 3),
  completion_reason text NOT NULL CHECK (
    completion_reason IN ('strikes', 'tileLimit', 'forfeit', 'quit')
  ),
  outcome text NOT NULL CHECK (outcome IN ('win', 'loss', 'draw', 'forfeit')),
  points_delta integer NOT NULL,
  previous_points integer NOT NULL CHECK (previous_points >= 0),
  new_points integer NOT NULL CHECK (new_points >= 0),
  duration_ms integer CHECK (duration_ms IS NULL OR duration_ms >= 0),
  tile_sequence_hash text,
  event_hash text,
  validation_status text NOT NULL DEFAULT 'pending'
    CHECK (validation_status IN ('pending', 'accepted', 'rejected', 'review')),
  validation_reason text,
  submitted_at timestamptz NOT NULL DEFAULT now()
);
