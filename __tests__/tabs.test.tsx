import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { seed } from '../src/data/seed';
import { ru } from '../src/i18n/ru';
import { FEED_LAYOUT, routes } from '../test-utils/appRoutes';
import { players, resetPlayers } from '../test-utils/expoVideoMock';

jest.mock('expo-video', () => jest.requireActual('../test-utils/expoVideoMock'));
jest.mock('../src/data/openRepositories', () => ({
  openRepositories: async () => {
    const { createMemoryRepositories } = jest.requireActual('../src/data/memory');
    const { seed } = jest.requireActual('../src/data/seed');
    return createMemoryRepositories(seed);
  },
}));

const NEWEST_TITLE = seed.videos.find((v) => v.id === 'video-7')!.title;

const open = async (title: string, position: number) =>
  fireEvent.press(await screen.findByRole('button', { name: `Раздел ${title}, ${position} из 5` }));
const giveFeedASize = async () =>
  fireEvent(await screen.findByTestId('feed-container'), 'layout', FEED_LAYOUT);

beforeEach(resetPlayers);

describe('bottom tabs', () => {
  test('opens the feed first', async () => {
    await renderRouter(routes);
    await giveFeedASize();

    expect(await screen.findByText(NEWEST_TITLE)).toBeTruthy();
  });

  test('switches between all five sections and shows each one', async () => {
    await renderRouter(routes);
    await giveFeedASize();

    const steps = [
      [ru.tabs.community, 2, ru.community.referral.eyebrow],
      [ru.tabs.chats, 3, ru.chats.global],
      [ru.tabs.cards, 4, ru.cards.quests.title],
      [ru.tabs.profile, 5, ru.screens.profile.stats.rank],
      [ru.tabs.feed, 1, NEWEST_TITLE],
    ] as const;
    for (const [title, position, text] of steps) {
      await open(title, position);

      expect(await screen.findByText(text)).toBeTruthy();
    }
  });

  test('the feed video stops while another section is open and plays again on return', async () => {
    await renderRouter(routes);
    await giveFeedASize();
    await screen.findByText(NEWEST_TITLE);
    const player = players[0]!;
    player.pause.mockClear();
    player.play.mockClear();

    await open(ru.tabs.chats, 3);
    await screen.findByText(ru.chats.global);
    expect(player.pause).toHaveBeenCalled();

    await open(ru.tabs.feed, 1);
    expect(player.play).toHaveBeenCalled();
  });

  test('the settings button of the profile opens the settings screen', async () => {
    await renderRouter(routes);
    await open(ru.tabs.profile, 5);

    await fireEvent.press(await screen.findByRole('button', { name: ru.screens.profile.settings }));

    expect(await screen.findByText(ru.settings.soon)).toBeTruthy();
  });

  test('the empty investments tab of the profile leads back to the feed', async () => {
    await renderRouter(routes);
    await giveFeedASize();
    await open(ru.tabs.profile, 5);
    await fireEvent.press(
      await screen.findByRole('tab', { name: ru.screens.profile.tabs.investments }),
    );

    await fireEvent.press(await screen.findByTestId('profile-empty-action'));

    expect(await screen.findByText(NEWEST_TITLE)).toBeTruthy();
  });
});
