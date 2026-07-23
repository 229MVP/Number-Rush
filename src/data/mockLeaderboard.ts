import type { LeaderboardEntry, RankedDivision } from '../game/gameTypes';

export const LOCAL_PLAYER_ID = 'local-player';
export const LOCAL_PLAYER_NAME = 'You';

export const DAILY_MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'neon-master',
    username: 'NeonMaster',
    score: 98750,
    division: 'diamond',
    isLocalPlayer: false,
  },
  {
    id: 'pixel-panda',
    username: 'PixelPanda',
    score: 87430,
    division: 'platinum',
    isLocalPlayer: false,
  },
  {
    id: 'num-buster',
    username: 'NumBuster',
    score: 75210,
    division: 'gold',
    isLocalPlayer: false,
  },
  {
    id: 'arcade-fox',
    username: 'ArcadeFox',
    score: 64100,
    division: 'gold',
    isLocalPlayer: false,
  },
  {
    id: 'tile-titan',
    username: 'TileTitan',
    score: 52880,
    division: 'silver',
    isLocalPlayer: false,
  },
];

export const WEEKLY_MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'week-1',
    username: 'RushQueen',
    score: 412500,
    division: 'blaze',
    isLocalPlayer: false,
  },
  {
    id: 'week-2',
    username: 'ComboKing',
    score: 388200,
    division: 'diamond',
    isLocalPlayer: false,
  },
  {
    id: 'week-3',
    username: 'StrikeZero',
    score: 350010,
    division: 'platinum',
    isLocalPlayer: false,
  },
  {
    id: 'week-4',
    username: 'LaneLaser',
    score: 301440,
    division: 'gold',
    isLocalPlayer: false,
  },
];

export const GLOBAL_MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'global-1',
    username: 'Infinity21',
    score: 2500000,
    division: 'blaze',
    isLocalPlayer: false,
  },
  {
    id: 'global-2',
    username: 'NovaRush',
    score: 2100450,
    division: 'blaze',
    isLocalPlayer: false,
  },
  {
    id: 'global-3',
    username: 'GridGhost',
    score: 1899200,
    division: 'diamond',
    isLocalPlayer: false,
  },
  {
    id: 'global-4',
    username: 'PerfectPulse',
    score: 1500300,
    division: 'diamond',
    isLocalPlayer: false,
  },
  {
    id: 'global-5',
    username: 'ByteBlade',
    score: 1200880,
    division: 'platinum',
    isLocalPlayer: false,
  },
];

export type RankedLeaderboardRow = LeaderboardEntry & {
  rank: number;
};

/**
 * Insert local player score into mock board and return sorted rows with ranks.
 */
export function buildLeaderboardWithLocal(
  mockEntries: LeaderboardEntry[],
  localScore: number | null,
  localDivision: RankedDivision = 'bronze',
): RankedLeaderboardRow[] {
  const withoutLocal = mockEntries.filter((entry) => !entry.isLocalPlayer);
  const rows: LeaderboardEntry[] = [...withoutLocal];

  if (localScore != null && localScore >= 0) {
    rows.push({
      id: LOCAL_PLAYER_ID,
      username: LOCAL_PLAYER_NAME,
      score: localScore,
      division: localDivision,
      isLocalPlayer: true,
    });
  }

  rows.sort((a, b) => b.score - a.score);

  return rows.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

export function getLocalRank(
  mockEntries: LeaderboardEntry[],
  localScore: number,
): number {
  const rows = buildLeaderboardWithLocal(mockEntries, localScore);
  const local = rows.find((row) => row.isLocalPlayer);
  return local?.rank ?? rows.length;
}
