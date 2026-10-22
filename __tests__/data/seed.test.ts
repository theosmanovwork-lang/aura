import { createMemoryRepositories } from '../../src/data/memory';
import { CURRENT_USER_ID, seed } from '../../src/data/seed';

describe('demo seed', () => {
  test('has enough demo content', () => {
    expect(seed.users.length).toBeGreaterThanOrEqual(3);
    expect(seed.trends.length).toBeGreaterThanOrEqual(5);
    expect(seed.videos.length).toBeGreaterThanOrEqual(8);
  });

  test('has unique ids and slugs', () => {
    const ids = [...seed.users, ...seed.trends, ...seed.videos].map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(seed.trends.map((t) => t.slug)).size).toBe(seed.trends.length);
  });

  test('every video points to an existing author and trend', () => {
    const userIds = new Set(seed.users.map((u) => u.id));
    const trendIds = new Set(seed.trends.map((t) => t.id));

    for (const video of seed.videos) {
      expect(userIds.has(video.authorId)).toBe(true);
      expect(trendIds.has(video.trendId)).toBe(true);
    }
  });

  test('contains the current user and at least one video that is not published', () => {
    expect(seed.users.some((u) => u.id === CURRENT_USER_ID)).toBe(true);
    expect(seed.videos.some((v) => v.moderationStatus !== 'published')).toBe(true);
  });

  test('loads into memory repositories and hides unpublished videos', async () => {
    const repos = createMemoryRepositories(seed);
    const published = seed.videos.filter((v) => v.moderationStatus === 'published');

    expect(await repos.videos.listPublished()).toHaveLength(published.length);
    expect(await repos.trends.list()).toHaveLength(seed.trends.length);
  });

  test('uses whole-number counters', () => {
    for (const video of seed.videos) {
      expect(Number.isInteger(video.likeCount)).toBe(true);
      expect(Number.isInteger(video.viewCount)).toBe(true);
    }
  });
});
