import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { ru } from '../src/i18n/ru';
import { routes } from '../test-utils/appRoutes';
import { resetPlayers } from '../test-utils/expoVideoMock';

jest.mock('expo-video', () => jest.requireActual('../test-utils/expoVideoMock'));
jest.mock('../src/data/openRepositories', () => ({
  openRepositories: async () => {
    const { createMemoryRepositories } = jest.requireActual('../src/data/memory');
    const { seed } = jest.requireActual('../src/data/seed');
    return createMemoryRepositories(seed);
  },
}));

beforeEach(resetPlayers);

const tabNames = ['feed', 'community', 'chats', 'cards', 'profile'] as const;
const openTab = async (index: number) =>
  fireEvent.press(
    await screen.findByRole('button', {
      name: `Раздел ${ru.tabs[tabNames[index]!]}, ${index + 1} из 5`,
    }),
  );

describe('routes of the people screens', () => {
  test('a conversation in the Chats tab opens the dialog', async () => {
    await renderRouter(routes);
    await openTab(2);

    await fireEvent.press(await screen.findByTestId('dialog-d1'));

    expect(await screen.findByTestId('trade-offer')).toBeTruthy();
  });

  test('the dialog header opens the profile of the person and the profile opens the clan', async () => {
    await renderRouter(routes);
    await openTab(2);
    await fireEvent.press(await screen.findByTestId('dialog-d1'));

    await fireEvent.press(await screen.findByTestId('dialog-profile'));
    expect(await screen.findByText('@kira')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('person-clan'));
    expect(await screen.findByTestId('clan-chest')).toBeTruthy();
  });

  test('a clan in the Community tab opens the clan page', async () => {
    await renderRouter(routes);
    await openTab(1);

    await fireEvent.press(await screen.findByTestId('clan-clan-neon'));

    expect(await screen.findByTestId('clan-chest')).toBeTruthy();
  });

  test('a player in the Community tab opens that profile', async () => {
    await renderRouter(routes);
    await openTab(1);
    const players = await screen.findAllByTestId(/^player-/);

    await fireEvent.press(players[0]!);

    expect(await screen.findByTestId('person-follow')).toBeTruthy();
  });
});
