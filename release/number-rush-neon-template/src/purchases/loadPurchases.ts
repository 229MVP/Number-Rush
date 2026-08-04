import type { PurchasesModuleShape } from './purchasesModuleTypes';

/**
 * Default fallback for TypeScript resolution.
 * Metro prefers `.web.ts` / `.native.ts` at bundle time.
 */
export function loadPurchasesSdk(): PurchasesModuleShape | null {
  return null;
}
