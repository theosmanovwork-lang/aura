import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import TabsLayout from '../app/(tabs)/_layout';
import FeedScreen from '../app/(tabs)/index';
import ProfileScreen from '../app/(tabs)/profile';
import TrendsScreen from '../app/(tabs)/trends';
import WalletScreen from '../app/(tabs)/wallet';
import RootLayout from '../app/_layout';
import SettingsRoute from '../app/settings';
import TrendDetailRoute from '../app/trend/[id]';
import { ru } from '../src/i18n/ru';
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
  settings: SettingsRoute,
  'trend/[id]': TrendDetailRoute,
};

beforeEach(resetPlayers);

describe('settings route', () => {
  test('the menu button on the profile opens the settings screen', async () => {
    await renderRouter(routes);
    await fireEvent.press(
      await screen.findByRole('button', { name: `Раздел ${ru.tabs.profile}, 4 из 4` }),
    );

    await fireEvent.press(await screen.findByRole('button', { name: ru.screens.profile.menu }));

    expect(await screen.findByText(ru.settings.soon)).toBeTruthy();
    expect(screen.getByText(ru.settings.items.legal)).toBeTruthy();
  });
});
