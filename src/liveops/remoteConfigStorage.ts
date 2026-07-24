import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '../logging/logger';
import type { RemoteConfig } from './liveOpsTypes';
import { createDefaultRemoteConfig } from './remoteConfigDefaults';
import { normalizeRemoteConfig } from './remoteConfigValidation';

export const REMOTE_CONFIG_STORAGE_KEY = 'numberRush.remoteConfig';

export type CachedRemoteConfig = {
  config: RemoteConfig;
  fetchedAt: string;
};

export async function readCachedRemoteConfig(): Promise<CachedRemoteConfig | null> {
  try {
    const raw = await AsyncStorage.getItem(REMOTE_CONFIG_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const record = parsed as { config?: unknown; fetchedAt?: unknown };
    const config = normalizeRemoteConfig(record.config);
    if (!config) return null;
    return {
      config,
      fetchedAt:
        typeof record.fetchedAt === 'string'
          ? record.fetchedAt
          : new Date(0).toISOString(),
    };
  } catch (error) {
    logger.warn('remoteConfig cache read failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function writeCachedRemoteConfig(config: RemoteConfig): Promise<void> {
  const payload: CachedRemoteConfig = {
    config,
    fetchedAt: new Date().toISOString(),
  };
  try {
    await AsyncStorage.setItem(REMOTE_CONFIG_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    logger.warn('remoteConfig cache write failed', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export function getBootstrapRemoteConfig(
  cached: CachedRemoteConfig | null,
): RemoteConfig {
  return cached?.config ?? createDefaultRemoteConfig();
}
