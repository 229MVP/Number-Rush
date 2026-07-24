import {
  applyEconomyTransaction,
  DuplicateTransactionError,
  getPlayerInventory,
  getPlayerProfile,
  InsufficientBalanceError,
  normalizeLifetimeStats,
  normalizePlayerInventory,
  normalizePlayerProfile,
  resetPlayerProgression,
} from '../playerStorage';
import { clearAllStorage, seedRaw } from '../../test/storageTestUtils';
import { STORAGE_KEYS_PLAYER } from '../../progression/progressionTypes';

describe('playerStorage normalizers', () => {
  it('returns defaults for null / invalid JSON shapes', () => {
    const profile = normalizePlayerProfile(null);
    expect(profile.username).toBe('NeonPlayer');
    expect(profile.coins).toBe(500);
    expect(normalizePlayerInventory(undefined).multiplier).toBe(2);
    expect(normalizeLifetimeStats('bad').gamesPlayed).toBe(0);
  });

  it('merges partial data and clamps negatives', () => {
    const profile = normalizePlayerProfile({
      username: 'Ace',
      level: 4,
      coins: -20,
      gems: 3,
    });
    expect(profile.username).toBe('Ace');
    expect(profile.level).toBe(4);
    expect(profile.coins).toBe(0);
    expect(profile.unlockedThemeIds).toContain('neon-classic');
  });
});

describe('playerStorage economy', () => {
  beforeEach(async () => {
    await clearAllStorage();
    await resetPlayerProgression();
  });

  it('loads defaults when storage empty', async () => {
    const profile = await getPlayerProfile();
    const inv = await getPlayerInventory();
    expect(profile.coins).toBe(500);
    expect(inv.swap).toBe(3);
  });

  it('rejects insufficient balance and negative inventory', async () => {
    await expect(
      applyEconomyTransaction({
        id: 'buy-too-much',
        type: 'shop_purchase',
        coinsDelta: -99999,
        gemsDelta: 0,
        source: 'test',
        createdAt: new Date().toISOString(),
      }),
    ).rejects.toBeInstanceOf(InsufficientBalanceError);
  });

  it('rejects duplicate transaction IDs', async () => {
    const txn = {
      id: 'dup-1',
      type: 'game_reward' as const,
      coinsDelta: 10,
      gemsDelta: 0,
      source: 'test',
      createdAt: new Date().toISOString(),
    };
    await applyEconomyTransaction(txn);
    await expect(applyEconomyTransaction(txn)).rejects.toBeInstanceOf(
      DuplicateTransactionError,
    );
  });

  it('survives malformed stored profile JSON', async () => {
    await seedRaw(STORAGE_KEYS_PLAYER.profile, '{not-json');
    const profile = await getPlayerProfile();
    expect(profile.username).toBe('NeonPlayer');
  });
});
