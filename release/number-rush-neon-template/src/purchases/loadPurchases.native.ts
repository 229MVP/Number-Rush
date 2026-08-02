import type { PurchasesModuleShape } from './purchasesModuleTypes';

/**
 * Native-only loader. Metro resolves this file for iOS/Android.
 */
export function loadPurchasesSdk(): PurchasesModuleShape | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-purchases') as PurchasesModuleShape;
  } catch {
    return null;
  }
}
