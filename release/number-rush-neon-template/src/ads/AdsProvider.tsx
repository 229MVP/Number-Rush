import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useConsentContext } from '../consent/ConsentProvider';
import type { InterstitialPlacement } from '../monetization/monetizationTypes';
import {
  getAdsAvailability,
  getInterstitialLoadState,
  getRewardedLoadState,
  preloadInterstitialAd,
  preloadRewardedAd,
  showInterstitialAd,
  showRewardedAd,
  startAdsInitialization,
  subscribeAdServiceState,
} from './adService';
import type {
  AdsContextValue,
  ShowRewardedInput,
  ShowRewardedResult,
  ShowInterstitialResult,
} from './adsTypes';
import { isAdsFeatureEnabled } from './adConfiguration';

const AdsContext = createContext<AdsContextValue | null>(null);

export function AdsProvider({ children }: { children: React.ReactNode }) {
  const { canRequestAds } = useConsentContext();
  const [tick, setTick] = useState(0);

  useEffect(() => subscribeAdServiceState(() => setTick((t) => t + 1)), []);

  useEffect(() => {
    if (!isAdsFeatureEnabled() || !canRequestAds) return;
    startAdsInitialization();
  }, [canRequestAds]);

  const adsAvailable =
    isAdsFeatureEnabled() && canRequestAds && getAdsAvailability();

  const showRewarded = useCallback(
    async (input: ShowRewardedInput): Promise<ShowRewardedResult> => {
      if (!adsAvailable) return { earned: false };
      return showRewardedAd(input);
    },
    [adsAvailable],
  );

  const showInterstitial = useCallback(
    async (
      placement: InterstitialPlacement,
    ): Promise<ShowInterstitialResult> => {
      if (!adsAvailable) return { shown: false };
      return showInterstitialAd(placement);
    },
    [adsAvailable],
  );

  const value = useMemo<AdsContextValue>(
    () => ({
      adsAvailable,
      rewardedState: getRewardedLoadState(),
      interstitialState: getInterstitialLoadState(),
      showRewarded,
      showInterstitial,
      preloadRewarded: preloadRewardedAd,
      preloadInterstitial: preloadInterstitialAd,
    }),
    // tick refreshes load states
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [adsAvailable, showRewarded, showInterstitial, tick],
  );

  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
}

export function useAdsContext(): AdsContextValue {
  const ctx = useContext(AdsContext);
  if (!ctx) {
    throw new Error('useAdsContext must be used within AdsProvider');
  }
  return ctx;
}
