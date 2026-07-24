import type {
  AdFormat,
  AdLoadState,
  InterstitialPlacement,
  RewardedPlacement,
} from '../monetization/monetizationTypes';

export type ShowRewardedInput = {
  placement: RewardedPlacement;
  opportunityId: string;
};

export type ShowRewardedResult = {
  earned: boolean;
};

export type ShowInterstitialResult = {
  shown: boolean;
};

export type AdsContextValue = {
  adsAvailable: boolean;
  rewardedState: AdLoadState;
  interstitialState: AdLoadState;
  showRewarded: (input: ShowRewardedInput) => Promise<ShowRewardedResult>;
  showInterstitial: (
    placement: InterstitialPlacement,
  ) => Promise<ShowInterstitialResult>;
  preloadRewarded: () => void;
  preloadInterstitial: () => void;
};

export type { AdFormat, AdLoadState, InterstitialPlacement, RewardedPlacement };
