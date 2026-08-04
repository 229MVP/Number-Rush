/** Client mirror of private.soft_reset_points for unit tests / previews. */
export function softResetPoints(
  points: number,
  config: {
    bronze_cap?: number;
    silver?: number;
    gold?: number;
    platinum?: number;
    diamond?: number;
    blaze?: number;
  } = {},
): number {
  const bronzeCap = config.bronze_cap ?? 299;
  const silver = config.silver ?? 300;
  const gold = config.gold ?? 600;
  const platinum = config.platinum ?? 1000;
  const diamond = config.diamond ?? 1500;
  const blaze = config.blaze ?? 2000;
  if (points >= 2500) return blaze;
  if (points >= 1800) return diamond;
  if (points >= 1200) return platinum;
  if (points >= 800) return gold;
  if (points >= 400) return silver;
  return Math.min(points, bronzeCap);
}
