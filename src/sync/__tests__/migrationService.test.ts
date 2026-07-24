import {
  applyMergeSafe,
  compareLocalVsCloud,
  defaultsLocalSnapshot,
  emptyCloudBundle,
} from '../migrationService';
import type { CloudProgressBundle } from '../syncTypes';

describe('migrationService', () => {
  it('reports no conflicts when cloud is empty', () => {
    const local = defaultsLocalSnapshot();
    const result = compareLocalVsCloud(local, emptyCloudBundle());
    expect(result.hasCloudData).toBe(false);
    expect(result.conflicts).toHaveLength(0);
  });

  it('detects profile username conflict', () => {
    const local = defaultsLocalSnapshot();
    const cloud: CloudProgressBundle = {
      profile: { ...local.profile, username: 'CloudHero' },
      inventory: null,
      statistics: null,
      raw: {},
    };
    const { conflicts } = compareLocalVsCloud(local, cloud);
    expect(conflicts.some((c) => c.domain === 'profile')).toBe(true);
    const profileConflict = conflicts.find((c) => c.domain === 'profile');
    expect(profileConflict?.fields.some((f) => f.field === 'username')).toBe(
      true,
    );
  });

  it('merge-safe keeps higher currency and xp', () => {
    const local = defaultsLocalSnapshot();
    local.profile.coins = 100;
    local.profile.totalXp = 50;
    const cloud: CloudProgressBundle = {
      profile: {
        ...local.profile,
        username: 'Cloud',
        coins: 250,
        totalXp: 40,
        updatedAt: new Date().toISOString(),
      },
      inventory: { ...local.inventory, multiplier: 5 },
      statistics: { ...local.statistics, gamesPlayed: 99 },
      raw: {},
    };
    const merged = applyMergeSafe(local, cloud);
    expect(merged.profile.coins).toBe(250);
    expect(merged.profile.totalXp).toBe(50);
    expect(merged.inventory.multiplier).toBe(5);
    expect(merged.statistics.gamesPlayed).toBe(99);
  });
});
