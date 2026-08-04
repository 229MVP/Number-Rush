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
  it('sellable template: connected features stay disabled even when Supabase is configured', () => {
    const flags = loadFeatureFlags(true);
    expect(flags.cloudSyncEnabled).toBe(false);
    expect(flags.liveRankedEnabled).toBe(false);
    expect(flags.liveDailyLeaderboardEnabled).toBe(false);
  });

  it('sellable template: env overrides cannot re-enable disabled template features', () => {
    const flags = loadFeatureFlags(true, {
      EXPO_PUBLIC_FEATURE_CLOUD_SYNC: 'false',
    });
    expect(flags.cloudSyncEnabled).toBe(false);
    expect(flags.liveRankedEnabled).toBe(false);
  });

  it('sellable template: stays disabled without Supabase configured too', () => {
    const flags = loadFeatureFlags(false, {
      EXPO_PUBLIC_FEATURE_LIVE_RANKED: '1',
    });
    expect(flags.liveRankedEnabled).toBe(false);
    expect(flags.cloudSyncEnabled).toBe(false);
  });
});
