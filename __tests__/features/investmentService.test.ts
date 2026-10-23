import { ensureSeeded } from '../../src/data/bootstrap';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { createSqliteRepositories } from '../../src/data/sqlite';
import { migrate } from '../../src/data/sqlite/migrations';
import { createTestDatabase } from '../../src/data/testing/sqljs';
import {
  InsufficientPointsError,
  NotFoundError,
  type Repositories,
} from '../../src/data/repositories';
import { MAX_INVESTMENT_PER_VIDEO } from '../../src/domain/investment';
import { videoPrice } from '../../src/domain/videoPrice';
import {
  investInVideo,
  loadMyInvestments,
  loadVideoMarket,
  SNAPSHOT_EVERY_MS,
  takeFromVideo,
} from '../../src/features/investments/investmentService';
import { ensureWelcomeBonus, WELCOME_BONUS_POINTS } from '../../src/features/wallet/walletService';

const USER = 'user-me';
const VIDEO = 'video-1';
const NOW = Date.UTC(2026, 5, 1);

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
])('investments on %s repositories', (_name, open) => {
  const start = async () => {
    const repos = await open();
    await ensureWelcomeBonus(repos, USER, 0);
    return repos;
  };
  const price = async (repos: Repositories) => videoPrice((await repos.videos.getById(VIDEO))!);

  test('putting Aura in takes it from the balance and opens a position', async () => {
    const repos = await start();

    const result = await investInVideo(repos, {
      userId: USER,
      videoId: VIDEO,
      amount: 100,
      now: NOW,
    });

    expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS - 100);
    expect(result.position.invested).toBe(100);
    expect(result.position.units).toBeCloseTo(100 / (await price(repos)), 10);
    const entry = (await repos.wallet.listByUser(USER)).find((e) => e.kind === 'investment_open');
    expect(entry).toMatchObject({ amount: -100, refId: result.position.id });
  });

  test('putting more in adds to the same position at the current price', async () => {
    const repos = await start();
    const first = await investInVideo(repos, {
      userId: USER,
      videoId: VIDEO,
      amount: 100,
      now: NOW,
    });

    const video = (await repos.videos.getById(VIDEO))!;
    await repos.videos.update(VIDEO, { viewCount: video.viewCount * 2 });
    const second = await investInVideo(repos, {
      userId: USER,
      videoId: VIDEO,
      amount: 100,
      now: NOW + 1,
    });

    expect(second.position.id).toBe(first.position.id);
    expect(second.position.invested).toBe(200);
    expect(second.position.units).toBeLessThan(first.position.units * 2);
    expect(await repos.investments.listByUser(USER)).toHaveLength(1);
  });

  test.each([
    ['below the minimum', 9],
    ['not a whole number', 10.5],
    ['over the cap', MAX_INVESTMENT_PER_VIDEO + 1],
  ])('refuses an amount %s and leaves everything as it was', async (_label, amount) => {
    const repos = await start();

    await expect(
      investInVideo(repos, { userId: USER, videoId: VIDEO, amount, now: NOW }),
    ).rejects.toThrow();

    expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS);
    expect(await repos.investments.listByUser(USER)).toEqual([]);
  });

  test('refuses when the balance is too small and opens nothing', async () => {
    const repos = await open();
    await ensureWelcomeBonus(repos, USER, 0);
    await repos.wallet.append({
      id: 'spend',
      userId: USER,
      amount: -(WELCOME_BONUS_POINTS - 5),
      asset: 'POINTS',
      kind: 'prediction_stake',
      createdAt: 1,
    });

    await expect(
      investInVideo(repos, { userId: USER, videoId: VIDEO, amount: 10, now: NOW }),
    ).rejects.toThrow(InsufficientPointsError);
    expect(await repos.investments.listByUser(USER)).toEqual([]);
  });

  test('refuses an unknown video and a video that is not published', async () => {
    const repos = await start();
    await repos.videos.update('video-2', { moderationStatus: 'pending' });

    await expect(
      investInVideo(repos, { userId: USER, videoId: 'nope', amount: 10, now: NOW }),
    ).rejects.toThrow(NotFoundError);
    await expect(
      investInVideo(repos, { userId: USER, videoId: 'video-2', amount: 10, now: NOW }),
    ).rejects.toThrow(/published/);
  });

  test('two quick taps are handled one after another: the second one meets the cap', async () => {
    const repos = await start();

    const results = await Promise.allSettled([
      investInVideo(repos, { userId: USER, videoId: VIDEO, amount: 300, now: NOW }),
      investInVideo(repos, { userId: USER, videoId: VIDEO, amount: 300, now: NOW }),
    ]);

    expect(results.map((r) => r.status)).toEqual(['fulfilled', 'rejected']);
    expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS - 300);
  });

  test('if saving the position fails the Aura is given back', async () => {
    const repos = await start();
    jest.spyOn(repos.investments, 'add').mockRejectedValueOnce(new Error('disk full'));

    await expect(
      investInVideo(repos, { userId: USER, videoId: VIDEO, amount: 100, now: NOW }),
    ).rejects.toThrow('disk full');

    expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS);
  });

  test('after the price rises you can take more than you put in', async () => {
    const repos = await start();
    await investInVideo(repos, { userId: USER, videoId: VIDEO, amount: 100, now: NOW });
    const video = (await repos.videos.getById(VIDEO))!;
    await repos.videos.update(VIDEO, { viewCount: video.viewCount + 2000 });

    const market = await loadVideoMarket(repos, USER, VIDEO, NOW + 1);
    expect(market.value).toBeGreaterThan(100);
    expect(market.takable).toBeGreaterThan(100);

    const result = await takeFromVideo(repos, {
      userId: USER,
      videoId: VIDEO,
      amount: market.takable,
      now: NOW + 2,
    });

    expect(result.payout).toBe(market.takable);
    expect(result.position.units).toBe(0);
    expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS - 100 + market.takable);
  });

  test('taking part leaves the rest in the position', async () => {
    const repos = await start();
    await investInVideo(repos, { userId: USER, videoId: VIDEO, amount: 100, now: NOW });

    const result = await takeFromVideo(repos, {
      userId: USER,
      videoId: VIDEO,
      amount: 40,
      now: NOW + 1,
    });

    expect(result.position.invested).toBe(60);
    expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS - 100 + 40);
    const closes = (await repos.wallet.listByUser(USER)).filter(
      (e) => e.kind === 'investment_close',
    );
    expect(closes).toHaveLength(1);
    expect(closes[0]).toMatchObject({ amount: 40, refId: result.position.id });
  });

  test('refuses to take more than the position is worth, or from nothing', async () => {
    const repos = await start();
    await expect(
      takeFromVideo(repos, { userId: USER, videoId: VIDEO, amount: 10, now: NOW }),
    ).rejects.toThrow(NotFoundError);
    await investInVideo(repos, { userId: USER, videoId: VIDEO, amount: 100, now: NOW });

    await expect(
      takeFromVideo(repos, { userId: USER, videoId: VIDEO, amount: 101, now: NOW + 1 }),
    ).rejects.toThrow(/worth/);
    expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS - 100);
  });

  test('if crediting the Aura fails the position is put back as it was', async () => {
    const repos = await start();
    const { position } = await investInVideo(repos, {
      userId: USER,
      videoId: VIDEO,
      amount: 100,
      now: NOW,
    });
    jest.spyOn(repos.wallet, 'append').mockRejectedValueOnce(new Error('disk full'));

    await expect(
      takeFromVideo(repos, { userId: USER, videoId: VIDEO, amount: 40, now: NOW + 1 }),
    ).rejects.toThrow('disk full');

    expect(await repos.investments.getById(position.id)).toEqual(position);
  });

  test('the market page shows the price, the position and records a price point at most once an hour', async () => {
    const repos = await start();
    await investInVideo(repos, { userId: USER, videoId: VIDEO, amount: 100, now: NOW });

    const first = await loadVideoMarket(repos, USER, VIDEO, NOW);
    const second = await loadVideoMarket(repos, USER, VIDEO, NOW + 1000);
    const later = await loadVideoMarket(repos, USER, VIDEO, NOW + SNAPSHOT_EVERY_MS + 1);

    expect(first.price).toBe(await price(repos));
    expect(first.position?.invested).toBe(100);
    expect(second.history).toHaveLength(first.history.length);
    expect(later.history).toHaveLength(first.history.length + 1);
    expect(first.history.at(-1)).toEqual({ videoId: VIDEO, at: NOW, price: first.price });
  });

  test('the market page works for a video the user has not put anything into', async () => {
    const repos = await start();

    const market = await loadVideoMarket(repos, USER, VIDEO, NOW);

    expect(market.position).toBeNull();
    expect(market.value).toBe(0);
    expect(market.takable).toBe(0);
    expect(market.balance).toBe(WELCOME_BONUS_POINTS);
    expect(market.related.every((video) => video.id !== VIDEO)).toBe(true);
  });

  test('the market page refuses an unknown video', async () => {
    const repos = await start();

    await expect(loadVideoMarket(repos, USER, 'nope', NOW)).rejects.toThrow(NotFoundError);
  });

  test('my investments show the result of each position, newest first', async () => {
    const repos = await start();
    await investInVideo(repos, { userId: USER, videoId: 'video-1', amount: 100, now: NOW });
    await investInVideo(repos, { userId: USER, videoId: 'video-3', amount: 50, now: NOW + 10 });
    await takeFromVideo(repos, { userId: USER, videoId: 'video-3', amount: 50, now: NOW + 20 });

    const views = await loadMyInvestments(repos, USER);

    expect(views.map((v) => v.investment.videoId)).toEqual(['video-3', 'video-1']);
    const closed = views[0]!;
    expect(closed.open).toBe(false);
    expect(closed.opened).toBe(50);
    expect(closed.taken).toBe(50);
    expect(closed.result).toBe(0);
    const still = views[1]!;
    expect(still.open).toBe(true);
    expect(still.title.length).toBeGreaterThan(0);
  });
});
