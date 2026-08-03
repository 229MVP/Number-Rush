import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Lightweight local-only statistics for the sellable template.
 * No accounts, no backend — AsyncStorage on this device only.
 */
const STATS_KEY = 'numberRush.template.stats';

export type TemplateStats = {
  gamesPlayed: number;
  totalPerfectClears: number;
  totalTilesPlaced: number;
  highestCombo: number;
};

export const DEFAULT_TEMPLATE_STATS: TemplateStats = {
  gamesPlayed: 0,
  totalPerfectClears: 0,
  totalTilesPlaced: 0,
  highestCombo: 1,
};

function normalize(raw: unknown): TemplateStats {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_TEMPLATE_STATS };
  const o = raw as Record<string, unknown>;
  const num = (v: unknown, fallback: number) =>
    typeof v === 'number' && Number.isFinite(v) && v >= 0
      ? Math.floor(v)
      : fallback;
  return {
    gamesPlayed: num(o.gamesPlayed, 0),
    totalPerfectClears: num(o.totalPerfectClears, 0),
    totalTilesPlaced: num(o.totalTilesPlaced, 0),
    highestCombo: num(o.highestCombo, 1),
  };
}

export async function getTemplateStats(): Promise<TemplateStats> {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    if (!raw) return { ...DEFAULT_TEMPLATE_STATS };
    return normalize(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_TEMPLATE_STATS };
  }
}

async function writeTemplateStats(stats: TemplateStats): Promise<void> {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // Storage unavailable — ignore safely.
  }
}

/** Call once per completed Classic run (Game Over). Idempotent per call site. */
export async function recordCompletedRun(input: {
  perfectClears: number;
  tilesPlaced: number;
  maxComboMultiplier: number;
}): Promise<TemplateStats> {
  const current = await getTemplateStats();
  const next: TemplateStats = {
    gamesPlayed: current.gamesPlayed + 1,
    totalPerfectClears:
      current.totalPerfectClears + Math.max(0, Math.floor(input.perfectClears)),
    totalTilesPlaced:
      current.totalTilesPlaced + Math.max(0, Math.floor(input.tilesPlaced)),
    highestCombo: Math.max(
      current.highestCombo,
      Math.max(1, Math.floor(input.maxComboMultiplier)),
    ),
  };
  await writeTemplateStats(next);
  return next;
}

export async function resetTemplateStats(): Promise<void> {
  await writeTemplateStats({ ...DEFAULT_TEMPLATE_STATS });
}
