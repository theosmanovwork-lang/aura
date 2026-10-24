import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { videoPrice } from '../../src/domain/videoPrice';
import { FeedScreen } from '../../src/features/feed/FeedScreen';
import { formatPoints } from '../../src/i18n/format';
import { ru } from '../../src/i18n/ru';
import { darkColors } from '../../src/theme';
import { resetPlayers } from '../../test-utils/expoVideoMock';

jest.mock('expo-video', () => jest.requireActual('../../test-utils/expoVideoMock'));

const NEWEST = seed.videos.find((v) => v.id === 'video-7')!;
const AUTHOR = seed.users.find((u) => u.id === NEWEST.authorId)!;

async function renderFeed(onOpenVideo = jest.fn()) {
  const repos = createMemoryRepositories(seed);
  await render(
    <RepositoriesProvider repositories={repos}>
      <FeedScreen onOpenVideo={onOpenVideo} />
    </RepositoriesProvider>,
  );
  await fireEvent(await screen.findByTestId('feed-container'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 700 } },
  });
  await screen.findByTestId('aura-button');
  return { repos, onOpenVideo };
}

beforeEach(resetPlayers);

describe('feed card of the design', () => {
  test('the top has «+», two tabs («Рекомендации» open) and search; all switched off', async () => {
    await renderFeed();

    const bar = screen.getByTestId('feed-top-bar');
    const forYou = screen.getByRole('tab', { name: ru.feed.tabs.forYou });
    expect(forYou.props.accessibilityState.selected).toBe(true);
    expect(bar).toContainElement(forYou);
    for (const label of [ru.feed.soon.add, ru.feed.soon.search, ru.feed.tabs.following]) {
      expect(
        screen.getByRole(label === ru.feed.tabs.following ? 'tab' : 'button', { name: label }).props
          .accessibilityState.disabled,
      ).toBe(true);
    }
  });

  test('bottom left: the pool chip, @author and the description', async () => {
    await renderFeed();

    expect(screen.getByText(AUTHOR.nickname)).toBeTruthy();
    expect(screen.getByText(NEWEST.title)).toBeTruthy();
    // Showing the video counts one view, which moves the price by one.
    expect(await screen.findByText(formatPoints(videoPrice(NEWEST) + 1))).toBeTruthy();
  });

  test('the pool chip opens the page of the video', async () => {
    const { onOpenVideo } = await renderFeed();

    await fireEvent.press(screen.getByTestId('aura-plate'));

    expect(onOpenVideo).toHaveBeenCalledWith(NEWEST.id);
  });

  test('the badge under the avatar follows and unfollows the author', async () => {
    await renderFeed();
    const follow = ru.feed.follow.replace('{name}', AUTHOR.nickname);
    const unfollow = ru.feed.unfollow.replace('{name}', AUTHOR.nickname);

    await fireEvent.press(screen.getByRole('button', { name: follow }));
    expect(screen.getByRole('button', { name: unfollow }).props.accessibilityState.selected).toBe(
      true,
    );

    await fireEvent.press(screen.getByRole('button', { name: unfollow }));
    expect(screen.getByRole('button', { name: follow })).toBeTruthy();
  });

  test('the Aura coin opens the page of the video and shows how many hold shares', async () => {
    const { onOpenVideo } = await renderFeed();
    expect(screen.getByTestId('aura-button').props.accessibilityValue.text).toMatch(/\d/);

    await fireEvent.press(screen.getByTestId('aura-button'));

    expect(onOpenVideo).toHaveBeenCalledWith(NEWEST.id);
  });

  test('the comments button shows the real count and opens the sheet', async () => {
    await renderFeed();
    const button = screen.getByTestId('comments-button');
    expect(button.props.accessibilityValue.text).toMatch(/^\d+$/);

    await fireEvent.press(button);

    expect(await screen.findByTestId('comments-sheet')).toBeTruthy();
  });

  test('a tap on the video pauses it and shows the play sign, a second tap resumes', async () => {
    await renderFeed();

    await fireEvent.press(screen.getByTestId('video-surface'));
    expect(screen.getByTestId('pause-indicator', { hidden: true })).toBeTruthy();

    await fireEvent.press(screen.getByTestId('video-surface'));
    expect(screen.queryByTestId('pause-indicator', { hidden: true })).toBeNull();
  });

  test('no chips for AI or age, no sound line, no view counter; the view is still counted', async () => {
    const { repos } = await renderFeed();

    expect(screen.queryByText(NEWEST.ageRating)).toBeNull();
    expect(screen.queryByText(/звук/i)).toBeNull();
    expect(screen.queryByTestId('views-indicator')).toBeNull();
    await screen.findByText(NEWEST.title);
    expect((await repos.videos.getById(NEWEST.id))!.viewCount).toBe(NEWEST.viewCount + 1);
  });

  test('fades sit over the video at the top and at the bottom and let touches through', async () => {
    await renderFeed();

    for (const id of ['scrim-top', 'scrim-bottom']) {
      expect(screen.getByTestId(id).props.pointerEvents).toBe('none');
    }
  });

  test('the text over the video is white and the feed is dark whatever the phone is set to', async () => {
    await renderFeed();

    expect(StyleSheet.flatten(screen.getByText(NEWEST.title).props.style).color).toBe(
      darkColors.onVideo,
    );
  });

  test('the repost and share buttons are drawn and switched off', async () => {
    await renderFeed();

    for (const label of [ru.feed.soon.repost, ru.feed.soon.share]) {
      expect(screen.getByRole('button', { name: label }).props.accessibilityState.disabled).toBe(
        true,
      );
    }
  });
});
