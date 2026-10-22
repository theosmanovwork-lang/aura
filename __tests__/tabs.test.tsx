import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import RootLayout from '../app/_layout';
import TabsLayout from '../app/(tabs)/_layout';
import FeedScreen from '../app/(tabs)/index';
import ProfileScreen from '../app/(tabs)/profile';
import TrendsScreen from '../app/(tabs)/trends';
import WalletScreen from '../app/(tabs)/wallet';
import { ru } from '../src/i18n/ru';

const routes = {
  _layout: RootLayout,
  '(tabs)/_layout': TabsLayout,
  '(tabs)/index': FeedScreen,
  '(tabs)/trends': TrendsScreen,
  '(tabs)/wallet': WalletScreen,
  '(tabs)/profile': ProfileScreen,
};

const getTabs = () => screen.findAllByRole('button', { name: /, tab, \d of \d$/ });
const labelOf = (tab: { props: { accessibilityLabel?: string } }) =>
  String(tab.props.accessibilityLabel ?? '');

describe('bottom tabs', () => {
  test('shows four tabs with Russian names from ru.ts', async () => {
    await renderRouter(routes);

    const names = (await getTabs()).map(labelOf);
    expect(names).toHaveLength(4);
    for (const label of Object.values(ru.tabs)) {
      expect(names.some((name) => name.startsWith(`${label},`))).toBe(true);
    }
  });

  test('opens the feed placeholder first', async () => {
    await renderRouter(routes);

    expect(await screen.findByText(ru.screens.feed.subtitle)).toBeTruthy();
  });

  test('switches between all tabs and shows each placeholder', async () => {
    await renderRouter(routes);

    const steps = [
      [ru.tabs.trends, ru.screens.trends.subtitle],
      [ru.tabs.wallet, ru.screens.wallet.subtitle],
      [ru.tabs.profile, ru.screens.profile.subtitle],
      [ru.tabs.feed, ru.screens.feed.subtitle],
    ];
    for (const [tabLabel, subtitle] of steps) {
      const tab = (await getTabs()).find((t) => labelOf(t).startsWith(`${tabLabel},`));
      expect(tab).toBeDefined();
      await fireEvent.press(tab!);

      expect(await screen.findByText(subtitle)).toBeTruthy();
    }
  });
});
