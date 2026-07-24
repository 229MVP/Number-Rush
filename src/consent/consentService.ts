import { personalizedAdsEnabled } from '../config/featureFlags';
import { getAppEnvironment } from '../config/environment';
import { logger } from '../logging/logger';
import type { ConsentSnapshot, ConsentStatus } from './consentTypes';
import type { AdsConsentModule } from './adsConsentModuleTypes';
import { loadAdsConsentModule } from './loadAdsConsent';
import {
  getTrackingAuthorizationStatus,
  requestTrackingAuthorizationIfNeeded,
} from './trackingAuthorization';

type ConsentListener = (snapshot: ConsentSnapshot) => void;

let snapshot: ConsentSnapshot = {
  consentStatus: 'unknown',
  canRequestAds: true,
  isConsentFormAvailable: false,
  trackingStatus: 'not-determined',
  lastError: null,
};

const listeners = new Set<ConsentListener>();

function emit(): void {
  for (const listener of listeners) {
    try {
      listener(snapshot);
    } catch (error) {
      logger.warn('consent listener failed', {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

function setSnapshot(patch: Partial<ConsentSnapshot>): void {
  snapshot = { ...snapshot, ...patch };
  emit();
}

export function getConsentSnapshot(): ConsentSnapshot {
  return snapshot;
}

export function subscribeConsent(listener: ConsentListener): () => void {
  listeners.add(listener);
  listener(snapshot);
  return () => listeners.delete(listener);
}

function mapUmpStatus(
  status: number | string | undefined,
): ConsentStatus {
  const normalized = String(status ?? '').toUpperCase();
  if (normalized.includes('OBTAINED')) return 'obtained';
  if (normalized.includes('REQUIRED')) return 'required';
  if (normalized.includes('NOT_REQUIRED')) return 'notRequired';
  if (normalized.includes('UNKNOWN')) return 'unknown';
  return 'unknown';
}

function resolveCanRequestAds(consentStatus: ConsentStatus): boolean {
  if (__DEV__ || getAppEnvironment() !== 'production') {
    if (consentStatus === 'error') return false;
    return true;
  }
  if (!personalizedAdsEnabled) return true;
  if (consentStatus === 'obtained' || consentStatus === 'notRequired') {
    return true;
  }
  if (consentStatus === 'required' || consentStatus === 'error') return false;
  return consentStatus !== 'unavailable';
}

export async function gatherConsent(options?: {
  requestAtt?: boolean;
}): Promise<ConsentSnapshot> {
  setSnapshot({ consentStatus: 'gathering', lastError: null });

  if (__DEV__) {
    await new Promise((r) => setTimeout(r, 50));
    const trackingStatus = await getTrackingAuthorizationStatus();
    setSnapshot({
      consentStatus: 'notRequired',
      canRequestAds: true,
      isConsentFormAvailable: false,
      trackingStatus,
      lastError: null,
    });
    if (options?.requestAtt) {
      await requestTrackingAuthorizationIfNeeded();
      setSnapshot({
        trackingStatus: await getTrackingAuthorizationStatus(),
      });
    }
    return snapshot;
  }

  const mod: AdsConsentModule | null = loadAdsConsentModule();
  if (!mod?.AdsConsent) {
    setSnapshot({
      consentStatus: 'unavailable',
      canRequestAds: true,
      isConsentFormAvailable: false,
      trackingStatus: await getTrackingAuthorizationStatus(),
    });
    return snapshot;
  }

  try {
    const info = await mod.AdsConsent.requestInfoUpdate();
    let status = mapUmpStatus(info.status);
    let formAvailable = false;
    try {
      const detail = await mod.AdsConsent.getConsentInfo();
      formAvailable = Boolean(detail.isConsentFormAvailable);
      status = mapUmpStatus(detail.status);
    } catch {
      // optional
    }
    if (status === 'required') {
      const result = await mod.AdsConsent.loadAndShowConsentFormIfRequired();
      status = mapUmpStatus(result.status);
    }
    const trackingStatus = await getTrackingAuthorizationStatus();
    setSnapshot({
      consentStatus: status,
      canRequestAds: resolveCanRequestAds(status),
      isConsentFormAvailable: formAvailable,
      trackingStatus,
      lastError: null,
    });
    if (options?.requestAtt) {
      await requestTrackingAuthorizationIfNeeded();
      setSnapshot({
        trackingStatus: await getTrackingAuthorizationStatus(),
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn('consent gather failed', { message });
    setSnapshot({
      consentStatus: 'error',
      canRequestAds: resolveCanRequestAds('error'),
      lastError: message,
      trackingStatus: await getTrackingAuthorizationStatus(),
    });
  }

  return snapshot;
}

export async function refreshConsentInfo(): Promise<ConsentSnapshot> {
  if (__DEV__) {
    setSnapshot({
      consentStatus: 'notRequired',
      canRequestAds: true,
    });
    return snapshot;
  }
  const mod = loadAdsConsentModule();
  if (!mod?.AdsConsent) {
    setSnapshot({ consentStatus: 'unavailable', canRequestAds: true });
    return snapshot;
  }
  try {
    const info = await mod.AdsConsent.getConsentInfo();
    const status = mapUmpStatus(info.status);
    setSnapshot({
      consentStatus: status,
      canRequestAds: resolveCanRequestAds(status),
      isConsentFormAvailable: Boolean(info.isConsentFormAvailable),
    });
  } catch (error) {
    setSnapshot({
      consentStatus: 'error',
      canRequestAds: resolveCanRequestAds('error'),
      lastError: error instanceof Error ? error.message : String(error),
    });
  }
  return snapshot;
}

export async function presentPrivacyOptions(): Promise<boolean> {
  if (__DEV__) return false;
  const mod = loadAdsConsentModule();
  if (!mod?.AdsConsent.showPrivacyOptionsForm) return false;
  try {
    await mod.AdsConsent.showPrivacyOptionsForm();
    await refreshConsentInfo();
    return true;
  } catch (error) {
    logger.warn('privacy options failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
