import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { trackEvent } from '../analytics/analyticsService';
import type { ConsentSnapshot } from './consentTypes';
import {
  gatherConsent,
  getConsentSnapshot,
  presentPrivacyOptions,
  refreshConsentInfo,
  subscribeConsent,
} from './consentService';
import { requestTrackingAuthorizationIfNeeded } from './trackingAuthorization';

export type ConsentContextValue = ConsentSnapshot & {
  refresh: () => Promise<void>;
  requestTrackingIfNeeded: () => Promise<void>;
  presentPrivacyOptions: () => Promise<boolean>;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConsentSnapshot>(getConsentSnapshot);

  useEffect(() => {
    return subscribeConsent(setState);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await gatherConsent({ requestAtt: false });
      if (!cancelled) {
        trackEvent('consent_gather_completed', {
          status: getConsentSnapshot().consentStatus,
          canRequestAds: getConsentSnapshot().canRequestAds,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    await refreshConsentInfo();
  }, []);

  const requestTrackingIfNeeded = useCallback(async () => {
    const status = await requestTrackingAuthorizationIfNeeded();
    trackEvent('att_status_updated', { status });
    setState(getConsentSnapshot());
  }, []);

  const openPrivacyOptions = useCallback(async () => {
    const shown = await presentPrivacyOptions();
    setState(getConsentSnapshot());
    return shown;
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      ...state,
      refresh,
      requestTrackingIfNeeded,
      presentPrivacyOptions: openPrivacyOptions,
    }),
    [state, refresh, requestTrackingIfNeeded, openPrivacyOptions],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsentContext(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error('useConsentContext must be used within ConsentProvider');
  }
  return ctx;
}
