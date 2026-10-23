import { fireEvent, render, screen } from '@testing-library/react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { FeedScreen } from '../../src/features/feed/FeedScreen';
import { ru } from '../../src/i18n/ru';
import { resetPlayers } from '../../test-utils/expoVideoMock';

jest.mock('expo-video', () => jest.requireActual('../../test-utils/expoVideoMock'));

const NEWEST = seed.videos.find((v) => v.id === 'video-7')!;

async function renderFeed() {
  const repos = createMemoryRepositories(seed);
  await render(
    <RepositoriesProvider repositories={repos}>
      <FeedScreen />
    </RepositoriesProvider>,
  );
  await fireEvent(await screen.findByTestId('feed-container'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 700 } },
  });
  await screen.findByTestId('like-button');
  return repos;
}

beforeEach(resetPlayers);

describe('feed without chips, sound line and view counter', () => {
  test('no «Создано ИИ» and no age rating are drawn', async () => {
    await renderFeed();

    expect(screen.queryByTestId('chip-ai')).toBeNull();
    expect(screen.queryByTestId('chip-age')).toBeNull();
    expect(screen.queryByText(NEWEST.ageRating)).toBeNull();
  });

  test('no sound line is drawn', async () => {
    await renderFeed();

    expect(screen.queryByText(/звук/i)).toBeNull();
  });

  test('the view counter is not shown, but the view is still counted', async () => {
    const repos = await renderFeed();

    expect(screen.queryByTestId('views-indicator')).toBeNull();
    await screen.findByText(NEWEST.title);
    expect((await repos.videos.getById(NEWEST.id))!.viewCount).toBe(NEWEST.viewCount + 1);
  });

  test('under the Aura mark and the comments: repost, then share, switched off', async () => {
    await renderFeed();

    const rail = screen.getByTestId('soon-rail');
    const order = (rail.props.children as { props: { testID: string } }[]).map(
      (child) => child.props.testID,
    );
    expect(order).toEqual(['soon-repost', 'soon-share']);
    for (const label of [ru.feed.soon.repost, ru.feed.soon.share]) {
      expect(screen.getByRole('button', { name: label }).props.accessibilityState.disabled).toBe(
        true,
      );
    }
  });
});
