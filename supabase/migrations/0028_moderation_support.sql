-- Live Ops: moderation, reports, anti-cheat review queue

CREATE TABLE IF NOT EXISTS public.leaderboard_moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  action text NOT NULL CHECK (
    action IN ('hide_entry', 'restore_entry', 'invalidate_run', 'flag_for_review', 'clear_flag')
  ),
  reason text,
  evidence_reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.username_moderation (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'approved'
    CHECK (status IN ('approved', 'flagged', 'hidden', 'rename_required')),
  original_username text,
  moderated_username text,
  reason text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.player_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  report_type text NOT NULL CHECK (
    report_type IN (
      'inappropriate_username',
      'suspected_cheating',
      'offensive_leaderboard_identity',
      'technical_problem'
    )
  ),
  target_reference text,
  description text NOT NULL CHECK (char_length(description) BETWEEN 1 AND 2000),
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'triaged', 'resolved', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.run_validation_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type text NOT NULL,
  run_id text NOT NULL,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  validation_status text,
  risk_score integer NOT NULL DEFAULT 0,
  risk_reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  assigned_operator uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  review_status text NOT NULL DEFAULT 'queued'
    CHECK (review_status IN ('queued', 'reviewing', 'accepted', 'rejected', 'escalated')),
  decision text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
