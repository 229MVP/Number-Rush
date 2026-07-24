export type AdsConsentModule = {
  AdsConsent: {
    requestInfoUpdate: () => Promise<{ status: number | string }>;
    loadAndShowConsentFormIfRequired: () => Promise<{
      status: number | string;
    }>;
    getConsentInfo: () => Promise<{
      status: number | string;
      isConsentFormAvailable?: boolean;
    }>;
    showPrivacyOptionsForm?: () => Promise<unknown>;
  };
};
