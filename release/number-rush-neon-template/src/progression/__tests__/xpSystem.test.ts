import { applyXp, getLevelReward, getXpRequiredForLevel } from '../xpSystem';
import { makeProfile } from '../../test/factories';

describe('xpSystem', () => {
  it('uses progressive XP requirements', () => {
    expect(getXpRequiredForLevel(1)).toBe(100);
    expect(getXpRequiredForLevel(2)).toBe(150);
    expect(getXpRequiredForLevel(3)).toBe(200);
    expect(getXpRequiredForLevel(4)).toBe(250);
  });

  it('carries extra XP and can gain multiple levels', () => {
    const result = applyXp(makeProfile({ level: 1, currentXp: 0, totalXp: 0 }), 260);
    expect(result.levelsGained).toBe(2);
    expect(result.newLevel).toBe(3);
    expect(result.updatedProfile.currentXp).toBe(10); // 260 - 100 - 150
  });

  it('milestone rewards include coins/gems/wild/theme', () => {
    expect(getLevelReward(2)).toMatchObject({ coins: 100, gems: 0 });
    expect(getLevelReward(5)).toMatchObject({
      coins: 100,
      gems: 10,
      themeUnlockId: 'cyber-ice',
    });
    expect(getLevelReward(10)).toMatchObject({
      coins: 100,
      gems: 10,
      inventory: { wild: 1 },
    });
  });
});
