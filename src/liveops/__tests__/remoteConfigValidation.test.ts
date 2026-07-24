import { normalizeRemoteConfig } from '../remoteConfigValidation';
import { createDefaultRemoteConfig } from '../remoteConfigDefaults';

describe('remoteConfigValidation', () => {
  it('accepts default-shaped config', () => {
    const normalized = normalizeRemoteConfig(createDefaultRemoteConfig());
    expect(normalized?.version).toBe(1);
    expect(normalized?.gameplay.classicEnabled).toBe(true);
  });

  it('rejects missing/invalid version', () => {
    expect(normalizeRemoteConfig({})).toBeNull();
    expect(normalizeRemoteConfig({ version: 0 })).toBeNull();
  });

  it('rejects unsafe target values', () => {
    const base = createDefaultRemoteConfig();
    expect(
      normalizeRemoteConfig({
        ...base,
        gameplay: { ...base.gameplay, targetValue: 999 },
      }),
    ).toBeNull();
  });

  it('fills missing optional fields from defaults', () => {
    const normalized = normalizeRemoteConfig({
      version: 2,
      publishedAt: '2026-07-24T00:00:00.000Z',
      environment: 'preview',
      app: { maintenanceMode: true },
      gameplay: {},
      economy: {},
      monetization: {},
      liveOps: {},
      beta: {},
    });
    expect(normalized?.app.maintenanceMode).toBe(true);
    expect(normalized?.gameplay.classicEnabled).toBe(true);
    expect(normalized?.version).toBe(2);
  });
});
