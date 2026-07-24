/**
 * Loose shape matching react-native-purchases CommonJS export.
 * Keep intentionally permissive so SDK version drift does not break the adapter.
 */
export type PurchasesModuleShape = {
  default: {
    configure: (opts: { apiKey: string; appUserID?: string }) => Promise<void> | void;
    logIn: (appUserId: string) => Promise<unknown>;
    logOut: () => Promise<unknown>;
    getOfferings: () => Promise<{
      current?: {
        identifier: string;
        availablePackages: Array<{
          identifier: string;
          packageType: string;
          product: { identifier: string };
        }>;
      };
    }>;
    purchasePackage: (pkg: unknown) => Promise<{
      productIdentifier: string;
      transaction?: { transactionIdentifier?: string };
    }>;
    restorePurchases: () => Promise<{
      entitlements: { active: Record<string, { isActive: boolean }> };
    }>;
    getCustomerInfo: () => Promise<{
      entitlements: { active: Record<string, { isActive: boolean }> };
    }>;
  };
  PURCHASES_ERROR_CODE: { PURCHASE_CANCELLED_ERROR: string };
};
