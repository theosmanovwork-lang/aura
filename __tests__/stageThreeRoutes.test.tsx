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

describe('routes of the last screens', () => {
  test('the reminder card in Community opens the notifications, and a news item opens its lot', async () => {
    await renderRouter(routes);
    await openTab(1);

    await fireEvent.press(await screen.findByTestId('notice-button'));
    expect(await screen.findByText(ru.notifications.readAll)).toBeTruthy();

    await fireEvent.press(screen.getByTestId('notice-n1'));
    expect(await screen.findByTestId('bid-place')).toBeTruthy();
  });

  test('Settings opens the welcome flow and the states sheet', async () => {
    await renderRouter(routes);
    await openTab(4);
    await fireEvent.press(await screen.findByRole('button', { name: ru.screens.profile.settings }));

    await fireEvent.press(await screen.findByRole('button', { name: ru.settings.items.states }));
    expect(await screen.findByTestId('states-skeleton')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: ru.common.back }));
    await fireEvent.press(
      await screen.findByRole('button', { name: ru.settings.items.onboarding }),
    );
    expect(await screen.findByTestId('onboarding-welcome')).toBeTruthy();
  });
});
