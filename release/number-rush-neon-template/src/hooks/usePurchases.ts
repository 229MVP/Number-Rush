import { usePurchasesContext } from '../purchases/PurchasesProvider';

export function usePurchases() {
  return usePurchasesContext();
}
