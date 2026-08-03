import { liveRankedEnabled } from '../config/featureFlags';
import { isSupabaseConfigured } from '../config/supabaseEnvironment';
import { getSupabaseClient } from './supabaseClient';
import { getSession, isGuestMode } from '../auth/authService';

export type LeaderboardServiceMode = 'live' | 'preview' | 'offline' | 'guest';

export type RankedLeaderboardRow = {
  id: string;
  rank: number;
  username: string;
  rankedPoints: number;
  division: string;
  subdivision: number;
  wins: number;
  losses: number;
  isLocalPlayer: boolean;
};

export type RankedLeaderboardResult = {
  mode: LeaderboardServiceMode;
  entries: RankedLeaderboardRow[];
};

const PREVIEW_ROWS: RankedLeaderboardRow[] = [
  {
    id: 'preview-1',
    rank: 1,
    username: 'NeonAce',
    rankedPoints: 1840,
    division: 'gold',
    subdivision: 2,
    wins: 42,
    losses: 18,
    isLocalPlayer: false,
  },
  {
    id: 'preview-2',
    rank: 2,
    username: 'GridPhantom',
    rankedPoints: 1765,
    division: 'gold',
    subdivision: 3,
    wins: 38,
    losses: 21,
    isLocalPlayer: false,
  },
];

type RpcRankedRow = {
  rank: number;
  username: string;
  ranked_points: number;
  division: string;
  subdivision: number;
  wins: number;
  losses: number;
  is_current_user?: boolean;
};

export async function fetchRankedLeaderboard(args?: {
  limit?: number;
}): Promise<RankedLeaderboardResult> {
  const limit = args?.limit ?? 100;

  if (await isGuestMode()) {
    return { mode: 'guest', entries: PREVIEW_ROWS };
  }

  if (!isSupabaseConfigured() || !liveRankedEnabled) {
    return {
      mode: isSupabaseConfigured() ? 'offline' : 'preview',
      entries: PREVIEW_ROWS,
    };
  }

  const session = await getSession();
  if (!session) {
    return { mode: 'preview', entries: PREVIEW_ROWS };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { mode: 'offline', entries: PREVIEW_ROWS };
  }

  const { data, error } = await supabase.rpc('get_ranked_leaderboard', {
    p_limit: limit,
  });

  if (error || !Array.isArray(data)) {
    return { mode: 'offline', entries: PREVIEW_ROWS };
  }

  const entries: RankedLeaderboardRow[] = (data as RpcRankedRow[]).map(
    (row) => ({
      id: `${row.username}-${row.rank}`,
      rank: Number(row.rank),
      username: row.username,
      rankedPoints: row.ranked_points,
      division: row.division,
      subdivision: row.subdivision,
      wins: row.wins,
      losses: row.losses,
      isLocalPlayer: Boolean(row.is_current_user),
    }),
  );

  return { mode: 'live', entries };
}
