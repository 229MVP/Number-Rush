import {
  calculateClassicReward,
  calculateDailyReward,
  calculateRankedReward,
} from '../gameRewards';

describe('gameRewards', () => {
  it('calculates Classic rewards with gem at 1000+ score', () => {
    const low = calculateClassicReward({
      mode: 'classic',
      score: 200,
      perfectClears: 1,
    });
    expect(low.gems).toBe(0);
    expect(low.xp).toBeLessThanOrEqual(500);
    const high = calculateClassicReward({
      mode: 'classic',
      score: 1200,
      perfectClears: 2,
    });
    expect(high.gems).toBe(1);
    expect(high.coins).toBeLessThanOrEqual(1000);
  });

  it('reduces Daily practice rewards and removes gems', () => {
    const official = calculateDailyReward({
      mode: 'daily',
      score: 800,
      perfectClears: 2,
      officialAttempt: true,
      calculatedRank: 2,
    });
    const practice = calculateDailyReward({
      mode: 'daily',
      score: 800,
      perfectClears: 2,
      officialAttempt: false,
      calculatedRank: null,
    });
    expect(official.gems).toBe(3); // 1 complete + 2 top3
    expect(practice.gems).toBe(0);
    expect(practice.xp).toBeLessThan(official.xp);
    expect(practice.xp).toBeGreaterThanOrEqual(5);
    expect(practice.coins).toBeGreaterThanOrEqual(5);
  });

  it('calculates Ranked win/loss/draw bases and promotion gems', () => {
    const loss = calculateRankedReward({
      mode: 'ranked',
      score: 400,
      perfectClears: 1,
      outcome: 'loss',
      divisionPromoted: false,
      promotedToBlaze: false,
    });
    expect(loss.reasonBreakdown.baseXp).toBe(20);
    const win = calculateRankedReward({
      mode: 'ranked',
      score: 400,
      perfectClears: 1,
      outcome: 'win',
      divisionPromoted: true,
      promotedToBlaze: true,
    });
    expect(win.gems).toBeLessThanOrEqual(15);
    expect(win.gems).toBe(1 + 3 + 10);
  });

  it('caps runaway rewards', () => {
    const huge = calculateClassicReward({
      mode: 'classic',
      score: 1_000_000,
      perfectClears: 500,
    });
    expect(huge.xp).toBe(500);
    expect(huge.coins).toBe(1000);
    expect(huge.gems).toBeLessThanOrEqual(15);
  });
});
