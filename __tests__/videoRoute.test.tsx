import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import TabsLayout from '../app/(tabs)/_layout';
import FeedTab from '../app/(tabs)/index';
import ProfileTab from '../app/(tabs)/profile';
import TrendsTab from '../app/(tabs)/trends';
import WalletTab from '../app/(tabs)/wallet';
import RootLayout from '../app/_layout';
import SettingsRoute from '../app/settings';
import TrendDetailRoute from '../app/trend/[id]';
import VideoRoute from '../app/video/[id]';
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
  '(tabs)/index': FeedTab,
  '(tabs)/trends': TrendsTab,
  '(tabs)/wallet': WalletTab,
  '(tabs)/profile': ProfileTab,
  settings: SettingsRoute,
  'trend/[id]': TrendDetailRoute,
  'video/[id]': VideoRoute,
};

beforeEach(resetPlayers);

describe('video page route', () => {
  test('pressing the Aura plate in the feed opens the page of that video', async () => {
    await renderRouter(routes);
    await fireEvent(await screen.findByTestId('feed-container'), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 700 } },
    });

    await fireEvent.press(await screen.findByTestId('aura-plate'));

    expect(await screen.findByTestId('market-price')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Вложить' })).toBeTruthy();
  });

  test('a link straight to a video opens its page', async () => {
    await renderRouter(routes, { initialUrl: '/video/video-1' });

    expect(await screen.findByTestId('market-price')).toBeTruthy();
  });
});
