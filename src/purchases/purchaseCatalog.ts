import type { PurchaseProductId } from '../monetization/monetizationTypes';
import {
  GEM_PACK_AMOUNTS,
  STARTER_BUNDLE_CONTENTS,
} from '../monetization/economyBalance';
import type { PurchasePackageRef } from './purchaseTypes';

export type CatalogProduct = {
  id: PurchaseProductId;
  /** Store / RevenueCat product identifier (same as id for this phase). */
  storeProductId: string;
  title: string;
  subtitle: string;
  badge?: string;
  kind: 'consumable' | 'non_consumable' | 'subscription';
  gemAmount?: number;
};

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 'numberrush.gems_80',
    storeProductId: 'numberrush.gems_80',
    title: '80 GEMS',
    subtitle: 'Small gem pack',
    kind: 'consumable',
    gemAmount: GEM_PACK_AMOUNTS['numberrush.gems_80'],
  },
  {
    id: 'numberrush.gems_450',
    storeProductId: 'numberrush.gems_450',
    title: '450 GEMS',
    subtitle: 'Includes a modest bonus',
    badge: 'Popular',
    kind: 'consumable',
    gemAmount: GEM_PACK_AMOUNTS['numberrush.gems_450'],
  },
  {
    id: 'numberrush.gems_1000',
    storeProductId: 'numberrush.gems_1000',
    title: '1,000 GEMS',
    subtitle: 'Better value',
    kind: 'consumable',
    gemAmount: GEM_PACK_AMOUNTS['numberrush.gems_1000'],
  },
  {
    id: 'numberrush.gems_2500',
    storeProductId: 'numberrush.gems_2500',
    title: '2,500 GEMS',
    subtitle: 'Best gem-pack value',
    badge: 'Best value',
    kind: 'consumable',
    gemAmount: GEM_PACK_AMOUNTS['numberrush.gems_2500'],
  },
  {
    id: 'numberrush.remove_ads',
    storeProductId: 'numberrush.remove_ads',
    title: 'REMOVE ADS',
    subtitle: 'Removes forced interstitials · rewarded ads stay optional',
    kind: 'non_consumable',
  },
  {
    id: 'numberrush.starter_bundle',
    storeProductId: 'numberrush.starter_bundle',
    title: 'STARTER BUNDLE',
    subtitle: `${STARTER_BUNDLE_CONTENTS.gems} gems · power-ups · Solar Starter frame`,
    badge: 'One-time',
    kind: 'non_consumable',
  },
  {
    id: 'numberrush.club.monthly',
    storeProductId: 'numberrush.club.monthly',
    title: 'NUMBER RUSH CLUB',
    subtitle: 'Monthly · cosmetics & ad removal · no competitive advantage',
    kind: 'subscription',
  },
  {
    id: 'numberrush.club.annual',
    storeProductId: 'numberrush.club.annual',
    title: 'NUMBER RUSH CLUB (ANNUAL)',
    subtitle: 'Annual · same Club entitlement',
    kind: 'subscription',
  },
];

export function getCatalogProduct(
  id: PurchaseProductId,
): CatalogProduct | undefined {
  return CATALOG_PRODUCTS.find((p) => p.id === id);
}

export function buildMockOffering(): PurchasePackageRef[] {
  return CATALOG_PRODUCTS.map((product) => ({
    identifier: `$rc_${product.id}`,
    productId: product.id,
    packageType:
      product.kind === 'subscription'
        ? product.id.includes('annual')
          ? 'ANNUAL'
          : 'MONTHLY'
        : product.kind === 'non_consumable'
          ? 'LIFETIME'
          : 'CUSTOM',
  }));
}
