import type { LiveOpsEnvironment, RemoteConfig } from './liveOpsTypes';
import { createDefaultRemoteConfig } from './remoteConfigDefaults';

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function asEnvironment(value: unknown, fallback: LiveOpsEnvironment): LiveOpsEnvironment {
  if (value === 'development' || value === 'preview' || value === 'production') {
    return value;
  }
  return fallback;
}

/** Normalize and validate remote config. Returns null when payload is unsafe. */
export function normalizeRemoteConfig(raw: unknown): RemoteConfig | null {
  if (!isObject(raw)) return null;
  const defaults = createDefaultRemoteConfig();
  const version = asNumber(raw.version, NaN);
  if (!Number.isFinite(version) || version < 1) return null;

  const appRaw = isObject(raw.app) ? raw.app : {};
  const gameplayRaw = isObject(raw.gameplay) ? raw.gameplay : {};
  const economyRaw = isObject(raw.economy) ? raw.economy : {};
  const monetizationRaw = isObject(raw.monetization) ? raw.monetization : {};
  const liveOpsRaw = isObject(raw.liveOps) ? raw.liveOps : {};
  const betaRaw = isObject(raw.beta) ? raw.beta : {};

  const targetValue = asNumber(gameplayRaw.targetValue, defaults.gameplay.targetValue);
  if (targetValue < 1 || targetValue > 99) return null;

  const channels = Array.isArray(betaRaw.allowedBuildChannels)
    ? betaRaw.allowedBuildChannels.filter((c): c is string => typeof c === 'string')
    : defaults.beta.allowedBuildChannels;

  return {
    version: Math.floor(version),
    publishedAt: asString(raw.publishedAt, defaults.publishedAt),
    environment: asEnvironment(raw.environment, defaults.environment),
    app: {
      maintenanceMode: asBoolean(appRaw.maintenanceMode, false),
      maintenanceMessage: asString(
        appRaw.maintenanceMessage,
        defaults.app.maintenanceMessage,
      ),
      estimatedReturnAt: asNullableString(appRaw.estimatedReturnAt),
      allowOfflineClassicDuringMaintenance: asBoolean(
        appRaw.allowOfflineClassicDuringMaintenance,
        true,
      ),
      minimumSupportedVersion: asString(
        appRaw.minimumSupportedVersion,
        defaults.app.minimumSupportedVersion,
      ),
      recommendedVersion: asString(
        appRaw.recommendedVersion,
        defaults.app.recommendedVersion,
      ),
      forceUpdateEnabled: asBoolean(appRaw.forceUpdateEnabled, false),
      updateMessage: asString(appRaw.updateMessage, defaults.app.updateMessage),
      androidStoreUrl: asNullableString(appRaw.androidStoreUrl),
      iosStoreUrl: asNullableString(appRaw.iosStoreUrl),
      supportUrl: asNullableString(appRaw.supportUrl),
      privacyPolicyUrl: asNullableString(appRaw.privacyPolicyUrl),
      termsUrl: asNullableString(appRaw.termsUrl),
    },
    gameplay: {
      classicEnabled: asBoolean(gameplayRaw.classicEnabled, true),
      dailyEnabled: asBoolean(gameplayRaw.dailyEnabled, true),
      rankedEnabled: asBoolean(gameplayRaw.rankedEnabled, true),
      targetValue,
      classicMaximumStrikes: Math.max(
        1,
        Math.floor(
          asNumber(
            gameplayRaw.classicMaximumStrikes,
            defaults.gameplay.classicMaximumStrikes,
          ),
        ),
      ),
      dailyMaximumTiles: Math.max(
        1,
        Math.floor(
          asNumber(gameplayRaw.dailyMaximumTiles, defaults.gameplay.dailyMaximumTiles),
        ),
      ),
      rankedMaximumTiles: Math.max(
        1,
        Math.floor(
          asNumber(
            gameplayRaw.rankedMaximumTiles,
            defaults.gameplay.rankedMaximumTiles,
          ),
        ),
      ),
    },
    economy: {
      progressionRewardsEnabled: asBoolean(economyRaw.progressionRewardsEnabled, true),
      missionsEnabled: asBoolean(economyRaw.missionsEnabled, true),
      shopEnabled: asBoolean(economyRaw.shopEnabled, true),
      maximumInventoryQuantity: Math.max(
        1,
        Math.floor(
          asNumber(
            economyRaw.maximumInventoryQuantity,
            defaults.economy.maximumInventoryQuantity,
          ),
        ),
      ),
      rewardedAdDailyCap: Math.max(
        0,
        Math.floor(
          asNumber(economyRaw.rewardedAdDailyCap, defaults.economy.rewardedAdDailyCap),
        ),
      ),
      interstitialDailyCap: Math.max(
        0,
        Math.floor(
          asNumber(
            economyRaw.interstitialDailyCap,
            defaults.economy.interstitialDailyCap,
          ),
        ),
      ),
    },
    monetization: {
      rewardedAdsEnabled: asBoolean(monetizationRaw.rewardedAdsEnabled, true),
      interstitialAdsEnabled: asBoolean(monetizationRaw.interstitialAdsEnabled, true),
      purchasesEnabled: asBoolean(monetizationRaw.purchasesEnabled, true),
      subscriptionsEnabled: asBoolean(monetizationRaw.subscriptionsEnabled, false),
    },
    liveOps: {
      announcementsEnabled: asBoolean(liveOpsRaw.announcementsEnabled, true),
      eventsEnabled: asBoolean(liveOpsRaw.eventsEnabled, true),
      currentSeasonKey: asNullableString(liveOpsRaw.currentSeasonKey),
    },
    beta: {
      betaBadgeEnabled: asBoolean(betaRaw.betaBadgeEnabled, defaults.beta.betaBadgeEnabled),
      feedbackEnabled: asBoolean(betaRaw.feedbackEnabled, true),
      allowedBuildChannels: channels.length ? channels : defaults.beta.allowedBuildChannels,
    },
  };
}
