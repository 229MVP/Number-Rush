import {
  ADVANCED_POWER_UPS_ENABLED,
  LOCAL_STATS_ENABLED,
  TEMPLATE_FEATURES,
} from '../templateFeatures';

describe('TEMPLATE_FEATURES (sellable-template posture)', () => {
  it('keeps Classic gameplay, tutorial, and local best score on', () => {
    expect(TEMPLATE_FEATURES.classic).toBe(true);
    expect(TEMPLATE_FEATURES.tutorial).toBe(true);
    expect(TEMPLATE_FEATURES.localBestScore).toBe(true);
  });

  it('keeps only the two stable power-ups on', () => {
    expect(TEMPLATE_FEATURES.multiplier).toBe(true);
    expect(TEMPLATE_FEATURES.swap).toBe(true);
  });

  it('disables every backend / monetization / economy feature', () => {
    expect(TEMPLATE_FEATURES.dailyTournament).toBe(false);
    expect(TEMPLATE_FEATURES.ranked).toBe(false);
    expect(TEMPLATE_FEATURES.missions).toBe(false);
    expect(TEMPLATE_FEATURES.shop).toBe(false);
    expect(TEMPLATE_FEATURES.accounts).toBe(false);
    expect(TEMPLATE_FEATURES.cloudSync).toBe(false);
    expect(TEMPLATE_FEATURES.liveLeaderboards).toBe(false);
    expect(TEMPLATE_FEATURES.monetization).toBe(false);
  });

  it('derives advanced power-ups and local stats from the base flags', () => {
    expect(ADVANCED_POWER_UPS_ENABLED).toBe(TEMPLATE_FEATURES.shop);
    expect(LOCAL_STATS_ENABLED).toBe(TEMPLATE_FEATURES.localBestScore);
  });
});
