function loadFeatureFlags(
  supabaseConfigured: boolean,
  env: Record<string, string | undefined> = {},
) {
  const snapshot = { ...process.env };
  Object.keys(process.env).forEach((key) => {
    if (
      key.startsWith('EXPO_PUBLIC_FEATURE_') ||
      key === 'EXPO_PUBLIC_SUPABASE_URL'
    ) {
      delete process.env[key];
    }
  });
  Object.assign(process.env, env);

  jest.resetModules();
  jest.doMock('../supabaseEnvironment', () => ({
    isSupabaseConfigured: () => supabaseConfigured,
    getSupabaseUrl: () => (supabaseConfigured ? 'https://example.supabase.co' : null),
    getSupabaseAnonKey: () => (supabaseConfigured ? 'anon-key' : null),
  }));

  const flags = require('../featureFlags') as typeof import('../featureFlags');

  process.env = snapshot;
  jest.resetModules();
  jest.unmock('../supabaseEnvironment');

  return flags;
}

describe('featureFlags', () => {
  it('defaults connected features to supabase configured state', () => {
    const flags = loadFeatureFlags(true);
    expect(flags.cloudSyncEnabled).toBe(true);
    expect(flags.liveRankedEnabled).toBe(true);
    expect(flags.liveDailyLeaderboardEnabled).toBe(true);
  });

  it('honors explicit false override', () => {
    const flags = loadFeatureFlags(true, {
      EXPO_PUBLIC_FEATURE_CLOUD_SYNC: 'false',
    });
    expect(flags.cloudSyncEnabled).toBe(false);
    expect(flags.liveRankedEnabled).toBe(true);
  });

  it('honors explicit true when supabase is not configured', () => {
    const flags = loadFeatureFlags(false, {
      EXPO_PUBLIC_FEATURE_LIVE_RANKED: '1',
    });
    expect(flags.liveRankedEnabled).toBe(true);
    expect(flags.cloudSyncEnabled).toBe(false);
  });
});
