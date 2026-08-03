import {
  DAILY_FREE_POWERUP_PER_DAY,
  DOUBLE_COINS_USES_BASE_COINS_ONLY,
  GEM_PACK_AMOUNTS,
  INTERSTITIAL_DAILY_CAP,
  INTERSTITIAL_EVERY_N_CLASSIC_RUNS,
  INTERSTITIAL_FREE_CLASSIC_RUNS,
  MAX_INVENTORY_COUNT,
  REVIVE_PER_RUN_LIMIT,
  STARTER_BUNDLE_CONTENTS,
} from '../economyBalance';

describe('economyBalance', () => {
  it('exposes ad and economy caps', () => {
    expect(REVIVE_PER_RUN_LIMIT).toBe(1);
    expect(DAILY_FREE_POWERUP_PER_DAY).toBe(1);
    expect(DOUBLE_COINS_USES_BASE_COINS_ONLY).toBe(true);
    expect(INTERSTITIAL_FREE_CLASSIC_RUNS).toBe(2);
    expect(INTERSTITIAL_EVERY_N_CLASSIC_RUNS).toBe(3);
    expect(INTERSTITIAL_DAILY_CAP).toBe(5);
    expect(MAX_INVENTORY_COUNT).toBe(9999);
  });

  it('defines gem pack amounts in ascending order', () => {
    const amounts = Object.values(GEM_PACK_AMOUNTS);
    expect(amounts).toEqual([80, 450, 1000, 2500]);
  });

  it('starter bundle contents match product copy', () => {
    expect(STARTER_BUNDLE_CONTENTS.gems).toBe(500);
    expect(STARTER_BUNDLE_CONTENTS.includesRemoveAds).toBe(true);
    expect(STARTER_BUNDLE_CONTENTS.inventory).toMatchObject({
      multiplier: 5,
      swap: 5,
      bomb: 3,
      freeze: 3,
      shield: 2,
    });
  });
});
