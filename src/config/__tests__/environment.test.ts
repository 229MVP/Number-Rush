function withFreshEnvironment(
  env: Record<string, string | undefined>,
): import('../environment').AppEnvironment {
  const snapshot = { ...process.env };
  delete process.env.EXPO_PUBLIC_APP_ENV;
  delete process.env.APP_ENV;
  Object.assign(process.env, env);

  jest.resetModules();
  const { getAppEnvironment } = require('../environment') as typeof import('../environment');
  const result = getAppEnvironment();

  process.env = snapshot;
  jest.resetModules();
  require('../environment');

  return result;
}

describe('getAppEnvironment', () => {
  it('maps development aliases', () => {
    expect(withFreshEnvironment({ EXPO_PUBLIC_APP_ENV: 'development' })).toBe(
      'development',
    );
    expect(withFreshEnvironment({ EXPO_PUBLIC_APP_ENV: 'dev' })).toBe(
      'development',
    );
  });

  it('maps preview and staging to preview', () => {
    expect(withFreshEnvironment({ EXPO_PUBLIC_APP_ENV: 'preview' })).toBe(
      'preview',
    );
    expect(withFreshEnvironment({ EXPO_PUBLIC_APP_ENV: 'staging' })).toBe(
      'preview',
    );
  });

  it('maps production aliases', () => {
    expect(withFreshEnvironment({ EXPO_PUBLIC_APP_ENV: 'production' })).toBe(
      'production',
    );
    expect(withFreshEnvironment({ EXPO_PUBLIC_APP_ENV: 'prod' })).toBe(
      'production',
    );
  });

  it('falls back to APP_ENV when EXPO_PUBLIC_APP_ENV is unset', () => {
    expect(withFreshEnvironment({ APP_ENV: 'PREVIEW' })).toBe('preview');
  });
});
