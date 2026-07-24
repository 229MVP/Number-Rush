-- Number Rush: per-device sync state for offline-first clients

CREATE TABLE IF NOT EXISTS public.sync_metadata (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  device_id text NOT NULL,
  local_revision bigint NOT NULL DEFAULT 0 CHECK (local_revision >= 0),
  server_revision bigint NOT NULL DEFAULT 0 CHECK (server_revision >= 0),
  last_synced_at timestamptz,
  pending_domains jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, device_id)
);

DROP TRIGGER IF EXISTS sync_metadata_set_updated_at ON public.sync_metadata;
CREATE TRIGGER sync_metadata_set_updated_at
  BEFORE UPDATE ON public.sync_metadata
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
