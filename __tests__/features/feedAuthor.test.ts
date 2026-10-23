import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { loadFeed } from '../../src/features/feed/feedService';

const USER = 'user-me';

describe('feed items carry the author name', () => {
  test('each item has the nickname of the video author', async () => {
    const repos = createMemoryRepositories(seed);

    const feed = await loadFeed(repos, USER);

    for (const item of feed) {
      const author = seed.users.find((u) => u.id === item.video.authorId);
      expect(item.authorName).toBe(author?.nickname);
    }
    expect(feed.every((item) => item.authorName.length > 0)).toBe(true);
  });

  test('an author that is not in storage gives an empty name instead of an error', async () => {
    const repos = createMemoryRepositories({ ...seed, users: [] });

    const feed = await loadFeed(repos, USER);

    expect(feed.length).toBeGreaterThan(0);
    expect(feed.every((item) => item.authorName === '')).toBe(true);
  });

  test('a failing author lookup does not blank the feed', async () => {
    const repos = createMemoryRepositories(seed);
    jest.spyOn(repos.users, 'getById').mockRejectedValue(new Error('storage error'));

    const feed = await loadFeed(repos, USER);

    expect(feed.length).toBeGreaterThan(0);
    expect(feed.every((item) => item.authorName === '')).toBe(true);
  });
});

describe('feed items carry the comment count', () => {
  test('counts the comments of each video, 0 when there are none', async () => {
    const repos = createMemoryRepositories(seed);

    const feed = await loadFeed(repos, USER);

    expect(feed.find((i) => i.video.id === 'video-1')?.commentCount).toBe(3);
    expect(feed.find((i) => i.video.id === 'video-2')?.commentCount).toBe(0);
  });

  test('a failing counter does not blank the feed', async () => {
    const repos = createMemoryRepositories(seed);
    jest.spyOn(repos.comments, 'countByVideo').mockRejectedValue(new Error('disk'));

    const feed = await loadFeed(repos, USER);

    expect(feed.length).toBeGreaterThan(0);
    expect(feed.every((item) => item.commentCount === 0)).toBe(true);
  });
});
