import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { seed } from '../src/data/seed';
import { players, resetPlayers } from '../test-utils/expoVideoMock';

import RootLayout from '../app/_layout';
import TabsLayout from '../app/(tabs)/_layout';
import FeedScreen from '../app/(tabs)/index';
import ProfileScreen from '../app/(tabs)/profile';
import TrendsScreen from '../app/(tabs)/trends';
import WalletScreen from '../app/(tabs)/wallet';
import { ru } from '../src/i18n/ru';

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
};

const getTabs = () => screen.findAllByRole('button', { name: /, tab, \d of \d$/ });
const labelOf = (tab: { props: { accessibilityLabel?: string } }) =>
  String(tab.props.accessibilityLabel ?? '');

beforeEach(resetPlayers);

/** A phone tells the feed how big the screen is; tests have to do that by hand. */
const giveFeedASize = async () =>
  fireEvent(await screen.findByTestId('feed-container'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 700 } },
  });

const NEWEST_TITLE = seed.videos.find((v) => v.id === 'video-7')!.title;

describe('bottom tabs', () => {
  test('shows four tabs with Russian names from ru.ts', async () => {
    await renderRouter(routes);

    const names = (await getTabs()).map(labelOf);
    expect(names).toHaveLength(4);
    for (const label of Object.values(ru.tabs)) {
      expect(names.some((name) => name.startsWith(`${label},`))).toBe(true);
    }
  });

  test('opens the feed first', async () => {
    await renderRouter(routes);
    await giveFeedASize();

    expect(await screen.findByText(NEWEST_TITLE)).toBeTruthy();
  });

  test('switches between all tabs and shows each placeholder', async () => {
    await renderRouter(routes);
    await giveFeedASize();

    const steps = [
      [ru.tabs.trends, ru.screens.trends.subtitle],
      [ru.tabs.wallet, ru.screens.wallet.subtitle],
      [ru.tabs.profile, ru.screens.profile.subtitle],
      [ru.tabs.feed, NEWEST_TITLE],
    ];
    for (const [tabLabel, subtitle] of steps) {
      const tab = (await getTabs()).find((t) => labelOf(t).startsWith(`${tabLabel},`));
      expect(tab).toBeDefined();
      await fireEvent.press(tab!);

      expect(await screen.findByText(subtitle)).toBeTruthy();
    }
  });

  test('the feed video stops while another tab is open and plays again on return', async () => {
    await renderRouter(routes);
    await giveFeedASize();
    await screen.findByText(NEWEST_TITLE);
    const player = players[0]!;
    player.pause.mockClear();
    player.play.mockClear();

    const find = async (label: string) =>
      (await getTabs()).find((t) => labelOf(t).startsWith(`${label},`))!;
    await fireEvent.press(await find(ru.tabs.trends));
    await screen.findByText(ru.screens.trends.subtitle);
    expect(player.pause).toHaveBeenCalled();

    await fireEvent.press(await find(ru.tabs.feed));
    expect(player.play).toHaveBeenCalled();
  });
});
