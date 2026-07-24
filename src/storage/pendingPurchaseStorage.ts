import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '../logging/logger';
import type { PurchaseProductId } from '../monetization/monetizationTypes';

export const PENDING_PURCHASE_STORAGE_KEY = 'numberRush.purchases.pending';

export type PendingPurchaseRecord = {
  productId: PurchaseProductId;
  transactionId: string;
  queuedAt: string;
};

export async function readPendingPurchases(): Promise<PendingPurchaseRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_PURCHASE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is PendingPurchaseRecord =>
        !!item &&
        typeof item === 'object' &&
        typeof (item as PendingPurchaseRecord).productId === 'string' &&
        typeof (item as PendingPurchaseRecord).transactionId === 'string' &&
        typeof (item as PendingPurchaseRecord).queuedAt === 'string',
    );
  } catch (error) {
    logger.warn('pendingPurchaseStorage read failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

export async function writePendingPurchases(
  records: PendingPurchaseRecord[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      PENDING_PURCHASE_STORAGE_KEY,
      JSON.stringify(records),
    );
  } catch (error) {
    logger.warn('pendingPurchaseStorage write failed', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function enqueuePendingPurchase(
  record: PendingPurchaseRecord,
): Promise<void> {
  const existing = await readPendingPurchases();
  if (existing.some((r) => r.transactionId === record.transactionId)) return;
  await writePendingPurchases([...existing, record]);
}
