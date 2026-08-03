/**
 * Client-side preview of ranked RP delta (server RPC is authoritative).
 * Mirrors `public.calculate_ranked_points_delta` in 0012_rpc_functions.sql.
 */
export function calculateRankedPointsDelta(
  score: number,
  strikesRemaining: number,
  perfects: number,
  maxCombo: number,
): number {
  const vScore = Math.max(0, Math.floor(score));
  const vStrikes = Math.max(0, Math.floor(strikesRemaining));
  const vPerfects = Math.max(0, Math.floor(perfects));
  const vCombo = Math.max(0, Math.floor(maxCombo));

  let base: number;
  if (vScore < 300) base = -25;
  else if (vScore < 600) base = -10;
  else if (vScore < 900) base = 5;
  else if (vScore < 1200) base = 20;
  else if (vScore < 1500) base = 40;
  else base = 60;

  const bonus =
    vStrikes * 5 + vPerfects * 2 + Math.max(vCombo - 1, 0) * 3;

  let delta = base + bonus;
  delta = Math.min(delta, 80);
  delta = Math.max(delta, -40);
  return delta;
}
