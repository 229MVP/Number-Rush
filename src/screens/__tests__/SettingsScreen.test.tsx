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
