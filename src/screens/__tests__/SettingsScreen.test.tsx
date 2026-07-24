import React from 'react';
import { SettingsScreen } from '../SettingsScreen';
import { renderWithProviders } from '../../test/renderWithProviders';

jest.mock('../../hooks/useConsent', () => ({
  useConsent: () => ({
    consentStatus: 'notRequired',
    canRequestAds: true,
    isConsentFormAvailable: false,
    trackingStatus: 'not-determined',
    lastError: null,
    refresh: jest.fn(),
    requestTrackingIfNeeded: jest.fn(),
    presentPrivacyOptions: jest.fn(async () => false),
  }),
}));

jest.mock('../../hooks/useAds', () => ({
  useAds: () => ({
    adsAvailable: false,
    rewardedState: 'unavailable',
    interstitialState: 'unavailable',
    showRewarded: jest.fn(),
    showInterstitial: jest.fn(),
    preloadRewarded: jest.fn(),
    preloadInterstitial: jest.fn(),
  }),
}));

jest.mock('../../hooks/usePurchases', () => ({
  usePurchases: () => ({
    purchasesAvailable: false,
    purchaseState: 'unavailable',
    offerings: [],
    entitlements: { removeAds: false, clubActive: false, clubExpirationDate: null },
    monetizationTestMode: true,
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(async () => ({ ok: false, error: 'mock' })),
    refreshOfferings: jest.fn(),
  }),
}));

describe('SettingsScreen', () => {
  const navigation = {
    navigate: jest.fn(),
    replace: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    canGoBack: jest.fn(() => true),
  } as any;

  const route = { key: 'settings', name: 'Settings', params: undefined } as any;

  it('renders settings shell and preference links', async () => {
    const view = await renderWithProviders(
      <SettingsScreen navigation={navigation} route={route} />,
      { withNavigation: false },
    );

    expect(view.getByTestId('screen-settings')).toBeTruthy();
    expect(view.getByTestId('settings-legal')).toBeTruthy();
    expect(view.getByTestId('settings-beta-feedback')).toBeTruthy();

    await view.unmount();
  });
});
