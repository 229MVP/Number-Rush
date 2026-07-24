import type {
  MonetizationEntitlements,
  PurchaseProductId,
  PurchaseState,
} from '../monetization/monetizationTypes';

export type PurchasePackageRef = {
  identifier: string;
  productId: PurchaseProductId;
  packageType: string;
};

export type PurchaseOffering = {
  identifier: string;
  packages: PurchasePackageRef[];
};

export type PurchaseResult =
  | { ok: true; productId: PurchaseProductId }
  | { ok: false; error: string; cancelled?: boolean };

export type PurchasesContextValue = {
  purchasesAvailable: boolean;
  purchaseState: PurchaseState;
  offerings: PurchaseOffering[];
  entitlements: MonetizationEntitlements;
  monetizationTestMode: boolean;
  purchasePackage: (pkg: PurchasePackageRef) => Promise<PurchaseResult>;
  restorePurchases: () => Promise<PurchaseResult>;
  refreshOfferings: () => Promise<void>;
};
