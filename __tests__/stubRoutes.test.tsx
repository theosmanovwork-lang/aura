import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import TabsLayout from '../app/(tabs)/_layout';
import HubTab from '../app/(tabs)/hub';
import FeedScreen from '../app/(tabs)/index';
import ProfileScreen from '../app/(tabs)/profile';
import TrendsScreen from '../app/(tabs)/trends';
import WalletScreen from '../app/(tabs)/wallet';
import RootLayout from '../app/_layout';
import CardsRoute from '../app/cards';
import ChatsRoute from '../app/chats';
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
  '(tabs)/hub': HubTab,
  '(tabs)/wallet': WalletScreen,
  '(tabs)/profile': ProfileScreen,
  chats: ChatsRoute,
  cards: CardsRoute,
};

beforeEach(resetPlayers);

async function openHub() {
  await renderRouter(routes);
  await fireEvent.press(
    await screen.findByRole('button', { name: `Раздел ${ru.tabs.hub}, 3 из 5` }),
  );
}

describe('Chats and Cards stubs', () => {
  test('the Chats tile in the Hub opens a screen saying it comes later', async () => {
    await openHub();

    await fireEvent.press(await screen.findByTestId('hub-chats'));

    expect(await screen.findByText(ru.stubs.chats.subtitle)).toBeTruthy();
  });

  test('the Cards tile in the Hub opens a screen saying it comes later', async () => {
    await openHub();

    await fireEvent.press(await screen.findByTestId('hub-cards'));

    expect(await screen.findByText(ru.stubs.cards.subtitle)).toBeTruthy();
  });
});
