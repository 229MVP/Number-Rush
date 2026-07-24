export type ConsentStatus =
  | 'unknown'
  | 'gathering'
  | 'required'
  | 'obtained'
  | 'notRequired'
  | 'unavailable'
  | 'error';

export type TrackingAuthorizationStatus =
  | 'unavailable'
  | 'not-determined'
  | 'restricted'
  | 'denied'
  | 'authorized';

export type ConsentSnapshot = {
  consentStatus: ConsentStatus;
  canRequestAds: boolean;
  isConsentFormAvailable: boolean;
  trackingStatus: TrackingAuthorizationStatus;
  lastError: string | null;
};
