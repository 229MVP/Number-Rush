export type LiveOpsEnvironment = 'development' | 'preview' | 'production';

export type RemoteConfig = {
  version: number;
  publishedAt: string;
  environment: LiveOpsEnvironment;
  app: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    estimatedReturnAt: string | null;
    allowOfflineClassicDuringMaintenance: boolean;
    minimumSupportedVersion: string;
    recommendedVersion: string;
    forceUpdateEnabled: boolean;
    updateMessage: string;
    androidStoreUrl: string | null;
    iosStoreUrl: string | null;
    supportUrl: string | null;
    privacyPolicyUrl: string | null;
    termsUrl: string | null;
  };
  gameplay: {
    classicEnabled: boolean;
    dailyEnabled: boolean;
    rankedEnabled: boolean;
    targetValue: number;
    classicMaximumStrikes: number;
    dailyMaximumTiles: number;
    rankedMaximumTiles: number;
  };
  economy: {
    progressionRewardsEnabled: boolean;
    missionsEnabled: boolean;
    shopEnabled: boolean;
    maximumInventoryQuantity: number;
    rewardedAdDailyCap: number;
    interstitialDailyCap: number;
  };
  monetization: {
    rewardedAdsEnabled: boolean;
    interstitialAdsEnabled: boolean;
    purchasesEnabled: boolean;
    subscriptionsEnabled: boolean;
  };
  liveOps: {
    announcementsEnabled: boolean;
    eventsEnabled: boolean;
    currentSeasonKey: string | null;
  };
  beta: {
    betaBadgeEnabled: boolean;
    feedbackEnabled: boolean;
    allowedBuildChannels: string[];
  };
};

export type RemoteConfigFetchState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'cached'
  | 'error';

export type ServerClockSnapshot = {
  serverTimeIso: string | null;
  offsetMs: number;
  synchronizedAtMs: number | null;
  trusted: boolean;
};

export type RankedSeasonSummary = {
  id: string;
  seasonKey: string;
  name: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'archived';
};

export type LiveEventSummary = {
  id: string;
  eventKey: string;
  name: string;
  description: string;
  eventType:
    | 'score_challenge'
    | 'perfect_challenge'
    | 'combo_challenge'
    | 'classic_modifier'
    | 'community_goal'
    | 'cosmetic_showcase';
  startsAt: string;
  endsAt: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'archived';
  accentColor: string | null;
  bannerAssetUrl: string | null;
};

export type AnnouncementSummary = {
  id: string;
  title: string;
  body: string;
  announcementType:
    | 'news'
    | 'event'
    | 'maintenance'
    | 'reward'
    | 'update'
    | 'warning';
  audience: string;
  startsAt: string;
  endsAt: string | null;
  priority: number;
  dismissible: boolean;
  actionType: 'none' | 'internal_route' | 'external_url' | null;
  actionValue: string | null;
  imageUrl: string | null;
};
