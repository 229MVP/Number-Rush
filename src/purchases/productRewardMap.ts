import type { PurchaseProductId } from '../monetization/monetizationTypes';
import {
  GEM_PACK_AMOUNTS,
  STARTER_BUNDLE_CONTENTS,
} from '../monetization/economyBalance';

export type ProductRewardPreview = {
  gems?: number;
  inventory?: Partial<typeof STARTER_BUNDLE_CONTENTS.inventory>;
  entitlements?: {
    removeAds?: boolean;
    clubActive?: boolean;
  };
  themeOrFrame?: string;
};

/**
 * Client mirror for shop UI copy.
 * Server `private.monetization_product_fulfillment` is authoritative.
 * Short aliases (gems_80) are also accepted by the webhook/SQL map.
 */
export const PRODUCT_REWARD_MAP: Record<PurchaseProductId, ProductRewardPreview> =
  {
    'numberrush.gems_80': { gems: GEM_PACK_AMOUNTS['numberrush.gems_80'] },
    'numberrush.gems_450': { gems: GEM_PACK_AMOUNTS['numberrush.gems_450'] },
    'numberrush.gems_1000': { gems: GEM_PACK_AMOUNTS['numberrush.gems_1000'] },
    'numberrush.gems_2500': { gems: GEM_PACK_AMOUNTS['numberrush.gems_2500'] },
    'numberrush.remove_ads': { entitlements: { removeAds: true } },
    'numberrush.starter_bundle': {
      gems: STARTER_BUNDLE_CONTENTS.gems,
      inventory: STARTER_BUNDLE_CONTENTS.inventory,
      entitlements: { removeAds: STARTER_BUNDLE_CONTENTS.includesRemoveAds },
      themeOrFrame: STARTER_BUNDLE_CONTENTS.themeOrFrame,
    },
    'numberrush.club.monthly': { entitlements: { clubActive: true } },
    'numberrush.club.annual': { entitlements: { clubActive: true } },
  };

/** Normalize store product id → short server map key. */
export function toServerProductKey(productId: string): string {
  const map: Record<string, string> = {
    'numberrush.gems_80': 'gems_80',
    'numberrush.gems_450': 'gems_450',
    'numberrush.gems_1000': 'gems_1000',
    'numberrush.gems_2500': 'gems_2500',
    'numberrush.remove_ads': 'remove_ads',
    'numberrush.starter_bundle': 'starter_bundle',
    'numberrush.club.monthly': 'number_rush_club',
    'numberrush.club.annual': 'number_rush_club',
    gems_80: 'gems_80',
    gems_450: 'gems_450',
    gems_1000: 'gems_1000',
    gems_2500: 'gems_2500',
    remove_ads: 'remove_ads',
    starter_bundle: 'starter_bundle',
    number_rush_club: 'number_rush_club',
  };
  return map[productId] ?? productId;
}
