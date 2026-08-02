import { liveRankedEnabled } from '../config/featureFlags';
import { isSupabaseConfigured } from '../config/supabaseEnvironment';
import { logger } from '../logging/logger';
import { getSupabaseClient } from './supabaseClient';
import { getSession } from '../auth/authService';

export type RankedRunTicket = {
  id: string;
  seed: string;
  seasonId: string;
  expiresAt: string;
};

export type RankedTicketResult =
  | { ok: true; ticket: RankedRunTicket }
  | { ok: false; error: string; mode: 'offline' | 'guest' | 'disabled' };

export async function issueRankedRunTicket(): Promise<RankedTicketResult> {
  if (!isSupabaseConfigured() || !liveRankedEnabled) {
    return { ok: false, error: 'ranked_disabled', mode: 'disabled' };
  }

  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'not_authenticated', mode: 'guest' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: 'supabase_unavailable', mode: 'offline' };
  }

  const { data, error } = await supabase.rpc('issue_ranked_run_ticket');

  if (error) {
    logger.warn('issue_ranked_run_ticket failed', { message: error.message });
    return { ok: false, error: error.message, mode: 'offline' };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== 'object') {
    return { ok: false, error: 'empty_ticket', mode: 'offline' };
  }

  const ticket = row as {
    id: string;
    seed: string;
    season_id: string;
    expires_at: string;
  };

  return {
    ok: true,
    ticket: {
      id: ticket.id,
      seed: ticket.seed,
      seasonId: ticket.season_id,
      expiresAt: ticket.expires_at,
    },
  };
}
