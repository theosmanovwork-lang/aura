import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { StyleSheet } from 'react-native';

import TabsLayout from '../app/(tabs)/_layout';
import FeedScreen from '../app/(tabs)/index';
import ProfileScreen from '../app/(tabs)/profile';
import TrendsScreen from '../app/(tabs)/trends';
import TrendDetailRoute from '../app/trend/[id]';
import WalletScreen from '../app/(tabs)/wallet';
import RootLayout from '../app/_layout';
import { ru } from '../src/i18n/ru';
import { colors } from '../src/theme';
import { resetPlayers } from '../test-utils/expoVideoMock';

jest.mock('expo-video', () => jest.requireActual('../test-utils/expoVideoMock'));
jest.mock('../src/data/openRepositories', () => ({
  openRepositories: async () => {
    const { createMemoryRepositories } = jest.requireActual('../src/data/memory');
    const { seed } = jest.requireActual('../src/data/seed');
    return createMemoryRepositories(seed);
  },
}));

const routes = {
  _layout: RootLayout,
  '(tabs)/_layout': TabsLayout,
  '(tabs)/index': FeedScreen,
  '(tabs)/trends': TrendsScreen,
  '(tabs)/wallet': WalletScreen,
  '(tabs)/profile': ProfileScreen,
  'trend/[id]': TrendDetailRoute,
};

const colorOf = (testID: string) =>
  StyleSheet.flatten(screen.getByTestId(testID, { hidden: true }).props.style).color;

beforeEach(resetPlayers);

describe('bottom tab bar icons', () => {
  test('every tab has an icon, outlined unless the tab is open', async () => {
    await renderRouter(routes);

    expect(await screen.findByTestId('tab-icon-home', { hidden: true })).toBeTruthy();
    for (const outlined of ['trending-up-outline', 'sparkles-outline', 'person-outline']) {
      expect(screen.getByTestId(`tab-icon-${outlined}`, { hidden: true })).toBeTruthy();
    }
  });

  test('the open tab is gold and the others are the quiet icon color', async () => {
    await renderRouter(routes);
    await screen.findByTestId('tab-icon-home', { hidden: true });

    expect(colorOf('tab-icon-home')).toBe(colors.accent);
    expect(colorOf('tab-icon-sparkles-outline')).toBe(colors.iconInactive);
  });

  test('opening another tab fills its icon and outlines the previous one', async () => {
    await renderRouter(routes);
    const tabs = await screen.findAllByRole('button', { name: /, tab, \d of \d$/ });
    const wallet = tabs.find((t) =>
      String(t.props.accessibilityLabel).startsWith(`${ru.tabs.wallet},`),
    )!;

    await fireEvent.press(wallet);

    expect(await screen.findByTestId('tab-icon-sparkles', { hidden: true })).toBeTruthy();
    expect(screen.getByTestId('tab-icon-home-outline', { hidden: true })).toBeTruthy();
    expect(colorOf('tab-icon-sparkles')).toBe(colors.accent);
  });

  test('the icons are hidden from screen readers, the tab keeps its spoken name', async () => {
    await renderRouter(routes);
    const icon = await screen.findByTestId('tab-icon-home', { hidden: true });

    expect(icon.props.accessibilityElementsHidden).toBe(true);
    const tabs = await screen.findAllByRole('button', { name: /, tab, \d of \d$/ });
    expect(tabs.map((t) => t.props.accessibilityLabel)).toEqual([
      'Лента, tab, 1 of 4',
      'Волны, tab, 2 of 4',
      'Искры, tab, 3 of 4',
      'Профиль, tab, 4 of 4',
    ]);
  });
});
