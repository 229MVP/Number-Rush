import {
  DEFAULT_AD_FREQUENCY_STATE,
  normalizeAdFrequencyState,
  rollUtcDay,
  canClaimDailyFreePowerup,
  hasDoubleCoinsClaimed,
  isReviveUsedForRun,
  utcDateKeyFromMs,
} from '../adFrequencyStorage';

describe('adFrequencyStorage', () => {
  it('normalizeAdFrequencyState fills defaults', () => {
    expect(normalizeAdFrequencyState(null)).toEqual(DEFAULT_AD_FREQUENCY_STATE);
  });

  it('rollUtcDay resets daily interstitial count on new UTC day', () => {
    const state = {
      ...DEFAULT_AD_FREQUENCY_STATE,
      utcDateKey: '2026-01-01',
      interstitialCountToday: 3,
    };
    const next = rollUtcDay(state, Date.parse('2026-01-02T12:00:00.000Z'));
    expect(next.utcDateKey).toBe('2026-01-02');
    expect(next.interstitialCountToday).toBe(0);
  });

  it('tracks revive per run id', () => {
    const state = { ...DEFAULT_AD_FREQUENCY_STATE, reviveUsedRunId: 'run-a' };
    expect(isReviveUsedForRun(state, 'run-a')).toBe(true);
    expect(isReviveUsedForRun(state, 'run-b')).toBe(false);
  });

  it('daily free power-up once per UTC day', () => {
    const now = Date.parse('2026-07-24T10:00:00.000Z');
    const key = utcDateKeyFromMs(now);
    const state = { ...DEFAULT_AD_FREQUENCY_STATE, dailyFreePowerupDateKey: key };
    expect(canClaimDailyFreePowerup(state, now)).toBe(false);
    expect(canClaimDailyFreePowerup(state, now + 86_400_000)).toBe(true);
  });

  it('tracks double coins keys', () => {
    const state = {
      ...DEFAULT_AD_FREQUENCY_STATE,
      doubleCoinsClaimedKeys: ['reward-1'],
    };
    expect(hasDoubleCoinsClaimed(state, 'reward-1')).toBe(true);
    expect(hasDoubleCoinsClaimed(state, 'reward-2')).toBe(false);
  });
});
