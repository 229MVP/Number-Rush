-- Live Ops: announcements + reads

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  announcement_type text NOT NULL CHECK (
    announcement_type IN ('news', 'event', 'maintenance', 'reward', 'update', 'warning')
  ),
  audience text NOT NULL DEFAULT 'all',
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  priority integer NOT NULL DEFAULT 0,
  dismissible boolean NOT NULL DEFAULT true,
  action_type text CHECK (action_type IS NULL OR action_type IN ('none', 'internal_route', 'external_url')),
  action_value text,
  image_url text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'published', 'expired', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  CONSTRAINT announcements_window CHECK (ends_at IS NULL OR ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS public.announcement_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES public.announcements (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  dismissed_at timestamptz,
  UNIQUE (announcement_id, user_id)
);
