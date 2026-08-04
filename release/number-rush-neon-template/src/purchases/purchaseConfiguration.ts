import { purchasesEnabled, subscriptionsEnabled } from '../config/featureFlags';
import { getAppEnvironment } from '../config/environment';
import { isPurchasesConfigReady } from '../config/monetizationEnvironment';

export const PURCHASE_INIT_TIMEOUT_MS = 5_000;

export function isPurchasesFeatureEnabled(): boolean {
  return purchasesEnabled;
}

export function isSubscriptionsFeatureEnabled(): boolean {
  return subscriptionsEnabled;
}

export function isMonetizationTestMode(): boolean {
  return (
    (__DEV__ || getAppEnvironment() !== 'production') &&
    purchasesEnabled &&
    !isPurchasesConfigReady()
  );
}

export const REVENUECAT_ENTITLEMENT_REMOVE_ADS = 'remove_ads';
export const REVENUECAT_ENTITLEMENT_CLUB = 'club';
