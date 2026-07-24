import type { RemoteConfig } from './liveOpsTypes';
import { getAppEnvironment } from '../config/environment';

export function createDefaultRemoteConfig(): RemoteConfig {
  const environment = getAppEnvironment();
  return {
    version: 1,
    publishedAt: new Date(0).toISOString(),
    environment,
    app: {
      maintenanceMode: false,
      maintenanceMessage: 'Number Rush is temporarily offline for maintenance.',
      estimatedReturnAt: null,
      allowOfflineClassicDuringMaintenance: true,
      minimumSupportedVersion: '1.0.0',
      recommendedVersion: '1.0.0',
      forceUpdateEnabled: false,
      updateMessage: 'A new version of Number Rush is available.',
      androidStoreUrl: null,
      iosStoreUrl: null,
      supportUrl: null,
      privacyPolicyUrl: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || null,
      termsUrl: process.env.EXPO_PUBLIC_TERMS_URL || null,
    },
    gameplay: {
      classicEnabled: true,
      dailyEnabled: true,
      rankedEnabled: true,
      targetValue: 21,
      classicMaximumStrikes: 3,
      dailyMaximumTiles: 40,
      rankedMaximumTiles: 30,
    },
    economy: {
      progressionRewardsEnabled: true,
      missionsEnabled: true,
      shopEnabled: true,
      maximumInventoryQuantity: 9999,
      rewardedAdDailyCap: 12,
      interstitialDailyCap: 5,
    },
    monetization: {
      rewardedAdsEnabled: true,
      interstitialAdsEnabled: true,
      purchasesEnabled: true,
      subscriptionsEnabled: false,
    },
    liveOps: {
      announcementsEnabled: true,
      eventsEnabled: true,
      currentSeasonKey: 'season-1',
    },
    beta: {
      betaBadgeEnabled: environment !== 'production',
      feedbackEnabled: true,
      allowedBuildChannels: ['development', 'preview', 'closed-beta'],
    },
  };
}
