import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

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

describe('video page route', () => {
  test('pressing the pool chip in the feed opens the page of that video', async () => {
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
