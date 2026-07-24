import { trackEvent } from '../analytics/analyticsService';
import { getAppEnvironment } from '../config/environment';
import { isSupabaseConfigured } from '../config/supabaseEnvironment';
import { logger } from '../logging/logger';
import { getSupabaseClient } from '../backend/supabaseClient';
import type { RemoteConfig } from './liveOpsTypes';
import { createDefaultRemoteConfig } from './remoteConfigDefaults';
import {
  getBootstrapRemoteConfig,
  readCachedRemoteConfig,
  writeCachedRemoteConfig,
} from './remoteConfigStorage';
import { normalizeRemoteConfig } from './remoteConfigValidation';
import { applyServerTime, markServerClockUntrusted } from './serverClock';

const MIN_FETCH_INTERVAL_MS = 60_000;

let memoryConfig: RemoteConfig = createDefaultRemoteConfig();
let lastFetchAttemptMs = 0;
let inflight: Promise<RemoteConfig> | null = null;

export function getRemoteConfigSnapshot(): RemoteConfig {
  return memoryConfig;
}

export async function bootstrapRemoteConfig(): Promise<RemoteConfig> {
  const cached = await readCachedRemoteConfig();
  memoryConfig = getBootstrapRemoteConfig(cached);
  return memoryConfig;
}

export async function refreshRemoteConfig(options?: {
  force?: boolean;
}): Promise<RemoteConfig> {
  const now = Date.now();
  if (!options?.force && now - lastFetchAttemptMs < MIN_FETCH_INTERVAL_MS) {
    return memoryConfig;
  }
  if (inflight) return inflight;

  inflight = (async () => {
    lastFetchAttemptMs = Date.now();
    if (!isSupabaseConfigured()) {
      trackEvent('remote_config_failed', { reason: 'supabase_unconfigured' });
      return memoryConfig;
    }
    try {
      const client = getSupabaseClient();
      if (!client) return memoryConfig;
      const environment = getAppEnvironment();
      const { data, error } = await client.rpc('get_published_remote_config', {
        p_environment: environment,
      });
      if (error) throw error;

      const normalized = normalizeRemoteConfig(data);
      if (!normalized) {
        trackEvent('remote_config_failed', { reason: 'invalid_payload' });
        logger.warn('remote config rejected: invalid payload');
        return memoryConfig;
      }

      memoryConfig = normalized;
      await writeCachedRemoteConfig(normalized);
      trackEvent('remote_config_fetched', {
        version: normalized.version,
        environment: normalized.environment,
      });
      return memoryConfig;
    } catch (error) {
      trackEvent('remote_config_failed', {
        reason: error instanceof Error ? error.message : 'unknown',
      });
      logger.warn('remote config fetch failed', {
        message: error instanceof Error ? error.message : String(error),
      });
      return memoryConfig;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export async function refreshServerClock(): Promise<void> {
  if (!isSupabaseConfigured()) {
    markServerClockUntrusted();
    return;
  }
  try {
    const client = getSupabaseClient();
    if (!client) {
      markServerClockUntrusted();
      return;
    }
    const localBefore = Date.now();
    const { data, error } = await client.rpc('get_server_time');
    if (error) throw error;
    const iso =
      typeof data === 'string'
        ? data
        : data && typeof data === 'object' && 'server_time' in data
          ? String((data as { server_time: string }).server_time)
          : null;
    if (!iso) {
      markServerClockUntrusted();
      return;
    }
    applyServerTime(iso, localBefore);
  } catch (error) {
    markServerClockUntrusted();
    logger.warn('server clock sync failed', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
