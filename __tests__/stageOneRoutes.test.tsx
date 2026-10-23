import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { demoLots } from '../src/data/seed/demoCommunity';
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

const openTab = async (index: number) =>
  fireEvent.press(
    await screen.findByRole('button', {
      name: `Раздел ${ru.tabs[tabNames[index]!]}, ${index + 1} из 5`,
    }),
  );
const tabNames = ['feed', 'community', 'chats', 'cards', 'profile'] as const;

describe('routes of the shop screens', () => {
  test('«Пополнить» on the Cards tab opens the top-up screen and back returns', async () => {
    await renderRouter(routes);
    await openTab(3);

    await fireEvent.press(await screen.findByTestId('top-up'));
    expect(await screen.findByText(ru.topup.title)).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: ru.common.back }));
    expect(await screen.findByTestId('balance-card')).toBeTruthy();
  });

  test('the chests button on the Cards tab opens the chest', async () => {
    await renderRouter(routes);
    await openTab(3);

    await fireEvent.press(await screen.findByTestId('open-chests'));

    expect(await screen.findByTestId('chest-closed')).toBeTruthy();
  });

  test('a lot in the Community tab opens its page', async () => {
    await renderRouter(routes);
    await openTab(1);

    await fireEvent.press(await screen.findByTestId('lot-lot-1'));

    expect(await screen.findByText(ru.lot.title.replace('{no}', demoLots[0]!.no))).toBeTruthy();
  });
});
