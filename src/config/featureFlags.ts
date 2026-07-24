import { isSupabaseConfigured } from './supabaseEnvironment';

function parseFeatureOverride(
  envName: string,
): boolean | null {
  const raw = process.env[envName]?.trim().toLowerCase();
  if (raw === 'true' || raw === '1' || raw === 'yes') return true;
  if (raw === 'false' || raw === '0' || raw === 'no') return false;
  return null;
}

function resolveFeature(envName: string): boolean {
  const override = parseFeatureOverride(envName);
  if (override != null) return override;
  return isSupabaseConfigured();
}

/** Cloud save / sync when Supabase is configured unless forced off. */
export const cloudSyncEnabled = resolveFeature(
  'EXPO_PUBLIC_FEATURE_CLOUD_SYNC',
);

export const liveDailyLeaderboardEnabled = resolveFeature(
  'EXPO_PUBLIC_FEATURE_LIVE_DAILY_LEADERBOARD',
);

export const liveRankedEnabled = resolveFeature(
  'EXPO_PUBLIC_FEATURE_LIVE_RANKED',
);

export const connectedEconomyEnabled = resolveFeature(
  'EXPO_PUBLIC_FEATURE_CONNECTED_ECONOMY',
);

export const accountDeletionEnabled = resolveFeature(
  'EXPO_PUBLIC_FEATURE_ACCOUNT_DELETION',
);
