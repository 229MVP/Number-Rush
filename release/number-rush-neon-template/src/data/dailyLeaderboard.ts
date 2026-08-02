export type DailyLeaderboardEntry = {
  id: string;
  username: string;
  score: number;
  isLocalPlayer: boolean;
};

/**
 * Local preview scores sized for Rush 21 perfect scoring (~100 × combo).
 * Not live backend data.
 */
export const DAILY_LEADERBOARD: DailyLeaderboardEntry[] = [
  { id: 'neon-master', username: 'NeonMaster', score: 9875, isLocalPlayer: false },
  { id: 'pixel-panda', username: 'PixelPanda', score: 8743, isLocalPlayer: false },
  { id: 'num-buster', username: 'NumBuster', score: 7521, isLocalPlayer: false },
  { id: 'grid-runner', username: 'GridRunner', score: 6840, isLocalPlayer: false },
  { id: 'rush-queen', username: 'RushQueen', score: 5920, isLocalPlayer: false },
];

export const LOCAL_PLAYER_NAME = 'You';

export type RankedDailyRow = DailyLeaderboardEntry & { rank: number };

/**
 * Equal scores place the local player after existing mock entries (stable ties).
 */
export function buildDailyLeaderboardWithLocal(
  leaderboard: DailyLeaderboardEntry[],
  playerScore: number | null,
): RankedDailyRow[] {
  const mock = leaderboard.filter((e) => !e.isLocalPlayer);
  const rows: DailyLeaderboardEntry[] = [...mock];

  if (playerScore != null && playerScore >= 0) {
    rows.push({
      id: 'local-player',
      username: LOCAL_PLAYER_NAME,
      score: playerScore,
      isLocalPlayer: true,
    });
  }

  rows.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Tie: mock players keep priority over local
    if (a.isLocalPlayer !== b.isLocalPlayer) {
      return a.isLocalPlayer ? 1 : -1;
    }
    return a.username.localeCompare(b.username);
  });

  return rows.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function calculateDailyRank(
  playerScore: number,
  leaderboard: DailyLeaderboardEntry[],
): number {
  const rows = buildDailyLeaderboardWithLocal(leaderboard, playerScore);
  const local = rows.find((r) => r.isLocalPlayer);
  return local?.rank ?? rows.length;
}
