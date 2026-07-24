-- Number Rush: performance indexes

CREATE INDEX IF NOT EXISTS daily_submissions_date_score_desc_idx
  ON public.daily_submissions (date_key, score DESC, perfect_clears DESC, max_combo_multiplier DESC, submitted_at ASC);

CREATE INDEX IF NOT EXISTS daily_submissions_user_date_idx
  ON public.daily_submissions (user_id, date_key);

CREATE INDEX IF NOT EXISTS daily_submissions_validation_idx
  ON public.daily_submissions (validation_status);

CREATE INDEX IF NOT EXISTS ranked_profiles_season_points_desc_idx
  ON public.ranked_profiles (season_id, ranked_points DESC, wins DESC, games_played ASC);

CREATE INDEX IF NOT EXISTS ranked_matches_user_idx
  ON public.ranked_matches (user_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS ranked_matches_run_id_idx
  ON public.ranked_matches (run_id);

CREATE INDEX IF NOT EXISTS ranked_matches_validation_idx
  ON public.ranked_matches (validation_status);

CREATE INDEX IF NOT EXISTS economy_transactions_user_created_idx
  ON public.economy_transactions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS economy_transactions_txn_id_idx
  ON public.economy_transactions (transaction_id);

CREATE INDEX IF NOT EXISTS sync_metadata_user_updated_idx
  ON public.sync_metadata (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS ranked_run_tickets_user_status_idx
  ON public.ranked_run_tickets (user_id, status);

CREATE INDEX IF NOT EXISTS ranked_run_tickets_expires_idx
  ON public.ranked_run_tickets (expires_at)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS player_profiles_username_trgm_idx
  ON public.player_profiles USING gin (username gin_trgm_ops);
