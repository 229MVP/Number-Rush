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

  it('renders the sellable-template menu and navigates to expected routes', async () => {
    const view = await renderWithProviders(
      <MainMenuScreen navigation={navigation} route={route} />,
      { withNavigation: false },
    );

    await waitFor(() => {
      expect(view.getByTestId('menu-play')).toBeTruthy();
    });

    expect(view.getByTestId('menu-how-to-play')).toBeTruthy();
    expect(view.getByTestId('menu-stats')).toBeTruthy();
    expect(view.getByTestId('menu-settings')).toBeTruthy();
    expect(view.queryByTestId('menu-daily')).toBeNull();
    expect(view.queryByTestId('menu-ranked')).toBeNull();
    expect(view.queryByTestId('menu-shop')).toBeNull();

    fireEvent.press(view.getByTestId('menu-play'));
    expect(navigation.navigate).toHaveBeenCalledWith('Gameplay', {
      mode: 'classic',
    });

    fireEvent.press(view.getByTestId('menu-how-to-play'));
    expect(navigation.navigate).toHaveBeenCalledWith('HowToPlay');

    fireEvent.press(view.getByTestId('menu-stats'));
    expect(navigation.navigate).toHaveBeenCalledWith('Stats');

    fireEvent.press(view.getByTestId('menu-settings'));
    expect(navigation.navigate).toHaveBeenCalledWith('Settings');

    await view.unmount();
  });
});
