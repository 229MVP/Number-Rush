import {
  applyEconomyTransaction,
  DuplicateTransactionError,
  getPlayerProfile,
  InsufficientBalanceError,
  normalizePlayerProfile,
  resetPlayerProgression,
  updatePlayerProfile,
} from '../../storage/playerStorage';
import { purchaseShopItem } from '../../shop/purchaseShopItem';
import { SHOP_ITEMS } from '../../shop/shopCatalog';
import { clearAllStorage } from '../../test/storageTestUtils';

describe('economy transactions', () => {
  beforeEach(async () => {
    await clearAllStorage();
    await resetPlayerProgression();
  });

  it('normalizePlayerProfile prevents negative coins and gems', () => {
    const profile = normalizePlayerProfile({
      coins: -100,
      gems: -5,
    });
    expect(profile.coins).toBe(0);
    expect(profile.gems).toBe(0);
  });

  it('applyEconomyTransaction rejects duplicate ids', async () => {
    const txn = {
      id: 'progression-dup',
      type: 'game_reward' as const,
      coinsDelta: 5,
      gemsDelta: 0,
      source: 'test',
      createdAt: new Date().toISOString(),
    };
    await applyEconomyTransaction(txn);
    await expect(applyEconomyTransaction(txn)).rejects.toBeInstanceOf(
      DuplicateTransactionError,
    );
  });

  it('applyEconomyTransaction blocks spending below zero balance', async () => {
    await updatePlayerProfile({ coins: 10, gems: 1 });
    await expect(
      applyEconomyTransaction({
        id: 'spend-coins',
        type: 'shop_purchase',
        coinsDelta: -50,
        gemsDelta: 0,
        source: 'test',
        createdAt: new Date().toISOString(),
      }),
    ).rejects.toBeInstanceOf(InsufficientBalanceError);

    await expect(
      applyEconomyTransaction({
        id: 'spend-gems',
        type: 'shop_purchase',
        coinsDelta: 0,
        gemsDelta: -5,
        source: 'test',
        createdAt: new Date().toISOString(),
      }),
    ).rejects.toBeInstanceOf(InsufficientBalanceError);

    const profile = await getPlayerProfile();
    expect(profile.coins).toBe(10);
    expect(profile.gems).toBe(1);
  });

  it('purchaseShopItem returns insufficient balance without applying spend', async () => {
    const expensive = SHOP_ITEMS.find((i) => i.priceCurrency === 'coins');
    expect(expensive).toBeDefined();

    await updatePlayerProfile({ coins: 0 });
    const result = await purchaseShopItem(expensive!);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('Not enough coins');
    }

    const profile = await getPlayerProfile();
    expect(profile.coins).toBe(0);
  });
});
