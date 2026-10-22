import { ensureSeeded } from '../../src/data/bootstrap';
import { createMemoryRepositories } from '../../src/data/memory';
import { NotFoundError, type Repositories } from '../../src/data/repositories';
import { seed } from '../../src/data/seed';
import { createSqliteRepositories } from '../../src/data/sqlite';
import { migrate } from '../../src/data/sqlite/migrations';
import { createTestDatabase } from '../../src/data/testing/sqljs';
import { calcGrowthPercent, calcTrendScore } from '../../src/domain/trendScore';
import {
  loadTrendBoard,
  loadTrendDetail,
  MIN_SNAPSHOT_INTERVAL_MS,
  refreshSnapshots,
} from '../../src/features/trends/trendService';

const memory = async (): Promise<Repositories> => createMemoryRepositories(seed);
const sqlite = async (): Promise<Repositories> => {
  const db = await createTestDatabase();
  await migrate(db);
  const repos = createSqliteRepositories(db);
  await ensureSeeded(repos, seed);
  return repos;
};

const LONG_AFTER_SEED = Date.UTC(2027, 0, 1);

describe.each([
  ['memory', memory],
  ['sqlite', sqlite],
])('trend service on %s repositories', (_name, open) => {
  test('adds no snapshot when the score has not changed since the last one', async () => {
    const repos = await open();
    const before = (await repos.snapshots.listByTrend('trend-neirokot')).length;

    await refreshSnapshots(repos, LONG_AFTER_SEED);

    expect(await repos.snapshots.listByTrend('trend-neirokot')).toHaveLength(before);
  });

  test('adds a snapshot with the new score after a like changed it', async () => {
    const repos = await open();
    const video = (await repos.videos.getById('video-1'))!;
    await repos.videos.update('video-1', { likeCount: video.likeCount + 1 });

    await refreshSnapshots(repos, LONG_AFTER_SEED);

    const history = await repos.snapshots.listByTrend('trend-neirokot');
    const published = (await repos.videos.listPublished()).filter(
      (v) => v.trendId === 'trend-neirokot',
    );
    expect(history.at(-1)).toEqual({
      trendId: 'trend-neirokot',
      at: LONG_AFTER_SEED,
      score: calcTrendScore(published),
    });
  });

  test('does not add snapshots more often than the minimum interval', async () => {
    const repos = await open();
    await repos.videos.update('video-1', { viewCount: 99999 });
    await refreshSnapshots(repos, LONG_AFTER_SEED);
    await repos.videos.update('video-1', { viewCount: 123456 });

    await refreshSnapshots(repos, LONG_AFTER_SEED + MIN_SNAPSHOT_INTERVAL_MS - 1);
    const tooSoon = (await repos.snapshots.listByTrend('trend-neirokot')).length;
    await refreshSnapshots(repos, LONG_AFTER_SEED + MIN_SNAPSHOT_INTERVAL_MS);
    const later = (await repos.snapshots.listByTrend('trend-neirokot')).length;

    expect(later).toBe(tooSoon + 1);
  });

  test('two overlapping refreshes record only one snapshot and do not fail', async () => {
    const repos = await open();
    await repos.videos.update('video-1', { viewCount: 55555 });
    const before = (await repos.snapshots.listByTrend('trend-neirokot')).length;

    await Promise.all([
      refreshSnapshots(repos, LONG_AFTER_SEED),
      refreshSnapshots(repos, LONG_AFTER_SEED + 1),
      refreshSnapshots(repos, LONG_AFTER_SEED),
    ]);

    expect(await repos.snapshots.listByTrend('trend-neirokot')).toHaveLength(before + 1);
  });

  test('records a first snapshot for a trend that has none', async () => {
    const repos = await open();
    await repos.trends.add({ id: 'trend-new', slug: 'new', name: 'Новая', createdAt: 1 });

    await refreshSnapshots(repos, LONG_AFTER_SEED);

    expect(await repos.snapshots.listByTrend('trend-new')).toEqual([
      { trendId: 'trend-new', at: LONG_AFTER_SEED, score: 0 },
    ]);
  });

  test('the board lists every trend with score, growth, history and video count', async () => {
    const repos = await open();

    const board = await loadTrendBoard(repos, LONG_AFTER_SEED);

    expect(board).toHaveLength(seed.trends.length);
    const kot = board.find((row) => row.trend.id === 'trend-neirokot')!;
    const history = seed.snapshots.filter((s) => s.trendId === 'trend-neirokot');
    expect(kot.score).toBe(history.at(-1)!.score);
    expect(kot.history).toEqual(history.map((s) => s.score));
    expect(kot.growthPercent).toBe(
      Math.round((history.at(-1)!.score / history.at(-2)!.score - 1) * 100 * 10) / 10,
    );
    expect(kot.videoCount).toBe(2);
  });

  test('growth is measured against a day ago, not against the last tiny change', async () => {
    const repos = await open();
    const history = seed.snapshots.filter((s) => s.trendId === 'trend-neirokot');
    const last = history.at(-1)!;
    const dayAgo = history.at(-2)!;
    await repos.snapshots.add({
      trendId: 'trend-neirokot',
      at: last.at + 11 * 60 * 1000,
      score: last.score + 1,
    });

    const board = await loadTrendBoard(repos, last.at + 11 * 60 * 1000);

    const kot = board.find((row) => row.trend.id === 'trend-neirokot')!;
    expect(kot.growthPercent).toBe(calcGrowthPercent(dayAgo.score, last.score + 1));
  });

  test('a young trend (less than a day of history) is compared with its first snapshot', async () => {
    const repos = await open();
    await repos.trends.add({ id: 'trend-new', slug: 'new', name: 'Новая', createdAt: 1 });
    await repos.snapshots.add({ trendId: 'trend-new', at: 1000, score: 100 });
    await repos.snapshots.add({ trendId: 'trend-new', at: 2000, score: 150 });

    const board = await loadTrendBoard(repos, 2000);

    expect(board.find((row) => row.trend.id === 'trend-new')?.growthPercent).toBe(50);
  });

  test('the board puts the fastest growing trend first and unknown growth last', async () => {
    const repos = await open();
    await repos.trends.add({ id: 'trend-new', slug: 'new', name: 'Новая', createdAt: 1 });

    const board = await loadTrendBoard(repos, LONG_AFTER_SEED);

    const growth = board.map((row) => row.growthPercent);
    const known = growth.filter((g): g is number => g !== null);
    expect(known).toEqual([...known].sort((a, b) => b - a));
    expect(board.at(-1)?.trend.id).toBe('trend-new');
    expect(board.at(-1)?.growthPercent).toBeNull();
  });

  test('the board keeps only the most recent history points', async () => {
    const repos = await open();
    for (let i = 0; i < 40; i += 1) {
      await repos.snapshots.add({
        trendId: 'trend-neirokot',
        at: LONG_AFTER_SEED + i,
        score: 1000 + i,
      });
    }

    const board = await loadTrendBoard(repos, LONG_AFTER_SEED + 1);

    const kot = board.find((row) => row.trend.id === 'trend-neirokot')!;
    expect(kot.history.length).toBeLessThanOrEqual(30);
    expect(kot.history.at(-1)).toBe(1039);
  });

  test('the detail has the trend, its published videos newest first and the summary', async () => {
    const repos = await open();

    const detail = await loadTrendDetail(repos, 'trend-roboty', LONG_AFTER_SEED);

    expect(detail.summary.trend.name).toBe('Танец роботов');
    expect(detail.videos.map((v) => v.id)).toEqual(['video-7']);
    expect(detail.summary.videoCount).toBe(1);
  });

  test('the detail of an unknown trend fails', async () => {
    await expect(loadTrendDetail(await open(), 'nope', LONG_AFTER_SEED)).rejects.toThrow(
      NotFoundError,
    );
  });
});
