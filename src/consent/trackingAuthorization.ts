import { Platform } from 'react-native';

import { logger } from '../logging/logger';
import type { TrackingAuthorizationStatus } from './consentTypes';
import { loadTrackingModule } from './loadTracking';

function mapPermissionStatus(status: string): TrackingAuthorizationStatus {
  switch (status) {
    case 'granted':
      return 'authorized';
    case 'denied':
      return 'denied';
    case 'restricted':
      return 'restricted';
    case 'undetermined':
      return 'not-determined';
    default:
      return 'unavailable';
  }
}

export async function getTrackingAuthorizationStatus(): Promise<TrackingAuthorizationStatus> {
  if (Platform.OS !== 'ios') return 'unavailable';
  const mod = loadTrackingModule();
  if (!mod?.isAvailable?.()) return 'unavailable';
  try {
    const result = await mod.getTrackingPermissionsAsync();
    return mapPermissionStatus(result.status);
  } catch (error) {
    logger.warn('ATT status read failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    return 'unavailable';
  }
}

/** Request ATT only when undetermined; never throws into callers. */
export async function requestTrackingAuthorizationIfNeeded(): Promise<TrackingAuthorizationStatus> {
  if (Platform.OS !== 'ios') return 'unavailable';
  const mod = loadTrackingModule();
  if (!mod?.isAvailable?.()) return 'unavailable';
  try {
    const current = await mod.getTrackingPermissionsAsync();
    if (current.status !== 'undetermined') {
      return mapPermissionStatus(current.status);
    }
    const result = await mod.requestTrackingPermissionsAsync();
    return mapPermissionStatus(result.status);
  } catch (error) {
    logger.warn('ATT request failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    return 'unavailable';
  }
}
