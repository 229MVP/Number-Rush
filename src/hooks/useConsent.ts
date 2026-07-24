import { useConsentContext } from '../consent/ConsentProvider';

export function useConsent() {
  return useConsentContext();
}
