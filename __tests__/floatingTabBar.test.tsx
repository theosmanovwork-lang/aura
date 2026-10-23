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
import { colors, MIN_TOUCH_TARGET, radii, TAB_BAR_HEIGHT } from '../src/theme';
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

const labelColor = (name: string) => styleOf(`tab-label-${name}`).color;

beforeEach(resetPlayers);

describe('floating tab bar', () => {
  test('the four tabs sit inside one rounded pill', async () => {
    await renderRouter(routes);
    const pill = await screen.findByTestId('tab-pill', { hidden: true });

    expect(pill.props.accessibilityRole).toBe('tablist');
    expect(StyleSheet.flatten(pill.props.style).borderRadius).toBe(radii.pill);
    expect(StyleSheet.flatten(pill.props.style).height).toBe(TAB_BAR_HEIGHT);
  });

  test('every tab shows its name under the icon, open or not', async () => {
    await renderRouter(routes);
    await screen.findByTestId('tab-pill', { hidden: true });

    for (const name of ['index', 'trends', 'wallet', 'profile']) {
      expect(screen.getByTestId(`tab-label-${name}`, { hidden: true })).toBeTruthy();
    }
  });

  test('only the colour tells the open tab: gold-free accent for the open, quiet for the rest', async () => {
    await renderRouter(routes);
    await screen.findByTestId('tab-pill', { hidden: true });

    expect(labelColor('index')).toBe(colors.accent);
    expect(labelColor('wallet')).toBe(colors.iconInactive);
  });

  test('there is no highlight behind the open tab', async () => {
    await renderRouter(routes);
    await screen.findByTestId('tab-pill', { hidden: true });

    for (const name of ['index', 'wallet']) {
      expect(styleOf(`tab-item-${name}`).backgroundColor).toBeUndefined();
    }
  });

  test('pressing a tab opens it and moves the colour there, the names stay', async () => {
    await renderRouter(routes);
    const wallet = await screen.findByRole('button', { name: `Раздел ${ru.tabs.wallet}, 3 из 4` });

    await fireEvent.press(wallet);

    await screen.findByTestId('tab-icon-sparkles', { hidden: true });
    expect(labelColor('wallet')).toBe(colors.accent);
    expect(labelColor('index')).toBe(colors.iconInactive);
    expect(screen.getByTestId('tab-label-index', { hidden: true })).toBeTruthy();
  });

  test('the open tab reports itself as selected to screen readers', async () => {
    await renderRouter(routes);
    const feed = await screen.findByRole('button', { name: `Раздел ${ru.tabs.feed}, 1 из 4` });
    const trends = screen.getByRole('button', { name: `Раздел ${ru.tabs.trends}, 2 из 4` });

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

describe('floating tab bar presses', () => {
  test('pressing the open tab keeps everything as it is', async () => {
    await renderRouter(routes);
    const feed = await screen.findByRole('button', { name: `Раздел ${ru.tabs.feed}, 1 из 4` });

    await fireEvent.press(feed);

    expect(labelColor('index')).toBe(colors.accent);
    expect(labelColor('wallet')).toBe(colors.iconInactive);
  });
});
