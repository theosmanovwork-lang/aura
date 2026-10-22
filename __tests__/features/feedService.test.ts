import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { createSqliteRepositories } from '../../src/data/sqlite';
import { migrate } from '../../src/data/sqlite/migrations';
import { ensureSeeded } from '../../src/data/bootstrap';
import { NotFoundError, type Repositories } from '../../src/data/repositories';
import { createTestDatabase } from '../../src/data/testing/sqljs';
import { loadFeed, recordView, toggleLike } from '../../src/features/feed/feedService';

const USER = 'user-me';

const memory = async (): Promise<Repositories> => createMemoryRepositories(seed);
const sqlite = async (): Promise<Repositories> => {
  const db = await createTestDatabase();
  await migrate(db);
  const repos = createSqliteRepositories(db);
  await ensureSeeded(repos, seed);
  return repos;
};

describe.each([
  ['memory', memory],
  ['sqlite', sqlite],
])('feed service on %s repositories', (_name, open) => {
  test('loads only published videos, newest first, with the liked flag', async () => {
    const repos = await open();
    await repos.likes.add({ userId: USER, videoId: 'video-3', createdAt: 1 });

    const feed = await loadFeed(repos, USER);

    const published = seed.videos.filter((v) => v.moderationStatus === 'published');
    expect(feed).toHaveLength(published.length);
    expect(feed[0]?.video.id).toBe('video-7');
    expect(feed.find((item) => item.video.id === 'video-3')?.liked).toBe(true);
    expect(feed.find((item) => item.video.id === 'video-1')?.liked).toBe(false);
  });

  test('liking a video saves the like and raises the counter by one', async () => {
    const repos = await open();
    const before = (await repos.videos.getById('video-1'))!.likeCount;

    const result = await toggleLike(repos, USER, 'video-1', 100);

    expect(result).toEqual({ liked: true, likeCount: before + 1 });
    expect(await repos.likes.has(USER, 'video-1')).toBe(true);
    expect((await repos.videos.getById('video-1'))!.likeCount).toBe(before + 1);
  });

  test('liking again removes the like and restores the counter', async () => {
    const repos = await open();
    const before = (await repos.videos.getById('video-1'))!.likeCount;

    await toggleLike(repos, USER, 'video-1', 100);
    const result = await toggleLike(repos, USER, 'video-1', 200);

    expect(result).toEqual({ liked: false, likeCount: before });
    expect(await repos.likes.has(USER, 'video-1')).toBe(false);
  });

  test('the counter never goes below zero', async () => {
    const repos = await open();
    await repos.videos.update('video-1', { likeCount: 0 });
    await repos.likes.add({ userId: USER, videoId: 'video-1', createdAt: 1 });

    const result = await toggleLike(repos, USER, 'video-1', 100);

    expect(result.likeCount).toBe(0);
  });

  test('two simultaneous taps are handled one after the other (no error, no drift)', async () => {
    const repos = await open();
    const before = (await repos.videos.getById('video-1'))!.likeCount;

    const [first, second] = await Promise.all([
      toggleLike(repos, USER, 'video-1', 1),
      toggleLike(repos, USER, 'video-1', 2),
    ]);

    expect(first).toEqual({ liked: true, likeCount: before + 1 });
    expect(second).toEqual({ liked: false, likeCount: before });
    expect(await repos.likes.has(USER, 'video-1')).toBe(false);
    expect((await repos.videos.getById('video-1'))!.likeCount).toBe(before);
  });

  test('a failed counter update undoes the like instead of leaving them out of step', async () => {
    const repos = await open();
    jest.spyOn(repos.videos, 'update').mockRejectedValueOnce(new Error('disk full'));

    await expect(toggleLike(repos, USER, 'video-1', 1)).rejects.toThrow('disk full');

    expect(await repos.likes.has(USER, 'video-1')).toBe(false);
  });

  test('a failed counter update also restores a like that was being removed', async () => {
    const repos = await open();
    await repos.likes.add({ userId: USER, videoId: 'video-1', createdAt: 1 });
    jest.spyOn(repos.videos, 'update').mockRejectedValueOnce(new Error('disk full'));

    await expect(toggleLike(repos, USER, 'video-1', 2)).rejects.toThrow('disk full');

    expect(await repos.likes.has(USER, 'video-1')).toBe(true);
  });

  test('liking an unknown video fails', async () => {
    const repos = await open();

    await expect(toggleLike(repos, USER, 'nope', 1)).rejects.toThrow(NotFoundError);
    expect(await repos.likes.has(USER, 'nope')).toBe(false);
  });

  test('recording a view raises the view counter by one', async () => {
    const repos = await open();
    const before = (await repos.videos.getById('video-2'))!.viewCount;

    expect(await recordView(repos, 'video-2')).toBe(before + 1);
    expect((await repos.videos.getById('video-2'))!.viewCount).toBe(before + 1);
  });

  test('recording a view of an unknown video fails', async () => {
    await expect(recordView(await open(), 'nope')).rejects.toThrow(NotFoundError);
  });
});
