import type { Repositories } from '../../data/repositories';
import { NotFoundError } from '../../data/repositories';
import {
  addToPosition,
  openPosition,
  positionValue,
  takableAmount,
  takeFromPosition,
  type Investment,
} from '../../domain/investment';
import { createLedgerEntry } from '../../domain/ledger';
import type { Video } from '../../domain/video';
import { videoPrice, type VideoSnapshot } from '../../domain/videoPrice';
import { runInOrder } from '../runInOrder';

/** A new price point is recorded when the market page is opened, at most this often. */
export const SNAPSHOT_EVERY_MS = 60 * 60 * 1000;

const RELATED_LIMIT = 6;

const positionIdOf = (userId: string, videoId: string) => `position-${userId}-${videoId}`;
const roundTo = (value: number, places: number): number => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

async function publishedVideo(repos: Repositories, videoId: string): Promise<Video> {
  const video = await repos.videos.getById(videoId);
  if (!video) throw new NotFoundError('videos', videoId);
  if (video.moderationStatus !== 'published') throw new Error('video is not published');
  return video;
}

/** A ledger entry id that is new every time, even when two moves happen in the same millisecond. */
async function nextEntryId(
  repos: Repositories,
  userId: string,
  positionId: string,
  label: string,
): Promise<string> {
  const used = (await repos.wallet.listByUser(userId)).filter((e) => e.refId === positionId);
  return `${label}-${positionId}-${used.length + 1}`;
}

export type InvestInput = Readonly<{
  userId: string;
  videoId: string;
  amount: number;
  now: number;
}>;
export type InvestResult = Readonly<{ position: Investment; price: number }>;

async function investNow(repos: Repositories, input: InvestInput): Promise<InvestResult> {
  const { userId, videoId, amount, now } = input;
  const video = await publishedVideo(repos, videoId);
  const price = videoPrice(video);
  const existing = await repos.investments.getByUserAndVideo(userId, videoId);
  const position = existing
    ? addToPosition(existing, { amount, price, now })
    : openPosition({ id: positionIdOf(userId, videoId), userId, videoId, amount, price, now });

  // Take the Aura first: the ledger refuses it if the balance is too small.
  const entryId = await nextEntryId(repos, userId, position.id, 'invest');
  await repos.wallet.append(
    createLedgerEntry({
      id: entryId,
      userId,
      amount: -amount,
      kind: 'investment_open',
      refId: position.id,
      createdAt: now,
    }),
  );
  try {
    const saved = existing
      ? await repos.investments.update(position.id, {
          invested: position.invested,
          units: position.units,
          updatedAt: position.updatedAt,
        })
      : await repos.investments.add(position);
    return { position: saved, price };
  } catch (error) {
    // Give the Aura back so the ledger and the position never disagree.
    try {
      await repos.wallet.append(
        createLedgerEntry({
          id: `refund-${entryId}`,
          userId,
          amount,
          kind: 'investment_close',
          refId: position.id,
          createdAt: now,
        }),
      );
    } catch {
      // Nothing more can be done here; the original error is the useful one to report.
    }
    throw error;
  }
}

/** Puts Aura into a video. Taps on the same video by the same user are handled one at a time. */
export function investInVideo(repos: Repositories, input: InvestInput): Promise<InvestResult> {
  return runInOrder(`invest:${input.userId}:${input.videoId}`, () => investNow(repos, input));
}

export type TakeInput = InvestInput;
export type TakeResult = Readonly<{ position: Investment; payout: number; price: number }>;

async function takeNow(repos: Repositories, input: TakeInput): Promise<TakeResult> {
  const { userId, videoId, amount, now } = input;
  const before = await repos.investments.getByUserAndVideo(userId, videoId);
  if (!before) throw new NotFoundError('investments', positionIdOf(userId, videoId));
  const video = await repos.videos.getById(videoId);
  if (!video) throw new NotFoundError('videos', videoId);
  const price = videoPrice(video);
  const { position, payout } = takeFromPosition(before, { amount, price, now });

  // Change the position first, then pay: a failure then never creates Aura out of nothing.
  const saved = await repos.investments.update(position.id, {
    invested: position.invested,
    units: position.units,
    updatedAt: position.updatedAt,
  });
  try {
    await repos.wallet.append(
      createLedgerEntry({
        id: await nextEntryId(repos, userId, position.id, 'take'),
        userId,
        amount: payout,
        kind: 'investment_close',
        refId: position.id,
        createdAt: now,
      }),
    );
  } catch (error) {
    await repos.investments
      .update(before.id, {
        invested: before.invested,
        units: before.units,
        updatedAt: before.updatedAt,
      })
      .catch(() => undefined);
    throw error;
  }
  return { position: saved, payout, price };
}

/** Takes Aura back out of a video at the current price, one move at a time per video. */
export function takeFromVideo(repos: Repositories, input: TakeInput): Promise<TakeResult> {
  return runInOrder(`invest:${input.userId}:${input.videoId}`, () => takeNow(repos, input));
}

export type VideoMarket = Readonly<{
  video: Video;
  price: number;
  history: readonly VideoSnapshot[];
  position: Investment | null;
  /** What the position is worth now (a fraction is possible); 0 without a position. */
  value: number;
  /** The most that can be taken out now, a whole number. */
  takable: number;
  balance: number;
  related: readonly Video[];
}>;

async function recordPriceIfDue(
  repos: Repositories,
  videoId: string,
  price: number,
  now: number,
): Promise<VideoSnapshot[]> {
  const history = await repos.videoSnapshots.listByVideo(videoId);
  const last = history.at(-1);
  if (last && now - last.at < SNAPSHOT_EVERY_MS) return history;
  const snapshot = await repos.videoSnapshots.add({ videoId, at: now, price });
  return [...history, snapshot];
}

/** Everything the video page needs: the price, its history, the user's position and the balance. */
export async function loadVideoMarket(
  repos: Repositories,
  userId: string,
  videoId: string,
  now: number,
): Promise<VideoMarket> {
  const video = await repos.videos.getById(videoId);
  if (!video) throw new NotFoundError('videos', videoId);
  const price = videoPrice(video);
  const [history, position, balance, published] = await Promise.all([
    recordPriceIfDue(repos, videoId, price, now),
    repos.investments.getByUserAndVideo(userId, videoId),
    repos.wallet.getBalance(userId),
    repos.videos.listPublished(),
  ]);
  const related = published
    .filter((other) => other.trendId === video.trendId && other.id !== video.id)
    .slice(0, RELATED_LIMIT);
  return {
    video,
    price,
    history,
    position,
    value: position ? positionValue(position, price) : 0,
    takable: position ? takableAmount(position, price) : 0,
    balance,
    related,
  };
}

export type InvestmentView = Readonly<{
  investment: Investment;
  title: string;
  /** True while shares are still held. */
  open: boolean;
  /** Aura put in over time and Aura taken back so far. */
  opened: number;
  taken: number;
  /** Worth now, plus what was taken, minus what was put in; two decimals. */
  result: number;
  /** Result as a share of what was put in; null when nothing was put in. */
  percent: number | null;
}>;

/** The user's positions with their results, most recently moved first. */
export async function loadMyInvestments(
  repos: Repositories,
  userId: string,
): Promise<InvestmentView[]> {
  const [positions, entries] = await Promise.all([
    repos.investments.listByUser(userId),
    repos.wallet.listByUser(userId),
  ]);
  const views = await Promise.all(
    positions.map(async (investment): Promise<InvestmentView> => {
      const video = await repos.videos.getById(investment.videoId);
      const mine = entries.filter((entry) => entry.refId === investment.id);
      const opened = mine.filter((e) => e.amount < 0).reduce((sum, e) => sum - e.amount, 0);
      const taken = mine.filter((e) => e.amount > 0).reduce((sum, e) => sum + e.amount, 0);
      const value = video ? positionValue(investment, videoPrice(video)) : 0;
      const result = roundTo(taken + value - opened, 2);
      return {
        investment,
        title: video?.title ?? '',
        open: investment.units > 0,
        opened,
        taken,
        result,
        percent: opened > 0 ? roundTo((result / opened) * 100, 2) : null,
      };
    }),
  );
  return views.sort((a, b) => b.investment.updatedAt - a.investment.updatedAt);
}
