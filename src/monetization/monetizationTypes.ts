export type AdFormat = 'rewarded' | 'interstitial';

export type RewardedPlacement =
  | 'classic_revive'
  | 'double_classic_coins'
  | 'daily_free_powerup'
  | 'shop_bonus';

export type InterstitialPlacement = 'classic_run_complete';

export type AdLoadState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'showing'
  | 'earned'
  | 'closed'
  | 'unavailable'
  | 'error';

/** Stable store / RevenueCat product identifiers. */
export type PurchaseProductId =
  | 'numberrush.remove_ads'
  | 'numberrush.gems_80'
  | 'numberrush.gems_450'
  | 'numberrush.gems_1000'
  | 'numberrush.gems_2500'
  | 'numberrush.starter_bundle'
  | 'numberrush.club.monthly'
  | 'numberrush.club.annual';

export type PurchaseKind = 'consumable' | 'non_consumable' | 'subscription';

export type PurchaseState =
  | 'idle'
  | 'loading_products'
  | 'purchasing'
  | 'verifying'
  | 'completed'
  | 'cancelled'
  | 'pending'
  | 'error'
  | 'loading'
  | 'ready'
  | 'restoring'
  | 'unavailable';

export type MonetizationEntitlements = {
  removeAds: boolean;
  clubActive: boolean;
  clubExpirationDate: string | null;
};
