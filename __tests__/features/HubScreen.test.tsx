import { fireEvent, render, screen } from '@testing-library/react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { rankVideos } from '../../src/domain/ratings';
import { HubScreen } from '../../src/features/hub/HubScreen';
import { loadRatings } from '../../src/features/hub/hubService';
import { ru } from '../../src/i18n/ru';

const renderHub = async (repos = createMemoryRepositories(seed), onOpenVideo = jest.fn()) => {
  await render(
    <RepositoriesProvider repositories={repos}>
      <HubScreen onOpenVideo={onOpenVideo} />
    </RepositoriesProvider>,
  );
  return { repos, onOpenVideo };
};

describe('loadRatings', () => {
  test('lists the best videos first, with author nicknames', async () => {
    const repos = createMemoryRepositories(seed);

    const { videos, authors } = await loadRatings(repos);

    expect(videos[0]?.video.id).toBe(rankVideos(seed.videos)[0]?.video.id);
    expect(videos.every((row) => row.authorName.length > 0)).toBe(true);
    expect(authors.every((row) => row.name.length > 0)).toBe(true);
  });

  test('a failing nickname lookup leaves the name empty instead of failing', async () => {
    const repos = createMemoryRepositories(seed);
    jest.spyOn(repos.users, 'getById').mockRejectedValue(new Error('disk'));

    const { videos } = await loadRatings(repos);

    expect(videos.length).toBeGreaterThan(0);
    expect(videos.every((row) => row.authorName === '')).toBe(true);
  });
});

describe('HubScreen', () => {
  test('shows the video rating first and opens a video on tap', async () => {
    const { onOpenVideo } = await renderHub();
    const best = rankVideos(seed.videos)[0]!.video;

    await fireEvent.press(await screen.findByTestId(`hub-video-${best.id}`));

    expect(onOpenVideo).toHaveBeenCalledWith(best.id);
  });

  test('switches to the author rating', async () => {
    await renderHub();
    await screen.findByText(ru.hub.title);

    await fireEvent.press(screen.getByTestId('hub-chip-authors'));

    expect(await screen.findByTestId('hub-author-user-lis')).toBeTruthy();
    expect(screen.queryByTestId(`hub-video-${seed.videos[0]!.id}`)).toBeNull();
  });

  test('does not list the unpublished video', async () => {
    await renderHub();
    await screen.findByText(ru.hub.title);

    expect(screen.queryByTestId('hub-video-video-8')).toBeNull();
  });

  test('says so when there are no videos', async () => {
    await renderHub(createMemoryRepositories({ ...seed, videos: [] }));

    expect(await screen.findByText(ru.hub.empty)).toBeTruthy();
  });

  test('a failed load shows an error with a retry button', async () => {
    const repos = createMemoryRepositories(seed);
    jest.spyOn(repos.videos, 'listPublished').mockRejectedValueOnce(new Error('disk'));
    await renderHub(repos);

    expect(await screen.findByText(ru.hub.error)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: ru.hub.retry }));
    expect(await screen.findByText(ru.hub.title)).toBeTruthy();
  });
});
