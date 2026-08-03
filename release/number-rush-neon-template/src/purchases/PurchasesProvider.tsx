import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuthContext } from '../auth/AuthProvider';
import {
  getEntitlementsSnapshot,
  getOfferingsSnapshot,
  getPurchaseState,
  getPurchasesAvailability,
  identifyPurchasesUser,
  purchasePackage as purchasePackageRequest,
  refreshPurchasesOfferings,
  restorePurchases as restorePurchasesRequest,
  startPurchasesInitialization,
  subscribePurchaseService,
} from './purchaseService';
import { isMonetizationTestMode } from './purchaseConfiguration';
import type { PurchasesContextValue, PurchasePackageRef } from './purchaseTypes';

const PurchasesContext = createContext<PurchasesContextValue | null>(null);

export function PurchasesProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthContext();
  const [tick, setTick] = useState(0);

  useEffect(() => subscribePurchaseService(() => setTick((t) => t + 1)), []);

  useEffect(() => {
    startPurchasesInitialization();
  }, []);

  useEffect(() => {
    const id = isAuthenticated && user?.id ? user.id : null;
    void identifyPurchasesUser(id);
  }, [isAuthenticated, user?.id]);

  const purchasePackage = useCallback(async (pkg: PurchasePackageRef) => {
    return purchasePackageRequest(pkg);
  }, []);

  const restorePurchases = useCallback(async () => {
    return restorePurchasesRequest();
  }, []);

  const refreshOfferings = useCallback(async () => {
    await refreshPurchasesOfferings();
  }, []);

  const value = useMemo<PurchasesContextValue>(
    () => ({
      purchasesAvailable: getPurchasesAvailability(),
      purchaseState: getPurchaseState(),
      offerings: getOfferingsSnapshot(),
      entitlements: getEntitlementsSnapshot(),
      monetizationTestMode: isMonetizationTestMode(),
      purchasePackage,
      restorePurchases,
      refreshOfferings,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [purchasePackage, restorePurchases, refreshOfferings, tick],
  );

  return (
    <PurchasesContext.Provider value={value}>
      {children}
    </PurchasesContext.Provider>
  );
}

export function usePurchasesContext(): PurchasesContextValue {
  const ctx = useContext(PurchasesContext);
  if (!ctx) {
    throw new Error('usePurchasesContext must be used within PurchasesProvider');
  }
  return ctx;
}
