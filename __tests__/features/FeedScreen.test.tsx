import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import type { Repositories } from '../../src/data/repositories';
import { seed } from '../../src/data/seed';
import { FeedScreen } from '../../src/features/feed/FeedScreen';
import { formatCount } from '../../src/i18n/plural';
import { ru } from '../../src/i18n/ru';
import { players, resetPlayers } from '../../test-utils/expoVideoMock';

jest.mock('expo-video', () => jest.requireActual('../../test-utils/expoVideoMock'));

const NEWEST = seed.videos.find((v) => v.id === 'video-7')!;
const SECOND = seed.videos.find((v) => v.id === 'video-6')!;

async function renderFeed(repos: Repositories = createMemoryRepositories(seed), focused = true) {
  await render(
    <RepositoriesProvider repositories={repos}>
      <FeedScreen focused={focused} />
    </RepositoriesProvider>,
  );
  await fireEvent(await screen.findByTestId('feed-container'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 700 } },
  });
  return repos;
}

const showSecondVideo = () =>
  fireEvent(screen.getByTestId('feed-list'), 'viewableItemsChanged', {
    viewableItems: [{ index: 1, isViewable: true }],
    changed: [],
  });

beforeEach(resetPlayers);

describe('FeedScreen', () => {
  test('shows the newest video first', async () => {
    await renderFeed();

    expect(await screen.findByText(NEWEST.title)).toBeTruthy();
  });

  test('does not show videos that are not published', async () => {
    await renderFeed();
    await screen.findByText(NEWEST.title);

    expect(screen.queryByText('Робот-уборщик в ритме диско')).toBeNull();
  });

  test('plays only the video that is on screen', async () => {
    await renderFeed();
    await screen.findByText(NEWEST.title);

    expect(screen.getAllByTestId('video-view')).toHaveLength(1);
    expect(players).toHaveLength(1);
    expect(players[0]!.play).toHaveBeenCalled();
  });

  test('loops the video', async () => {
    await renderFeed();
    await screen.findByText(NEWEST.title);

    expect(players[0]!.loop).toBe(true);
  });

  test('counts a view for the video that is shown', async () => {
    const repos = await renderFeed();
    await screen.findByText(NEWEST.title);

    await act(async () => {});
    expect((await repos.videos.getById(NEWEST.id))!.viewCount).toBe(NEWEST.viewCount + 1);
  });

  test('a tap pauses the video and the next tap resumes it', async () => {
    await renderFeed();
    await screen.findByText(NEWEST.title);
    const player = players[0]!;
    player.play.mockClear();

    await fireEvent.press(screen.getByTestId('video-surface'));
    expect(player.pause).toHaveBeenCalled();
    expect(screen.getByLabelText(ru.feed.resume)).toBeTruthy();

    await fireEvent.press(screen.getByTestId('video-surface'));
    expect(player.play).toHaveBeenCalled();
    expect(screen.getByLabelText(ru.feed.pause)).toBeTruthy();
  });

  test('swiping to the next video switches the player and counts its view', async () => {
    const repos = await renderFeed();
    await screen.findByText(NEWEST.title);

    await showSecondVideo();

    expect(await screen.findByText(SECOND.title)).toBeTruthy();
    expect(screen.getAllByTestId('video-view')).toHaveLength(1);
    expect((await repos.videos.getById(SECOND.id))!.viewCount).toBe(SECOND.viewCount + 1);
  });

  test('a paused video starts playing again after swiping away and back', async () => {
    await renderFeed();
    await screen.findByText(NEWEST.title);
    await fireEvent.press(screen.getByTestId('video-surface'));

    await showSecondVideo();
    await fireEvent(screen.getByTestId('feed-list'), 'viewableItemsChanged', {
      viewableItems: [{ index: 0, isViewable: true }],
      changed: [],
    });

    expect(screen.getByLabelText(ru.feed.pause)).toBeTruthy();
  });

  test('shows a message when there are no videos', async () => {
    await render(
      <RepositoriesProvider repositories={createMemoryRepositories()}>
        <FeedScreen />
      </RepositoriesProvider>,
    );

    expect(await screen.findByText(ru.feed.empty)).toBeTruthy();
  });

  test('shows an error with a retry button when loading fails, and recovers', async () => {
    const repos = createMemoryRepositories(seed);
    const listPublished = jest
      .spyOn(repos.videos, 'listPublished')
      .mockRejectedValueOnce(new Error('disk error'));

    await render(
      <RepositoriesProvider repositories={repos}>
        <FeedScreen />
      </RepositoriesProvider>,
    );
    expect(await screen.findByText(ru.feed.error)).toBeTruthy();

    await fireEvent.press(screen.getByText(ru.feed.retry));

    listPublished.mockRestore();
    expect(await screen.findByTestId('feed-container')).toBeTruthy();
    expect(screen.queryByText(ru.feed.error)).toBeNull();
  });

  test('pauses the video while the feed tab is not in focus and resumes when it returns', async () => {
    const repos = createMemoryRepositories(seed);
    const view = (focused: boolean) => (
      <RepositoriesProvider repositories={repos}>
        <FeedScreen focused={focused} />
      </RepositoriesProvider>
    );
    const { rerender } = await render(view(true));
    await fireEvent(await screen.findByTestId('feed-container'), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 700 } },
    });
    await screen.findByText(NEWEST.title);
    const player = players[0]!;
    player.pause.mockClear();
    player.play.mockClear();

    await rerender(view(false));
    expect(player.pause).toHaveBeenCalled();
    expect(screen.getByLabelText(ru.feed.pause)).toBeTruthy();

    await rerender(view(true));
    expect(player.play).toHaveBeenCalled();
  });

  test('the Aura button tells screen readers how many people hold shares of the video', async () => {
    await renderFeed();
    await screen.findByText(NEWEST.title);

    expect(screen.getByLabelText(ru.feed.aura).props.accessibilityValue).toEqual({
      text: formatCount(NEWEST.likeCount),
    });
  });
});
