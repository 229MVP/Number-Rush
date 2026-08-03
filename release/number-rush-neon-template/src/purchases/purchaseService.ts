import { trackEvent } from '../analytics/analyticsService';
import { getRevenueCatApiKey } from '../config/monetizationEnvironment';
import { logger } from '../logging/logger';
import type {
  MonetizationEntitlements,
  PurchaseProductId,
  PurchaseState,
} from '../monetization/monetizationTypes';
import { enqueuePendingPurchase } from '../storage/pendingPurchaseStorage';
import { loadPurchasesSdk } from './loadPurchases';
import { buildMockOffering } from './purchaseCatalog';
import {
  isMonetizationTestMode,
  isPurchasesFeatureEnabled,
  isSubscriptionsFeatureEnabled,
  PURCHASE_INIT_TIMEOUT_MS,
  REVENUECAT_ENTITLEMENT_CLUB,
  REVENUECAT_ENTITLEMENT_REMOVE_ADS,
} from './purchaseConfiguration';
import type { PurchasesModuleShape } from './purchasesModuleTypes';
import type {
  PurchaseOffering,
  PurchasePackageRef,
  PurchaseResult,
} from './purchaseTypes';

let nativePurchases: PurchasesModuleShape | null | undefined;
let purchaseState: PurchaseState = 'idle';
let offerings: PurchaseOffering[] = [];
const nativePackageByIdentifier = new Map<string, unknown>();
let entitlements: MonetizationEntitlements = {
  removeAds: false,
  clubActive: false,
  clubExpirationDate: null,
};
let identifiedUserId: string | null = null;

const listeners = new Set<() => void>();

function notify(): void {
  for (const l of listeners) l();
}

function setPurchaseState(next: PurchaseState): void {
  purchaseState = next;
  notify();
}

function loadPurchasesModule(): PurchasesModuleShape | null {
  if (nativePurchases !== undefined) return nativePurchases;
  nativePurchases = loadPurchasesSdk();
  return nativePurchases;
}

function mapStoreProductToId(storeId: string): PurchaseProductId | null {
  return CATALOG_PRODUCT_ID_BY_STORE[storeId] ?? null;
}

const CATALOG_PRODUCT_ID_BY_STORE: Record<string, PurchaseProductId> = {
  'numberrush.gems_80': 'numberrush.gems_80',
  'numberrush.gems_450': 'numberrush.gems_450',
  'numberrush.gems_1000': 'numberrush.gems_1000',
  'numberrush.gems_2500': 'numberrush.gems_2500',
  'numberrush.remove_ads': 'numberrush.remove_ads',
  'numberrush.starter_bundle': 'numberrush.starter_bundle',
  'numberrush.club.monthly': 'numberrush.club.monthly',
  'numberrush.club.annual': 'numberrush.club.annual',
  // Short aliases accepted for dashboard/webhook mapping flexibility
  gems_80: 'numberrush.gems_80',
  gems_450: 'numberrush.gems_450',
  gems_1000: 'numberrush.gems_1000',
  gems_2500: 'numberrush.gems_2500',
  remove_ads: 'numberrush.remove_ads',
  starter_bundle: 'numberrush.starter_bundle',
};

function parseEntitlements(
  active: Record<string, { isActive: boolean; expirationDate?: string | null }> | undefined,
): MonetizationEntitlements {
  const club = active?.[REVENUECAT_ENTITLEMENT_CLUB];
  return {
    removeAds: Boolean(active?.[REVENUECAT_ENTITLEMENT_REMOVE_ADS]?.isActive),
    clubActive: Boolean(club?.isActive),
    clubExpirationDate: club?.expirationDate ?? null,
  };
}

function buildMockOfferings(): PurchaseOffering[] {
  return [
    {
      identifier: 'MONETIZATION TEST MODE',
      packages: buildMockOffering().filter((pkg) => {
        if (
          pkg.productId === 'numberrush.club.monthly' ||
          pkg.productId === 'numberrush.club.annual'
        ) {
          return isSubscriptionsFeatureEnabled();
        }
        return true;
      }),
    },
  ];
}

export function getPurchasesAvailability(): boolean {
  if (!isPurchasesFeatureEnabled()) return false;
  if (isMonetizationTestMode()) return true;
  return loadPurchasesModule() != null && getRevenueCatApiKey() != null;
}

export function getPurchaseState(): PurchaseState {
  return purchaseState;
}

export function getOfferingsSnapshot(): PurchaseOffering[] {
  return offerings;
}

export function getEntitlementsSnapshot(): MonetizationEntitlements {
  return entitlements;
}

export function subscribePurchaseService(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function identifyPurchasesUser(
  userId: string | null,
): Promise<void> {
  if (!isPurchasesFeatureEnabled()) return;
  if (isMonetizationTestMode()) {
    identifiedUserId = userId;
    return;
  }
  const mod = loadPurchasesModule();
  if (!mod) return;
  try {
    if (userId && userId !== identifiedUserId) {
      await mod.default.logIn(userId);
      identifiedUserId = userId;
    } else if (!userId && identifiedUserId) {
      await mod.default.logOut();
      identifiedUserId = null;
    }
    const info = await mod.default.getCustomerInfo();
    entitlements = parseEntitlements(info.entitlements.active);
    notify();
  } catch (error) {
    logger.warn('purchases identify failed', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

let initStarted = false;

export function startPurchasesInitialization(): void {
  if (initStarted) return;
  initStarted = true;
  if (!isPurchasesFeatureEnabled()) {
    setPurchaseState('unavailable');
    return;
  }

  if (isMonetizationTestMode()) {
    offerings = buildMockOfferings();
    setPurchaseState('ready');
    trackEvent('purchase_init_completed', { mode: 'test' });
    return;
  }

  const apiKey = getRevenueCatApiKey();
  const mod = loadPurchasesModule();
  if (!mod || !apiKey) {
    setPurchaseState('unavailable');
    return;
  }

  setPurchaseState('loading');
  trackEvent('purchase_init_started');

  const timeout = setTimeout(() => {
    if (purchaseState === 'loading') {
      logger.warn('purchase init timed out');
      setPurchaseState('error');
    }
  }, PURCHASE_INIT_TIMEOUT_MS);

  void (async () => {
    try {
      await mod.default.configure({ apiKey });
      await refreshPurchasesOfferings();
      const info = await mod.default.getCustomerInfo();
      entitlements = parseEntitlements(info.entitlements.active);
      setPurchaseState('ready');
      trackEvent('purchase_init_completed', { mode: 'live' });
    } catch (error) {
      logger.warn('purchase init failed', {
        message: error instanceof Error ? error.message : String(error),
      });
      setPurchaseState('error');
      trackEvent('purchase_init_failed');
    } finally {
      clearTimeout(timeout);
    }
  })();
}

export async function refreshPurchasesOfferings(): Promise<void> {
  if (isMonetizationTestMode()) {
    offerings = buildMockOfferings();
    notify();
    return;
  }
  const mod = loadPurchasesModule();
  if (!mod) return;
  try {
    const result = await mod.default.getOfferings();
    const current = result.current;
    nativePackageByIdentifier.clear();
    if (!current) {
      offerings = [];
    } else {
      offerings = [
        {
          identifier: current.identifier,
          packages: current.availablePackages
            .map((pkg) => {
              const productId = mapStoreProductToId(pkg.product.identifier);
              if (!productId) return null;
              nativePackageByIdentifier.set(pkg.identifier, pkg);
              return {
                identifier: pkg.identifier,
                productId,
                packageType: pkg.packageType,
              };
            })
            .filter((p): p is PurchasePackageRef => p != null),
        },
      ];
    }
    notify();
  } catch (error) {
    logger.warn('offerings refresh failed', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function purchasePackage(
  pkg: PurchasePackageRef,
): Promise<PurchaseResult> {
  if (!isPurchasesFeatureEnabled()) {
    return { ok: false, error: 'Purchases disabled' };
  }

  trackEvent('purchase_started', { productId: pkg.productId });

  if (isMonetizationTestMode()) {
    const txnId = `test_${Date.now()}`;
    await enqueuePendingPurchase({
      productId: pkg.productId,
      transactionId: txnId,
      queuedAt: new Date().toISOString(),
    });
    if (pkg.productId === 'numberrush.remove_ads') {
      entitlements = { ...entitlements, removeAds: true };
    }
    if (
      pkg.productId === 'numberrush.club.monthly' ||
      pkg.productId === 'numberrush.club.annual'
    ) {
      entitlements = { ...entitlements, clubActive: true };
    }
    if (pkg.productId === 'numberrush.starter_bundle') {
      entitlements = { ...entitlements, removeAds: true };
    }
    notify();
    trackEvent('purchase_completed', {
      productId: pkg.productId,
      mode: 'test',
    });
    return { ok: true, productId: pkg.productId };
  }

  const mod = loadPurchasesModule();
  if (!mod) return { ok: false, error: 'Purchases unavailable' };

  setPurchaseState('purchasing');
  try {
    const nativePkg = nativePackageByIdentifier.get(pkg.identifier);
    if (!nativePkg) {
      return { ok: false, error: 'Package not found' };
    }
    const result = await mod.default.purchasePackage(nativePkg);
    const productId =
      mapStoreProductToId(result.productIdentifier) ?? pkg.productId;
    const txnId =
      result.transaction?.transactionIdentifier ?? `rc_${Date.now()}`;
    await enqueuePendingPurchase({
      productId,
      transactionId: txnId,
      queuedAt: new Date().toISOString(),
    });
    const info = await mod.default.getCustomerInfo();
    entitlements = parseEntitlements(info.entitlements.active);
    trackEvent('purchase_completed', { productId });
    return { ok: true, productId };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const cancelled =
      typeof error === 'object' &&
      error != null &&
      'code' in error &&
      String((error as { code: string }).code) ===
        mod.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
    trackEvent('purchase_failed', { message, cancelled });
    return { ok: false, error: message, cancelled };
  } finally {
    setPurchaseState('ready');
    notify();
  }
}

export async function logoutPurchases(): Promise<void> {
  await identifyPurchasesUser(null);
}

export async function restorePurchases(): Promise<PurchaseResult> {
  if (!isPurchasesFeatureEnabled()) {
    return { ok: false, error: 'Purchases disabled' };
  }
  if (isMonetizationTestMode()) {
    trackEvent('purchase_restored', { mode: 'test' });
    return { ok: true, productId: 'numberrush.remove_ads' };
  }
  const mod = loadPurchasesModule();
  if (!mod) return { ok: false, error: 'Purchases unavailable' };
  setPurchaseState('restoring');
  try {
    const info = await mod.default.restorePurchases();
    entitlements = parseEntitlements(info.entitlements.active);
    trackEvent('purchase_restored', { mode: 'live' });
    notify();
    return { ok: true, productId: 'numberrush.remove_ads' };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    trackEvent('purchase_restore_failed', { message });
    return { ok: false, error: message };
  } finally {
    setPurchaseState('ready');
    notify();
  }
}
