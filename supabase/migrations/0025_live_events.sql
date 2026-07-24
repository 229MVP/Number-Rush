-- Live Ops: limited-time events + participation + event missions

CREATE TABLE IF NOT EXISTS public.live_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  event_type text NOT NULL CHECK (
    event_type IN (
      'score_challenge',
      'perfect_challenge',
      'combo_challenge',
      'classic_modifier',
      'community_goal',
      'cosmetic_showcase'
    )
  ),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'active', 'completed', 'archived')),
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  reward_configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  banner_asset_url text,
  accent_color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  CONSTRAINT live_events_window CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS public.event_participation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.live_events (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  progress bigint NOT NULL DEFAULT 0 CHECK (progress >= 0),
  best_value bigint NOT NULL DEFAULT 0 CHECK (best_value >= 0),
  joined_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  reward_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.event_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.live_events (id) ON DELETE CASCADE,
  mission_key text NOT NULL,
  title text NOT NULL,
  metric text NOT NULL,
  operator text NOT NULL CHECK (operator IN ('additive', 'maximum', 'count')),
  target_value bigint NOT NULL CHECK (target_value > 0),
  reward_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (event_id, mission_key)
);

CREATE TABLE IF NOT EXISTS public.event_mission_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_mission_id uuid NOT NULL REFERENCES public.event_missions (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  progress bigint NOT NULL DEFAULT 0 CHECK (progress >= 0),
  completed_at timestamptz,
  claimed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_mission_id, user_id)
);
