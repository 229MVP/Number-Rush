import type { ShopItem } from './shopCatalog';
import {
  applyEconomyTransaction,
  createTransactionId,
  DuplicateTransactionError,
  getPlayerInventory,
  getPlayerProfile,
  InsufficientBalanceError,
} from '../storage/playerStorage';
import type { PlayerInventory, PlayerProfile } from '../progression/progressionTypes';

export type PurchaseResult =
  | {
      ok: true;
      profile: PlayerProfile;
      inventory: PlayerInventory;
    }
  | {
      ok: false;
      reason: string;
    };

export async function purchaseShopItem(item: ShopItem): Promise<PurchaseResult> {
  const profile = await getPlayerProfile();
  const inventory = await getPlayerInventory();

  if (item.type === 'theme' && item.themeId) {
    if (profile.unlockedThemeIds.includes(item.themeId)) {
      return { ok: false, reason: 'Theme already unlocked' };
    }
  }

  if (item.type === 'coin_pack' || item.type === 'gem_pack') {
    return { ok: false, reason: 'Real-money purchases coming later' };
  }

  const coinsDelta =
    item.priceCurrency === 'coins' ? -Math.abs(item.price) : 0;
  const gemsDelta = item.priceCurrency === 'gems' ? -Math.abs(item.price) : 0;

  if (item.priceCurrency === 'coins' && profile.coins < item.price) {
    return { ok: false, reason: 'Not enough coins' };
  }
  if (item.priceCurrency === 'gems' && profile.gems < item.price) {
    return { ok: false, reason: 'Not enough gems' };
  }

  try {
    const result = await applyEconomyTransaction({
      id: createTransactionId(`shop-${item.id}`),
      type: item.type === 'theme' ? 'theme_unlock' : 'shop_purchase',
      coinsDelta,
      gemsDelta,
      inventoryChanges: item.inventoryReward,
      themeUnlockIds: item.themeId ? [item.themeId] : undefined,
      source: `shop:${item.id}`,
      createdAt: new Date().toISOString(),
    });
    return {
      ok: true,
      profile: result.profile,
      inventory: result.inventory,
    };
  } catch (error) {
    if (error instanceof InsufficientBalanceError) {
      return { ok: false, reason: error.message };
    }
    if (error instanceof DuplicateTransactionError) {
      return { ok: false, reason: 'Purchase already processed' };
    }
    return { ok: false, reason: 'Purchase failed' };
  }
}

export { getPlayerInventory, getPlayerProfile };
