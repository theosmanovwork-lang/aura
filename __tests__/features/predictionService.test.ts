import { ensureSeeded } from '../../src/data/bootstrap';
import { createMemoryRepositories } from '../../src/data/memory';
import {
  InsufficientPointsError,
  NotFoundError,
  type Repositories,
} from '../../src/data/repositories';
import { seed } from '../../src/data/seed';
import { createSqliteRepositories } from '../../src/data/sqlite';
import { migrate } from '../../src/data/sqlite/migrations';
import { createTestDatabase } from '../../src/data/testing/sqljs';
import { createLedgerEntry } from '../../src/domain/ledger';
import { calcTrendScore } from '../../src/domain/trendScore';
import {
  AlreadyPredictedError,
  loadMyPredictions,
  loadPredictionPanel,
  placePrediction,
  PREDICTION_DURATION_MS,
  settleDuePredictions,
} from '../../src/features/predictions/predictionService';
import { ensureWelcomeBonus, WELCOME_BONUS_POINTS } from '../../src/features/wallet/walletService';

const USER = 'user-me';
const WAVE = 'trend-neirokot';
const NOW = 5_000_000;
const DUE = NOW + PREDICTION_DURATION_MS;

const memory = async (): Promise<Repositories> => createMemoryRepositories(seed);
const sqlite = async (): Promise<Repositories> => {
  const db = await createTestDatabase();
  await migrate(db);
  const repos = createSqliteRepositories(db);
  await ensureSeeded(repos, seed);
  return repos;
};

const funded = async (open: () => Promise<Repositories>) => {
  const repos = await open();
  await ensureWelcomeBonus(repos, USER, 0);
  return repos;
};
const waveScore = async (repos: Repositories) =>
  calcTrendScore((await repos.videos.listPublished()).filter((v) => v.trendId === WAVE));
const changeWaveScore = async (repos: Repositories, delta: number) => {
  const video = (await repos.videos.getById('video-1'))!;
  await repos.videos.update('video-1', { viewCount: video.viewCount + delta });
};
const place = (repos: Repositories, stake = 50, trendId = WAVE, now = NOW) =>
  placePrediction(repos, { userId: USER, trendId, stake, now });

describe.each([
  ['memory', memory],
  ['sqlite', sqlite],
])('predictions on %s repositories', (_name, open) => {
  describe('placing a prediction', () => {
    test('opens a prediction at the current score and takes the stake from the balance', async () => {
      const repos = await funded(open);
      const score = await waveScore(repos);

      const prediction = await place(repos);

      expect(prediction).toMatchObject({
        userId: USER,
        trendId: WAVE,
        stake: 50,
        baselineScore: score,
        createdAt: NOW,
        closesAt: DUE,
        status: 'open',
      });
      expect(await repos.predictions.getById(prediction.id)).toEqual(prediction);
      expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS - 50);
      const entries = await repos.wallet.listByUser(USER);
      expect(entries.at(-1)).toMatchObject({
        amount: -50,
        kind: 'prediction_stake',
        refId: prediction.id,
      });
    });

    test.each([0, 5, 12.5])('refuses the stake %p and changes nothing', async (stake) => {
      const repos = await funded(open);

      await expect(place(repos, stake)).rejects.toThrow('stake');

      expect(await repos.predictions.listByUser(USER)).toEqual([]);
      expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS);
    });

    test('refuses a stake bigger than the balance and creates no prediction', async () => {
      const repos = await funded(open);

      await expect(place(repos, WELCOME_BONUS_POINTS + 1)).rejects.toThrow(InsufficientPointsError);

      expect(await repos.predictions.listByUser(USER)).toEqual([]);
      expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS);
    });

    test('allows spending the whole balance', async () => {
      const repos = await funded(open);

      await place(repos, WELCOME_BONUS_POINTS);

      expect(await repos.wallet.getBalance(USER)).toBe(0);
    });

    test('fails for a wave that does not exist', async () => {
      const repos = await funded(open);

      await expect(place(repos, 50, 'nope')).rejects.toThrow(NotFoundError);

      expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS);
    });

    test('allows only one waiting prediction per wave, but another wave is fine', async () => {
      const repos = await funded(open);
      await place(repos);

      await expect(place(repos, 20, WAVE, NOW + 1)).rejects.toThrow(AlreadyPredictedError);
      await expect(place(repos, 20, 'trend-gorod', NOW + 1)).resolves.toBeDefined();

      expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS - 50 - 20);
    });

    test('two taps at once make one prediction, not two', async () => {
      const repos = await funded(open);

      const results = await Promise.allSettled([place(repos), place(repos)]);

      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      const failed = results.find((r) => r.status === 'rejected') as PromiseRejectedResult;
      expect(failed.reason).toBeInstanceOf(AlreadyPredictedError);
      expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS - 50);
    });

    test('after the result a new prediction on the same wave is possible', async () => {
      const repos = await funded(open);
      await place(repos);

      await expect(place(repos, 30, WAVE, DUE + 1)).resolves.toMatchObject({ status: 'open' });
    });

    test('reports the real error even when giving the stake back fails too', async () => {
      const repos = await funded(open);
      jest.spyOn(repos.predictions, 'add').mockRejectedValueOnce(new Error('disk full'));
      const append = repos.wallet.append.bind(repos.wallet);
      jest.spyOn(repos.wallet, 'append').mockImplementation(async (entry) => {
        if (entry.id.startsWith('refund-')) throw new Error('refund failed');
        return append(entry);
      });

      await expect(place(repos)).rejects.toThrow('disk full');
    });

    test('gives the stake back if the prediction could not be saved', async () => {
      const repos = await funded(open);
      jest.spyOn(repos.predictions, 'add').mockRejectedValueOnce(new Error('disk full'));

      await expect(place(repos)).rejects.toThrow('disk full');

      expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS);
    });
  });

  describe('settling predictions', () => {
    test('does nothing before the time is up', async () => {
      const repos = await funded(open);
      const prediction = await place(repos);
      await changeWaveScore(repos, 500);

      expect(await settleDuePredictions(repos, USER, DUE - 1)).toEqual([]);

      expect((await repos.predictions.getById(prediction.id))!.status).toBe('open');
    });

    test('pays double when the score grew', async () => {
      const repos = await funded(open);
      const prediction = await place(repos);
      await changeWaveScore(repos, 100);

      const settled = await settleDuePredictions(repos, USER, DUE);

      expect(settled.map((p) => [p.id, p.status])).toEqual([[prediction.id, 'won']]);
      expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS - 50 + 100);
      const payout = (await repos.wallet.listByUser(USER)).at(-1)!;
      expect(payout).toMatchObject({
        id: `payout-${prediction.id}`,
        amount: 100,
        kind: 'prediction_payout',
        refId: prediction.id,
      });
    });

    test('burns the stake when the score fell', async () => {
      const repos = await funded(open);
      const prediction = await place(repos);
      await changeWaveScore(repos, -100);

      await settleDuePredictions(repos, USER, DUE);

      expect((await repos.predictions.getById(prediction.id))!.status).toBe('lost');
      expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS - 50);
      expect(await repos.wallet.listByUser(USER)).toHaveLength(2);
    });

    test('returns the stake when the score did not change', async () => {
      const repos = await funded(open);
      const prediction = await place(repos);

      await settleDuePredictions(repos, USER, DUE);

      expect((await repos.predictions.getById(prediction.id))!.status).toBe('void');
      expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS);
    });

    test('closes a prediction only once, however often it is asked', async () => {
      const repos = await funded(open);
      await place(repos);
      await changeWaveScore(repos, 100);

      await settleDuePredictions(repos, USER, DUE);
      const again = await settleDuePredictions(repos, USER, DUE + 1000);

      expect(again).toEqual([]);
      expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS - 50 + 100);
    });

    test('two settlements at the same moment pay only once', async () => {
      const repos = await funded(open);
      await place(repos);
      await changeWaveScore(repos, 100);

      await Promise.all([
        settleDuePredictions(repos, USER, DUE),
        settleDuePredictions(repos, USER, DUE),
      ]);

      expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS - 50 + 100);
      expect(
        (await repos.wallet.listByUser(USER)).filter((e) => e.kind === 'prediction_payout'),
      ).toHaveLength(1);
    });

    test('a later result is not changed by scores that moved after the first calculation', async () => {
      const repos = await funded(open);
      const prediction = await place(repos);
      await changeWaveScore(repos, 100);
      await settleDuePredictions(repos, USER, DUE);
      await changeWaveScore(repos, -1000);

      await settleDuePredictions(repos, USER, DUE + 5000);

      expect((await repos.predictions.getById(prediction.id))!.status).toBe('won');
    });

    test('one prediction that cannot be closed does not stop the others', async () => {
      const repos = await funded(open);
      const stuck = await place(repos, 50, WAVE, NOW);
      const fine = await place(repos, 20, 'trend-gorod', NOW + 1);
      const updateStatus = repos.predictions.updateStatus.bind(repos.predictions);
      jest.spyOn(repos.predictions, 'updateStatus').mockImplementation(async (id, status) => {
        if (id === stuck.id) throw new Error('disk error');
        return updateStatus(id, status);
      });

      await expect(settleDuePredictions(repos, USER, DUE + 10)).rejects.toThrow('disk error');

      expect((await repos.predictions.getById(fine.id))!.status).toBe('void');
    });

    test('finishes a result that was paid but not marked (for example the app was closed)', async () => {
      const repos = await funded(open);
      const prediction = await place(repos);
      await changeWaveScore(repos, -100); // would be "lost" if calculated again
      await repos.wallet.append(
        createLedgerEntry({
          id: `payout-${prediction.id}`,
          userId: USER,
          amount: 100,
          kind: 'prediction_payout',
          refId: prediction.id,
          createdAt: DUE,
        }),
      );

      await settleDuePredictions(repos, USER, DUE + 1);

      expect((await repos.predictions.getById(prediction.id))!.status).toBe('won');
      expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS - 50 + 100);
    });
  });

  describe('lists and panels', () => {
    test('the list has the newest first, with the wave name and the payout', async () => {
      const repos = await funded(open);
      const first = await place(repos, 50, WAVE, NOW);
      await changeWaveScore(repos, 100);
      const second = await place(repos, 20, 'trend-gorod', NOW + 10);

      const list = await loadMyPredictions(repos, USER, DUE + 100);

      expect(list.map((v) => v.prediction.id)).toEqual([second.id, first.id]);
      expect(list[1]).toMatchObject({ trendName: 'Нейрокот', payout: 100 });
      expect(list[0]).toMatchObject({ trendName: 'Город будущего' });
    });

    test('the list settles what is due before it answers', async () => {
      const repos = await funded(open);
      await place(repos);
      await changeWaveScore(repos, 100);

      const [view] = await loadMyPredictions(repos, USER, DUE);

      expect(view!.prediction.status).toBe('won');
    });

    test('the panel shows the balance and the waiting prediction of the wave', async () => {
      const repos = await open();

      const empty = await loadPredictionPanel(repos, USER, WAVE, NOW);
      expect(empty).toEqual({ balance: WELCOME_BONUS_POINTS, open: null });

      const prediction = await place(repos);
      const after = await loadPredictionPanel(repos, USER, WAVE, NOW + 1000);
      expect(after.balance).toBe(WELCOME_BONUS_POINTS - 50);
      expect(after.open).toEqual(prediction);
    });

    test('the panel no longer shows a prediction after its result', async () => {
      const repos = await funded(open);
      await place(repos);

      const panel = await loadPredictionPanel(repos, USER, WAVE, DUE);

      expect(panel.open).toBeNull();
    });
  });
});
