import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { SplashScreen } from '../SplashScreen';
import { renderWithProviders } from '../../test/renderWithProviders';

describe('SplashScreen', () => {
  const navigation = {
    navigate: jest.fn(),
    replace: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  } as any;

  const route = { key: 'splash', name: 'Splash', params: undefined } as any;

  beforeEach(() => {
    navigation.replace.mockClear();
    navigation.navigate.mockClear();
  });

  it('shows tap to start and navigates once on press', async () => {
    const view = await renderWithProviders(
      <SplashScreen navigation={navigation} route={route} />,
      { withNavigation: false },
    );

    expect(view.getByText('TAP TO START')).toBeTruthy();
    expect(view.getByTestId('splash-start')).toBeTruthy();

    fireEvent.press(view.getByTestId('splash-start'));
    expect(navigation.replace).toHaveBeenCalledTimes(1);
    expect(navigation.replace).toHaveBeenCalledWith('MainMenu');

    fireEvent.press(view.getByTestId('splash-start'));
    expect(navigation.replace).toHaveBeenCalledTimes(1);

    await view.unmount();
  });
});
