import React from 'react';
import { SettingsScreen } from '../SettingsScreen';
import { renderWithProviders } from '../../test/renderWithProviders';

describe('SettingsScreen', () => {
  const navigation = {
    navigate: jest.fn(),
    replace: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    canGoBack: jest.fn(() => true),
  } as any;

  const route = { key: 'settings', name: 'Settings', params: undefined } as any;

  it('renders the sellable-template settings shell', async () => {
    const view = await renderWithProviders(
      <SettingsScreen navigation={navigation} route={route} />,
      { withNavigation: false },
    );

    expect(view.getByTestId('screen-settings')).toBeTruthy();
    expect(view.getByTestId('settings-reduced-motion')).toBeTruthy();
    expect(view.getByTestId('settings-reset-best-score')).toBeTruthy();
    expect(view.getByTestId('settings-reset-all')).toBeTruthy();
    expect(view.getByTestId('settings-about')).toBeTruthy();
    expect(view.queryByTestId('settings-account')).toBeNull();
    expect(view.queryByTestId('settings-report-ad')).toBeNull();

    await view.unmount();
  });
});
