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

describe('settings route', () => {
  test('the settings button on the profile opens the settings screen', async () => {
    await renderRouter(routes);
    await fireEvent.press(
      await screen.findByRole('button', { name: `Раздел ${ru.tabs.profile}, 5 из 5` }),
    );

    await fireEvent.press(await screen.findByRole('button', { name: ru.screens.profile.settings }));

    expect(await screen.findByText(ru.settings.soon)).toBeTruthy();
    expect(screen.getByText(ru.settings.items.legal)).toBeTruthy();
  });
});
