import { createMemoryRepositories } from '../../src/data/memory';
import { CURRENT_USER_ID, createSeed, seed } from '../../src/data/seed';
import { calcTrendScore } from '../../src/domain/trendScore';

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

  test('has a growth history for every trend that ends at its current score', () => {
    for (const trend of seed.trends) {
      const history = seed.snapshots.filter((s) => s.trendId === trend.id);
      const current = calcTrendScore(seed.videos.filter((v) => v.trendId === trend.id));

      expect(history.length).toBeGreaterThanOrEqual(7);
      expect(history.map((s) => s.at)).toEqual([...history.map((s) => s.at)].sort((a, b) => a - b));
      expect(history.at(-1)?.score).toBe(current);
      expect(history.every((s) => Number.isInteger(s.score) && s.score > 0)).toBe(true);
    }
  });

  test('createSeed puts the end of every history at the given moment, one point per day', () => {
    const now = Date.UTC(2030, 5, 15, 12);
    const fresh = createSeed(now);

    for (const trend of fresh.trends) {
      const history = fresh.snapshots.filter((s) => s.trendId === trend.id);
      expect(history.at(-1)?.at).toBe(now);
      history.slice(1).forEach((point, i) => {
        expect(point.at - history[i]!.at).toBe(24 * 60 * 60 * 1000);
      });
    }
  });
});
