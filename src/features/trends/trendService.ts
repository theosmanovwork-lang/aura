import type { Repositories } from '../../data/repositories';
import { DuplicateKeyError, NotFoundError } from '../../data/repositories';
import type { Trend } from '../../domain/trend';
import type { TrendSnapshot } from '../../domain/trendSnapshot';
import { calcGrowthPercent, calcTrendScore } from '../../domain/trendScore';
import type { Video } from '../../domain/video';

/** A new snapshot is recorded at most this often per trend, and only if the score changed. */
export const MIN_SNAPSHOT_INTERVAL_MS = 10 * 60 * 1000;
const HISTORY_POINTS = 30;
/** Growth is the change over this long. */
const GROWTH_WINDOW_MS = 24 * 60 * 60 * 1000;

export type TrendSummary = Readonly<{
  trend: Trend;
  score: number;
  growthPercent: number | null;
  history: readonly number[];
  videoCount: number;
}>;

const videosOf = (published: readonly Video[], trendId: string) =>
  published.filter((video) => video.trendId === trendId);

const refreshing = new WeakMap<Repositories, Promise<void>>();

/**
 * Records the current score of every trend when it changed since the last snapshot.
 * Overlapping calls (two screens opening together) share one run.
 */
export function refreshSnapshots(repos: Repositories, now: number): Promise<void> {
  const running = refreshing.get(repos);
  if (running) return running;

  const run = refreshNow(repos, now).finally(() => refreshing.delete(repos));
  refreshing.set(repos, run);
  return run;
}

async function refreshNow(repos: Repositories, now: number): Promise<void> {
  const [trends, published] = await Promise.all([
    repos.trends.list(),
    repos.videos.listPublished(),
  ]);
  for (const trend of trends) {
    const score = calcTrendScore(videosOf(published, trend.id));
    const last = (await repos.snapshots.listByTrend(trend.id)).at(-1);
    const due = !last || (score !== last.score && now - last.at >= MIN_SNAPSHOT_INTERVAL_MS);
    if (!due) continue;
    try {
      await repos.snapshots.add({ trendId: trend.id, at: now, score });
    } catch (error) {
      // Another start recorded this very moment first: that is just as good.
      if (!(error instanceof DuplicateKeyError)) throw error;
    }
  }
}

function summarize(
  trend: Trend,
  snapshots: readonly TrendSnapshot[],
  videoCount: number,
): TrendSummary {
  const last = snapshots.at(-1);
  // Compare with the newest snapshot that is at least a day old; a young trend uses its first one.
  const baseline = last
    ? ([...snapshots].reverse().find((snapshot) => snapshot.at <= last.at - GROWTH_WINDOW_MS) ??
      snapshots[0])
    : undefined;
  return {
    trend,
    score: last?.score ?? 0,
    growthPercent:
      last && baseline && baseline !== last ? calcGrowthPercent(baseline.score, last.score) : null,
    history: snapshots.slice(-HISTORY_POINTS).map((snapshot) => snapshot.score),
    videoCount,
  };
}

const byGrowth = (a: TrendSummary, b: TrendSummary): number => {
  if (a.growthPercent === null && b.growthPercent === null) return b.score - a.score;
  if (a.growthPercent === null) return 1;
  if (b.growthPercent === null) return -1;
  return b.growthPercent - a.growthPercent || b.score - a.score;
};

/** Every trend with its score, growth and history, fastest growing first. */
export async function loadTrendBoard(repos: Repositories, now: number): Promise<TrendSummary[]> {
  await refreshSnapshots(repos, now);
  const [trends, published] = await Promise.all([
    repos.trends.list(),
    repos.videos.listPublished(),
  ]);
  const summaries = await Promise.all(
    trends.map(async (trend) =>
      summarize(
        trend,
        await repos.snapshots.listByTrend(trend.id),
        videosOf(published, trend.id).length,
      ),
    ),
  );
  return summaries.sort(byGrowth);
}

/** One trend with its published videos, newest first. */
export async function loadTrendDetail(
  repos: Repositories,
  trendId: string,
  now: number,
): Promise<{ summary: TrendSummary; videos: Video[] }> {
  const trend = await repos.trends.getById(trendId);
  if (!trend) throw new NotFoundError('trends', trendId);

  await refreshSnapshots(repos, now);
  const videos = videosOf(await repos.videos.listPublished(), trendId);
  const summary = summarize(trend, await repos.snapshots.listByTrend(trendId), videos.length);
  return { summary, videos };
}
