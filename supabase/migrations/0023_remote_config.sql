-- Live Ops: remote configuration versions + audit

CREATE TABLE IF NOT EXISTS public.remote_config_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment text NOT NULL CHECK (environment IN ('development', 'preview', 'production')),
  version integer NOT NULL CHECK (version > 0),
  configuration jsonb NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  published_at timestamptz,
  archived_at timestamptz,
  UNIQUE (environment, version)
);

CREATE UNIQUE INDEX IF NOT EXISTS remote_config_one_published_per_env
  ON public.remote_config_versions (environment)
  WHERE status = 'published';

CREATE TABLE IF NOT EXISTS public.remote_config_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid REFERENCES public.remote_config_versions (id) ON DELETE SET NULL,
  actor_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  action text NOT NULL,
  previous_payload jsonb,
  new_payload jsonb,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.economy_config_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment text NOT NULL CHECK (environment IN ('development', 'preview', 'production')),
  version integer NOT NULL CHECK (version > 0),
  configuration jsonb NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  published_at timestamptz,
  UNIQUE (environment, version)
);

CREATE UNIQUE INDEX IF NOT EXISTS economy_config_one_published_per_env
  ON public.economy_config_versions (environment)
  WHERE status = 'published';
