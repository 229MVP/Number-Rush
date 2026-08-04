-- Live Ops: operator roles, audit, beta access, feedback

CREATE TABLE IF NOT EXISTS public.operator_roles (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (
    role IN (
      'support_agent',
      'moderator',
      'liveops_manager',
      'economy_manager',
      'release_manager',
      'administrator'
    )
  ),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.operator_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  previous_state jsonb,
  new_state jsonb,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.beta_access (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  access_level text NOT NULL CHECK (access_level IN ('tester', 'trusted_tester', 'operator')),
  active boolean NOT NULL DEFAULT true,
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  expires_at timestamptz,
  notes text
);

CREATE TABLE IF NOT EXISTS public.beta_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  category text NOT NULL,
  description text NOT NULL CHECK (char_length(description) BETWEEN 1 AND 4000),
  current_screen text,
  app_version text,
  platform text,
  release_channel text,
  diagnostic_id text,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'triaged', 'planned', 'fixed', 'closed', 'duplicate')),
  created_at timestamptz NOT NULL DEFAULT now()
);
