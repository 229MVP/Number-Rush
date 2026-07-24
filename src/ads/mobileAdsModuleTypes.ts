export type RewardedAdInstance = {
  load: () => void;
  show: () => Promise<void>;
  addAdEventListener: (
    type: string,
    listener: (payload?: { type?: string }) => void,
  ) => () => void;
};

export type InterstitialAdInstance = RewardedAdInstance;

export type MobileAdsModule = {
  MobileAds: () => {
    setRequestConfiguration: (config: {
      tagForChildDirectedTreatment?: boolean;
      tagForUnderAgeOfConsent?: boolean;
      maxAdContentRating?: string;
    }) => Promise<void>;
    initialize: () => Promise<void>;
  };
  RewardedAd: {
    createForAdRequest: (unitId: string) => RewardedAdInstance;
  };
  InterstitialAd: {
    createForAdRequest: (unitId: string) => InterstitialAdInstance;
  };
  RewardedAdEventType: { LOADED: string; EARNED_REWARD: string };
  AdEventType: { LOADED: string; CLOSED: string; ERROR: string };
  MaxAdContentRating: { G: string };
};
