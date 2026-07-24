import { trackEvent } from '../analytics/analyticsService';
import { getConsentSnapshot } from '../consent/consentService';
import { logger } from '../logging/logger';
import type { AdLoadState } from '../monetization/monetizationTypes';
import {
  AD_INIT_TIMEOUT_MS,
  isInterstitialAdsFeatureEnabled,
  isRewardedAdsFeatureEnabled,
  shouldRequestNonPersonalizedAds,
} from './adConfiguration';
import { getInterstitialAdUnitId, getRewardedAdUnitId } from './adUnitIds';
import type {
  ShowInterstitialResult,
  ShowRewardedInput,
  ShowRewardedResult,
} from './adsTypes';
import { loadMobileAdsModule } from './loadMobileAds';
import type {
  InterstitialAdInstance,
  MobileAdsModule,
  RewardedAdInstance,
} from './mobileAdsModuleTypes';

let nativeModule: MobileAdsModule | null | undefined;
let initStarted = false;
let initComplete = false;

let rewarded: RewardedAdInstance | null = null;
let interstitial: InterstitialAdInstance | null = null;
let rewardedState: AdLoadState = 'idle';
let interstitialState: AdLoadState = 'idle';
let showingRewarded = false;
let showingInterstitial = false;

const stateListeners = new Set<() => void>();

function notifyState(): void {
  for (const l of stateListeners) l();
}

function setRewardedState(next: AdLoadState): void {
  rewardedState = next;
  notifyState();
}

function setInterstitialState(next: AdLoadState): void {
  interstitialState = next;
  notifyState();
}

function loadNativeModule(): MobileAdsModule | null {
  if (nativeModule !== undefined) return nativeModule;
  nativeModule = loadMobileAdsModule();
  return nativeModule;
}

export function getAdsAvailability(): boolean {
  return loadNativeModule() != null;
}

export function getRewardedLoadState(): AdLoadState {
  return rewardedState;
}

export function getInterstitialLoadState(): AdLoadState {
  return interstitialState;
}

export function subscribeAdServiceState(listener: () => void): () => void {
  stateListeners.add(listener);
  return () => stateListeners.delete(listener);
}

export function startAdsInitialization(): void {
  if (initStarted) return;
  initStarted = true;

  const mod = loadNativeModule();
  if (!mod || (!isRewardedAdsFeatureEnabled() && !isInterstitialAdsFeatureEnabled())) {
    setRewardedState('unavailable');
    setInterstitialState('unavailable');
    initComplete = true;
    return;
  }

  const consent = getConsentSnapshot();
  if (!consent.canRequestAds) {
    setRewardedState('unavailable');
    setInterstitialState('unavailable');
    initComplete = true;
    return;
  }

  trackEvent('ad_init_started');

  const timeout = setTimeout(() => {
    if (!initComplete) {
      logger.warn('ad init timed out; continuing without blocking app');
      initComplete = true;
      trackEvent('ad_init_completed', { timedOut: true });
    }
  }, AD_INIT_TIMEOUT_MS);

  void (async () => {
    try {
      const mobileAds = mod.MobileAds();
      if (shouldRequestNonPersonalizedAds()) {
        await mobileAds.setRequestConfiguration({
          tagForChildDirectedTreatment: false,
          tagForUnderAgeOfConsent: false,
          maxAdContentRating: mod.MaxAdContentRating.G,
        });
      }
      await mobileAds.initialize();
      if (isRewardedAdsFeatureEnabled()) preloadRewardedAd();
      if (isInterstitialAdsFeatureEnabled()) preloadInterstitialAd();
      trackEvent('ad_init_completed', { timedOut: false });
    } catch (error) {
      logger.warn('ad init failed', {
        message: error instanceof Error ? error.message : String(error),
      });
      setRewardedState('error');
      setInterstitialState('error');
      trackEvent('ad_init_failed');
    } finally {
      clearTimeout(timeout);
      initComplete = true;
    }
  })();
}

export function preloadRewardedAd(): void {
  if (!isRewardedAdsFeatureEnabled()) {
    setRewardedState('unavailable');
    return;
  }
  const mod = loadNativeModule();
  if (!mod) {
    setRewardedState('unavailable');
    return;
  }
  if (showingRewarded || rewardedState === 'loading' || rewardedState === 'ready') {
    return;
  }
  setRewardedState('loading');
  const unitId = getRewardedAdUnitId();
  rewarded = mod.RewardedAd.createForAdRequest(unitId);
  const unsubLoad = rewarded.addAdEventListener(mod.RewardedAdEventType.LOADED, () => {
    setRewardedState('ready');
    trackEvent('ad_loaded', { format: 'rewarded', unitId });
    unsubLoad();
  });
  const unsubError = rewarded.addAdEventListener(mod.AdEventType.ERROR, () => {
    setRewardedState('error');
    trackEvent('ad_load_failed', { format: 'rewarded', unitId });
    unsubError();
  });
  trackEvent('ad_request', { format: 'rewarded', unitId });
  rewarded.load();
}

export function preloadInterstitialAd(): void {
  if (!isInterstitialAdsFeatureEnabled()) {
    setInterstitialState('unavailable');
    return;
  }
  const mod = loadNativeModule();
  if (!mod) {
    setInterstitialState('unavailable');
    return;
  }
  if (
    showingInterstitial ||
    interstitialState === 'loading' ||
    interstitialState === 'ready'
  ) {
    return;
  }
  setInterstitialState('loading');
  const unitId = getInterstitialAdUnitId();
  interstitial = mod.InterstitialAd.createForAdRequest(unitId);
  const unsubLoad = interstitial.addAdEventListener(mod.AdEventType.LOADED, () => {
    setInterstitialState('ready');
    trackEvent('ad_loaded', { format: 'interstitial', unitId });
    unsubLoad();
  });
  const unsubError = interstitial.addAdEventListener(mod.AdEventType.ERROR, () => {
    setInterstitialState('error');
    trackEvent('ad_load_failed', { format: 'interstitial', unitId });
    unsubError();
  });
  trackEvent('ad_request', { format: 'interstitial', unitId });
  interstitial.load();
}

export async function showRewardedAd(
  input: ShowRewardedInput,
): Promise<ShowRewardedResult> {
  if (showingRewarded) return { earned: false };
  const mod = loadNativeModule();
  if (!mod || !rewarded || rewardedState !== 'ready') {
    trackEvent('ad_show_failed', {
      format: 'rewarded',
      placement: input.placement,
      reason: 'not_ready',
    });
    preloadRewardedAd();
    return { earned: false };
  }

  showingRewarded = true;
  setRewardedState('showing');
  trackEvent('ad_show_requested', {
    format: 'rewarded',
    placement: input.placement,
    opportunityId: input.opportunityId,
  });

  let earned = false;

  try {
    await new Promise<void>((resolve, reject) => {
      const ad = rewarded!;
      const unsubEarned = ad.addAdEventListener(
        mod.RewardedAdEventType.EARNED_REWARD,
        () => {
          earned = true;
          trackEvent('ad_reward_earned', {
            placement: input.placement,
            opportunityId: input.opportunityId,
          });
        },
      );
      const unsubClose = ad.addAdEventListener(mod.AdEventType.CLOSED, () => {
        unsubEarned();
        unsubClose();
        resolve();
      });
      const unsubError = ad.addAdEventListener(mod.AdEventType.ERROR, () => {
        unsubEarned();
        unsubClose();
        unsubError();
        reject(new Error('rewarded show error'));
      });
      trackEvent('ad_show_started', {
        format: 'rewarded',
        placement: input.placement,
      });
      void ad.show();
    });
    trackEvent('ad_show_completed', {
      format: 'rewarded',
      placement: input.placement,
      earned,
    });
  } catch (error) {
    trackEvent('ad_show_failed', {
      format: 'rewarded',
      placement: input.placement,
      message: error instanceof Error ? error.message : 'unknown',
    });
    earned = false;
  } finally {
    showingRewarded = false;
    rewarded = null;
    setRewardedState('idle');
    preloadRewardedAd();
  }

  return { earned };
}

export async function showInterstitialAd(
  placement: string,
): Promise<ShowInterstitialResult> {
  if (showingInterstitial) return { shown: false };
  const mod = loadNativeModule();
  if (!mod || !interstitial || interstitialState !== 'ready') {
    trackEvent('ad_show_failed', {
      format: 'interstitial',
      placement,
      reason: 'not_ready',
    });
    preloadInterstitialAd();
    return { shown: false };
  }

  showingInterstitial = true;
  setInterstitialState('showing');
  trackEvent('ad_show_requested', { format: 'interstitial', placement });

  let shown = false;
  try {
    await new Promise<void>((resolve, reject) => {
      const ad = interstitial!;
      const unsubClose = ad.addAdEventListener(mod.AdEventType.CLOSED, () => {
        shown = true;
        unsubClose();
        resolve();
      });
      const unsubError = ad.addAdEventListener(mod.AdEventType.ERROR, () => {
        unsubClose();
        unsubError();
        reject(new Error('interstitial show error'));
      });
      trackEvent('ad_show_started', { format: 'interstitial', placement });
      void ad.show();
    });
    trackEvent('ad_show_completed', { format: 'interstitial', placement, shown });
  } catch (error) {
    trackEvent('ad_show_failed', {
      format: 'interstitial',
      placement,
      message: error instanceof Error ? error.message : 'unknown',
    });
    shown = false;
  } finally {
    showingInterstitial = false;
    interstitial = null;
    setInterstitialState('idle');
    preloadInterstitialAd();
  }

  return { shown };
}
