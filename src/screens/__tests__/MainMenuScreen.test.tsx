import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { MainMenuScreen } from '../MainMenuScreen';
import { renderWithProviders } from '../../test/renderWithProviders';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const React = require('react');
  return {
    ...actual,
    useFocusEffect: (effect: () => void | (() => void)) => {
      React.useEffect(() => effect(), [effect]);
    },
  };
});

jest.mock('../../storage/dailyStorage', () => ({
  hasCompletedOfficialDailyAttempt: jest.fn(async () => false),
}));

jest.mock('../../storage/missionStorage', () => ({
  countClaimableMissions: jest.fn(async () => 0),
}));

jest.mock('../../storage/playerStorage', () => {
  const {
    DEFAULT_PLAYER_PROFILE,
  } = require('../../progression/progressionTypes');
  return {
    getPlayerProfile: jest.fn(async () => ({ ...DEFAULT_PLAYER_PROFILE })),
  };
});

describe('MainMenuScreen', () => {
  const navigation = {
    navigate: jest.fn(),
    replace: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  } as any;

  const route = { key: 'menu', name: 'MainMenu', params: undefined } as any;

  beforeEach(() => {
    navigation.navigate.mockClear();
  });

  it('renders menu actions and navigates to expected routes', async () => {
    const view = await renderWithProviders(
      <MainMenuScreen navigation={navigation} route={route} />,
      { withNavigation: false },
    );

    await waitFor(() => {
      expect(view.getByTestId('menu-play')).toBeTruthy();
    });

    expect(view.getByTestId('menu-daily')).toBeTruthy();
    expect(view.getByTestId('menu-ranked')).toBeTruthy();
    expect(view.getByTestId('menu-shop')).toBeTruthy();
    expect(view.getByTestId('menu-settings')).toBeTruthy();

    fireEvent.press(view.getByTestId('menu-play'));
    expect(navigation.navigate).toHaveBeenCalledWith('Gameplay', {
      mode: 'classic',
    });

    fireEvent.press(view.getByTestId('menu-daily'));
    expect(navigation.navigate).toHaveBeenCalledWith('Tournament');

    fireEvent.press(view.getByTestId('menu-ranked'));
    expect(navigation.navigate).toHaveBeenCalledWith('Ranked');

    fireEvent.press(view.getByTestId('menu-shop'));
    expect(navigation.navigate).toHaveBeenCalledWith('Shop');

    fireEvent.press(view.getByTestId('menu-settings'));
    expect(navigation.navigate).toHaveBeenCalledWith('Settings');

    await view.unmount();
  });
});
