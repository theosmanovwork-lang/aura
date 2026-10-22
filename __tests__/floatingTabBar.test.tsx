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
import { MIN_TOUCH_TARGET, radii, TAB_BAR_HEIGHT } from '../src/theme';
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

const styleOf = (testID: string) =>
  StyleSheet.flatten(screen.getByTestId(testID, { hidden: true }).props.style);

beforeEach(resetPlayers);

describe('floating tab bar', () => {
  test('the four tabs sit inside one rounded pill', async () => {
    await renderRouter(routes);
    const pill = await screen.findByTestId('tab-pill', { hidden: true });

    expect(pill.props.accessibilityRole).toBe('tablist');
    expect(StyleSheet.flatten(pill.props.style).borderRadius).toBe(radii.pill);
    expect(StyleSheet.flatten(pill.props.style).height).toBe(TAB_BAR_HEIGHT);
  });

  test('only the open tab shows its name', async () => {
    await renderRouter(routes);

    expect(await screen.findByTestId('tab-label-index', { hidden: true })).toBeTruthy();
    expect(screen.queryByTestId('tab-label-wallet', { hidden: true })).toBeNull();
  });

  test('pressing a tab opens it and moves the name there', async () => {
    await renderRouter(routes);
    const wallet = await screen.findByRole('button', { name: `${ru.tabs.wallet}, tab, 3 of 4` });

    await fireEvent.press(wallet);

    expect(await screen.findByTestId('tab-label-wallet', { hidden: true })).toBeTruthy();
    expect(screen.queryByTestId('tab-label-index', { hidden: true })).toBeNull();
  });

  test('the open tab reports itself as selected to screen readers', async () => {
    await renderRouter(routes);
    const feed = await screen.findByRole('button', { name: `${ru.tabs.feed}, tab, 1 of 4` });
    const trends = screen.getByRole('button', { name: `${ru.tabs.trends}, tab, 2 of 4` });

    expect(feed.props.accessibilityState?.selected).toBe(true);
    expect(trends.props.accessibilityState?.selected).toBe(false);
  });

  test('every tab is at least 44 points big', async () => {
    await renderRouter(routes);
    await screen.findByTestId('tab-pill', { hidden: true });

    for (const name of ['index', 'trends', 'wallet', 'profile']) {
      const style = styleOf(`tab-item-${name}`);
      expect(style.minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
      expect(style.minWidth).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });
});
