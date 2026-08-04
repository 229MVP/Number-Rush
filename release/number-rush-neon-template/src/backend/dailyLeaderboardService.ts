import {
  buildDailyLeaderboardWithLocal,
  DAILY_LEADERBOARD,
  type DailyLeaderboardEntry,
  type RankedDailyRow,
} from '../data/dailyLeaderboard';
import { liveDailyLeaderboardEnabled } from '../config/featureFlags';
import { isSupabaseConfigured } from '../config/supabaseEnvironment';
import { getUtcDateKey } from '../game/dailyTournament';
import { getSupabaseClient } from './supabaseClient';
import { getSession, isGuestMode } from '../auth/authService';

export type LeaderboardServiceMode = 'live' | 'preview' | 'offline' | 'guest';

export type DailyLeaderboardRow = RankedDailyRow & {
  perfectClears?: number;
  maxComboMultiplier?: number;
  submittedAt?: string | null;
};

export type DailyLeaderboardResult = {
  mode: LeaderboardServiceMode;
  dateKey: string;
  entries: DailyLeaderboardRow[];
};

type RpcDailyRow = {
  rank: number;
  username: string;
  score: number;
  perfect_clears?: number;
  max_combo_multiplier?: number;
  submitted_at?: string;
  is_current_user?: boolean;
};

export async function fetchDailyLeaderboard(args?: {
  date?: Date;
  localScore?: number | null;
  limit?: number;
}): Promise<DailyLeaderboardResult> {
  const dateKey = getUtcDateKey(args?.date ?? new Date());
  const limit = args?.limit ?? 100;

  if (await isGuestMode()) {
    const preview = buildDailyLeaderboardWithLocal(
      DAILY_LEADERBOARD,
      args?.localScore ?? null,
    );
    return { mode: 'guest', dateKey, entries: preview };
  }

  if (!isSupabaseConfigured() || !liveDailyLeaderboardEnabled) {
    const preview = buildDailyLeaderboardWithLocal(
      DAILY_LEADERBOARD,
      args?.localScore ?? null,
    );
    return {
      mode: isSupabaseConfigured() ? 'offline' : 'preview',
      dateKey,
      entries: preview,
    };
  }

  const session = await getSession();
  if (!session) {
    const preview = buildDailyLeaderboardWithLocal(
      DAILY_LEADERBOARD,
      args?.localScore ?? null,
    );
    return { mode: 'preview', dateKey, entries: preview };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      mode: 'offline',
      dateKey,
      entries: buildDailyLeaderboardWithLocal(
        DAILY_LEADERBOARD,
        args?.localScore ?? null,
      ),
    };
  }

  const { data, error } = await supabase.rpc('get_daily_leaderboard', {
    p_date: dateKey,
    p_limit: limit,
  });

  if (error || !Array.isArray(data)) {
    return {
      mode: 'offline',
      dateKey,
      entries: buildDailyLeaderboardWithLocal(
        DAILY_LEADERBOARD,
        args?.localScore ?? null,
      ),
    };
  }

  const entries: DailyLeaderboardRow[] = (data as RpcDailyRow[]).map((row) => ({
    id: `${row.username}-${row.rank}`,
    rank: Number(row.rank),
    username: row.username,
    score: row.score,
    perfectClears: row.perfect_clears,
    maxComboMultiplier: row.max_combo_multiplier,
    submittedAt: row.submitted_at ?? null,
    isLocalPlayer: Boolean(row.is_current_user),
  }));

  return { mode: 'live', dateKey, entries };
}

export function mapPreviewEntries(
  entries: DailyLeaderboardEntry[],
): DailyLeaderboardRow[] {
  return buildDailyLeaderboardWithLocal(entries, null);
}
