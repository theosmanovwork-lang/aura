import type { LedgerEntry } from '../../domain/ledger';
import type {
  InvestmentRepository,
  LikeRepository,
  PredictionRepository,
  TrendRepository,
  TrendSnapshotRepository,
  UserRepository,
  VideoRepository,
  VideoSnapshotRepository,
  WalletRepository,
} from '../repositories';
import { DuplicateKeyError, InsufficientPointsError, NotFoundError } from '../repositories';
import {
  makeEntry,
  makeInvestment,
  makeVideoSnapshot,
  makePrediction,
  makeSnapshot,
  makeTrend,
  makeUser,
  makeVideo,
} from './fixtures';

/**
 * Rules every repository implementation (memory, SQLite, server) must follow:
 * - no foreign-key checks at repository level: a video may reference an author or trend
 *   that is not stored yet (the fixtures rely on this);
 * - ids are unique, duplicates throw DuplicateKeyError, unknown ids throw NotFoundError;
 * - returned objects are copies; list order is documented per method.
 * The factory may be async (a SQLite repo has to open its database first).
 */
export function runUserRepositoryContract(
  createRepo: () => Promise<UserRepository> | UserRepository,
) {
  describe('UserRepository contract', () => {
    test('stores a user and returns it by id', async () => {
      const repo = await createRepo();
      await repo.create(makeUser());

      expect(await repo.getById('u1')).toEqual(makeUser());
    });

    test('returns null for an unknown id', async () => {
      expect(await (await createRepo()).getById('nope')).toBeNull();
    });

    test('rejects a duplicate id', async () => {
      const repo = await createRepo();
      await repo.create(makeUser());

      await expect(repo.create(makeUser())).rejects.toThrow(DuplicateKeyError);
    });

    test('renames a user and keeps the other fields', async () => {
      const repo = await createRepo();
      await repo.create(makeUser());

      const renamed = await repo.rename('u1', 'new_name');

      expect(renamed).toEqual(makeUser({ nickname: 'new_name' }));
      expect(await repo.getById('u1')).toEqual(renamed);
    });

    test('fails to rename an unknown user', async () => {
      await expect((await createRepo()).rename('nope', 'x')).rejects.toThrow(NotFoundError);
    });

    test('returns copies, not internal objects', async () => {
      const repo = await createRepo();
      await repo.create(makeUser());
      const first = await repo.getById('u1');
      (first as { nickname: string }).nickname = 'hacked';

      expect((await repo.getById('u1'))?.nickname).toBe('test_user');
    });
  });
}

export function runTrendRepositoryContract(
  createRepo: () => Promise<TrendRepository> | TrendRepository,
) {
  describe('TrendRepository contract', () => {
    test('finds a trend by id and by slug', async () => {
      const repo = await createRepo();
      await repo.add(makeTrend());

      expect(await repo.getById('t1')).toEqual(makeTrend());
      expect(await repo.getBySlug('test-wave')).toEqual(makeTrend());
    });

    test('returns null for unknown id and slug', async () => {
      const repo = await createRepo();

      expect(await repo.getById('nope')).toBeNull();
      expect(await repo.getBySlug('nope')).toBeNull();
    });

    test('lists trends in insertion order', async () => {
      const repo = await createRepo();
      await repo.add(makeTrend({ id: 'a', slug: 'a' }));
      await repo.add(makeTrend({ id: 'b', slug: 'b' }));

      expect((await repo.list()).map((t) => t.id)).toEqual(['a', 'b']);
    });

    test('rejects a duplicate id or slug', async () => {
      const repo = await createRepo();
      await repo.add(makeTrend());

      await expect(repo.add(makeTrend({ slug: 'other' }))).rejects.toThrow(DuplicateKeyError);
      await expect(repo.add(makeTrend({ id: 't2' }))).rejects.toThrow(DuplicateKeyError);
    });

    test('returns copies, not internal objects', async () => {
      const repo = await createRepo();
      await repo.add(makeTrend());
      const [first] = await repo.list();
      (first as { name: string }).name = 'hacked';

      expect((await repo.getById('t1'))?.name).toBe('Тестовая волна');
    });
  });
}

export function runVideoRepositoryContract(
  createRepo: () => Promise<VideoRepository> | VideoRepository,
) {
  describe('VideoRepository contract', () => {
    test('stores a video and returns it by id', async () => {
      const repo = await createRepo();
      await repo.add(makeVideo());

      expect(await repo.getById('v1')).toEqual(makeVideo());
      expect(await repo.getById('nope')).toBeNull();
    });

    test('lists only published videos, newest first', async () => {
      const repo = await createRepo();
      await repo.add(makeVideo({ id: 'old', createdAt: 1 }));
      await repo.add(makeVideo({ id: 'new', createdAt: 3 }));
      await repo.add(makeVideo({ id: 'wait', createdAt: 4, moderationStatus: 'pending' }));
      await repo.add(makeVideo({ id: 'bad', createdAt: 5, moderationStatus: 'rejected' }));

      expect((await repo.listPublished()).map((v) => v.id)).toEqual(['new', 'old']);
    });

    test('updates counters and moderation status only', async () => {
      const repo = await createRepo();
      await repo.add(makeVideo());

      const updated = await repo.update('v1', {
        likeCount: 5,
        viewCount: 20,
        moderationStatus: 'rejected',
      });

      expect(updated).toEqual(
        makeVideo({ likeCount: 5, viewCount: 20, moderationStatus: 'rejected' }),
      );
      expect(await repo.listPublished()).toEqual([]);
    });

    test('a partial patch leaves the other fields unchanged', async () => {
      const repo = await createRepo();
      await repo.add(makeVideo({ likeCount: 3, viewCount: 9 }));

      const updated = await repo.update('v1', { likeCount: 4 });

      expect(updated).toEqual(makeVideo({ likeCount: 4, viewCount: 9 }));
    });

    test('ignores undefined values in a patch', async () => {
      const repo = await createRepo();
      await repo.add(makeVideo({ likeCount: 3 }));

      const updated = await repo.update('v1', { likeCount: undefined, viewCount: 1 });

      expect(updated).toEqual(makeVideo({ likeCount: 3, viewCount: 1 }));
    });

    test('orders videos with the same createdAt by id', async () => {
      const repo = await createRepo();
      await repo.add(makeVideo({ id: 'b', createdAt: 5 }));
      await repo.add(makeVideo({ id: 'a', createdAt: 5 }));

      expect((await repo.listPublished()).map((v) => v.id)).toEqual(['a', 'b']);
    });

    test('fails to update an unknown video', async () => {
      await expect((await createRepo()).update('nope', { likeCount: 1 })).rejects.toThrow(
        NotFoundError,
      );
    });

    test('rejects a duplicate id', async () => {
      const repo = await createRepo();
      await repo.add(makeVideo());

      await expect(repo.add(makeVideo())).rejects.toThrow(DuplicateKeyError);
    });

    test('returns copies, not internal objects', async () => {
      const repo = await createRepo();
      await repo.add(makeVideo());
      const first = await repo.getById('v1');
      (first as { likeCount: number }).likeCount = 999;

      expect((await repo.getById('v1'))?.likeCount).toBe(0);
    });
  });
}

export function runWalletRepositoryContract(
  createRepo: () => Promise<WalletRepository> | WalletRepository,
) {
  describe('WalletRepository contract', () => {
    test('lists entries of one user in the order they were appended', async () => {
      const repo = await createRepo();
      await repo.append(makeEntry({ id: 'a', amount: 100 }));
      await repo.append(makeEntry({ id: 'x', userId: 'u2', amount: 7 }));
      await repo.append(makeEntry({ id: 'b', amount: -30, kind: 'prediction_stake' }));

      expect((await repo.listByUser('u1')).map((e) => e.id)).toEqual(['a', 'b']);
    });

    test('balance equals the sum of the user entries', async () => {
      const repo = await createRepo();
      await repo.append(makeEntry({ id: 'a', amount: 100 }));
      await repo.append(makeEntry({ id: 'b', amount: -30, kind: 'prediction_stake' }));
      await repo.append(makeEntry({ id: 'x', userId: 'u2', amount: 7 }));

      expect(await repo.getBalance('u1')).toBe(70);
      expect(await repo.getBalance('u2')).toBe(7);
    });

    test('balance of a user without entries is zero', async () => {
      expect(await (await createRepo()).getBalance('nobody')).toBe(0);
    });

    test('rejects an invalid entry (zero or fractional amount, foreign asset)', async () => {
      const repo = await createRepo();
      const bad = [
        { ...makeEntry(), amount: 0 },
        { ...makeEntry(), amount: 1.5 },
        { ...makeEntry(), asset: 'RUB' },
      ] as unknown as LedgerEntry[];

      for (const entry of bad) {
        await expect(repo.append(entry)).rejects.toThrow();
      }
      expect(await repo.listByUser('u1')).toEqual([]);
    });

    test('refuses to spend more points than the balance and leaves the ledger unchanged', async () => {
      const repo = await createRepo();
      await repo.append(makeEntry({ id: 'a', amount: 100 }));

      await expect(
        repo.append(makeEntry({ id: 'b', amount: -101, kind: 'prediction_stake' })),
      ).rejects.toThrow(InsufficientPointsError);

      expect(await repo.getBalance('u1')).toBe(100);
      expect((await repo.listByUser('u1')).map((e) => e.id)).toEqual(['a']);
    });

    test('allows spending exactly the whole balance', async () => {
      const repo = await createRepo();
      await repo.append(makeEntry({ id: 'a', amount: 100 }));

      await repo.append(makeEntry({ id: 'b', amount: -100, kind: 'prediction_stake' }));

      expect(await repo.getBalance('u1')).toBe(0);
    });

    test('a user without points cannot spend, even if other users have some', async () => {
      const repo = await createRepo();
      await repo.append(makeEntry({ id: 'a', userId: 'rich', amount: 500 }));

      await expect(
        repo.append(makeEntry({ id: 'b', userId: 'poor', amount: -1, kind: 'prediction_stake' })),
      ).rejects.toThrow(InsufficientPointsError);
    });

    test('earning points is always allowed, also after spending', async () => {
      const repo = await createRepo();
      await repo.append(makeEntry({ id: 'a', amount: 10 }));
      await repo.append(makeEntry({ id: 'b', amount: -10, kind: 'prediction_stake' }));

      await repo.append(makeEntry({ id: 'c', amount: 40, kind: 'prediction_payout' }));

      expect(await repo.getBalance('u1')).toBe(40);
    });

    test('rejects a duplicate entry id', async () => {
      const repo = await createRepo();
      await repo.append(makeEntry());

      await expect(repo.append(makeEntry())).rejects.toThrow(DuplicateKeyError);
    });

    test('is append-only: no update or delete operations exist', async () => {
      const repo = (await createRepo()) as unknown as Record<string, unknown>;

      for (const forbidden of ['update', 'delete', 'remove', 'replace']) {
        expect(repo[forbidden]).toBeUndefined();
      }
    });

    test('returns copies, not internal objects', async () => {
      const repo = await createRepo();
      await repo.append(makeEntry());
      const [first] = await repo.listByUser('u1');
      (first as { amount: number }).amount = 1_000_000;

      expect(await repo.getBalance('u1')).toBe(100);
    });
  });
}

export function runPredictionRepositoryContract(
  createRepo: () => Promise<PredictionRepository> | PredictionRepository,
) {
  describe('PredictionRepository contract', () => {
    test('stores a prediction and returns it by id', async () => {
      const repo = await createRepo();
      await repo.add(makePrediction());

      expect(await repo.getById('p1')).toEqual(makePrediction());
      expect(await repo.getById('nope')).toBeNull();
    });

    test('lists predictions of one user in insertion order', async () => {
      const repo = await createRepo();
      await repo.add(makePrediction({ id: 'a' }));
      await repo.add(makePrediction({ id: 'x', userId: 'u2' }));
      await repo.add(makePrediction({ id: 'b' }));

      expect((await repo.listByUser('u1')).map((p) => p.id)).toEqual(['a', 'b']);
    });

    test('updates the status', async () => {
      const repo = await createRepo();
      await repo.add(makePrediction());

      const updated = await repo.updateStatus('p1', 'won');

      expect(updated.status).toBe('won');
      expect((await repo.getById('p1'))?.status).toBe('won');
    });

    test('lists nothing for a user without predictions', async () => {
      expect(await (await createRepo()).listByUser('nobody')).toEqual([]);
    });

    test('fails to update an unknown prediction', async () => {
      await expect((await createRepo()).updateStatus('nope', 'won')).rejects.toThrow(NotFoundError);
    });

    test('rejects a duplicate id', async () => {
      const repo = await createRepo();
      await repo.add(makePrediction());

      await expect(repo.add(makePrediction())).rejects.toThrow(DuplicateKeyError);
    });

    test('returns copies, not internal objects', async () => {
      const repo = await createRepo();
      await repo.add(makePrediction());
      const first = await repo.getById('p1');
      (first as { stake: number }).stake = 999;

      expect((await repo.getById('p1'))?.stake).toBe(50);
    });
  });
}

export function runLikeRepositoryContract(
  createRepo: () => Promise<LikeRepository> | LikeRepository,
) {
  describe('LikeRepository contract', () => {
    test('remembers a like', async () => {
      const repo = await createRepo();
      await repo.add({ userId: 'u1', videoId: 'v1', createdAt: 1 });

      expect(await repo.has('u1', 'v1')).toBe(true);
      expect(await repo.has('u1', 'v2')).toBe(false);
      expect(await repo.has('u2', 'v1')).toBe(false);
    });

    test('rejects the same user liking the same video twice', async () => {
      const repo = await createRepo();
      await repo.add({ userId: 'u1', videoId: 'v1', createdAt: 1 });

      await expect(repo.add({ userId: 'u1', videoId: 'v1', createdAt: 2 })).rejects.toThrow(
        DuplicateKeyError,
      );
    });

    test('lets different users like the same video', async () => {
      const repo = await createRepo();
      await repo.add({ userId: 'u1', videoId: 'v1', createdAt: 1 });

      await expect(repo.add({ userId: 'u2', videoId: 'v1', createdAt: 2 })).resolves.toBeDefined();
    });

    test('remove reports whether a like existed', async () => {
      const repo = await createRepo();
      await repo.add({ userId: 'u1', videoId: 'v1', createdAt: 1 });

      expect(await repo.remove('u1', 'v1')).toBe(true);
      expect(await repo.remove('u1', 'v1')).toBe(false);
      expect(await repo.has('u1', 'v1')).toBe(false);
    });

    test('lists the liked video ids of one user in the order they were liked', async () => {
      const repo = await createRepo();
      await repo.add({ userId: 'u1', videoId: 'b', createdAt: 1 });
      await repo.add({ userId: 'u2', videoId: 'x', createdAt: 2 });
      await repo.add({ userId: 'u1', videoId: 'a', createdAt: 3 });

      expect(await repo.listVideoIds('u1')).toEqual(['b', 'a']);
      expect(await repo.listVideoIds('nobody')).toEqual([]);
    });
  });
}

export function runTrendSnapshotRepositoryContract(
  createRepo: () => Promise<TrendSnapshotRepository> | TrendSnapshotRepository,
) {
  describe('TrendSnapshotRepository contract', () => {
    test('stores snapshots and lists them of one trend, oldest first', async () => {
      const repo = await createRepo();
      await repo.add(makeSnapshot({ at: 30, score: 300 }));
      await repo.add(makeSnapshot({ at: 10, score: 100 }));
      await repo.add(makeSnapshot({ trendId: 'other', at: 20, score: 999 }));
      await repo.add(makeSnapshot({ at: 20, score: 200 }));

      expect((await repo.listByTrend('t1')).map((s) => s.score)).toEqual([100, 200, 300]);
    });

    test('lists nothing for a trend without snapshots', async () => {
      expect(await (await createRepo()).listByTrend('nope')).toEqual([]);
    });

    test('rejects a second snapshot of the same trend at the same moment', async () => {
      const repo = await createRepo();
      await repo.add(makeSnapshot());

      await expect(repo.add(makeSnapshot({ score: 5 }))).rejects.toThrow(DuplicateKeyError);
    });

    test('allows the same moment for different trends', async () => {
      const repo = await createRepo();
      await repo.add(makeSnapshot());

      await expect(repo.add(makeSnapshot({ trendId: 'other' }))).resolves.toBeDefined();
    });

    test('returns copies, not internal objects', async () => {
      const repo = await createRepo();
      await repo.add(makeSnapshot());
      const [first] = await repo.listByTrend('t1');
      (first as { score: number }).score = 999;

      expect((await repo.listByTrend('t1'))[0]?.score).toBe(100);
    });
  });
}

export function runInvestmentRepositoryContract(
  createRepo: () => Promise<InvestmentRepository> | InvestmentRepository,
) {
  describe('InvestmentRepository contract', () => {
    test('stores a position and finds it by id and by user and video', async () => {
      const repo = await createRepo();
      await repo.add(makeInvestment());

      expect(await repo.getById('i1')).toEqual(makeInvestment());
      expect(await repo.getByUserAndVideo('u1', 'v1')).toEqual(makeInvestment());
    });

    test('returns null for an unknown id or an unknown user and video pair', async () => {
      const repo = await createRepo();

      expect(await repo.getById('nope')).toBeNull();
      expect(await repo.getByUserAndVideo('u1', 'nope')).toBeNull();
    });

    test('rejects a duplicate id and a second position of the same user in the same video', async () => {
      const repo = await createRepo();
      await repo.add(makeInvestment());

      await expect(repo.add(makeInvestment())).rejects.toThrow(DuplicateKeyError);
      await expect(repo.add(makeInvestment({ id: 'i2' }))).rejects.toThrow(DuplicateKeyError);
    });

    test('lists the positions of one user in the order they were opened', async () => {
      const repo = await createRepo();
      await repo.add(makeInvestment({ id: 'i2', videoId: 'v2' }));
      await repo.add(makeInvestment({ id: 'i1', videoId: 'v1' }));
      await repo.add(makeInvestment({ id: 'i3', userId: 'u2', videoId: 'v1' }));

      expect((await repo.listByUser('u1')).map((i) => i.id)).toEqual(['i2', 'i1']);
      expect(await repo.listByUser('nobody')).toEqual([]);
    });

    test('updates the amounts and keeps the rest', async () => {
      const repo = await createRepo();
      await repo.add(makeInvestment());

      const updated = await repo.update('i1', { invested: 60, units: 0.015, updatedAt: 2000 });

      expect(updated).toEqual(makeInvestment({ invested: 60, units: 0.015, updatedAt: 2000 }));
      expect(await repo.getById('i1')).toEqual(updated);
    });

    test('refuses to update an unknown position', async () => {
      const repo = await createRepo();

      await expect(repo.update('nope', { invested: 1, units: 1, updatedAt: 1 })).rejects.toThrow(
        NotFoundError,
      );
    });

    test('hands out copies', async () => {
      const repo = await createRepo();
      await repo.add(makeInvestment());

      const first = await repo.getById('i1');
      (first as { invested: number }).invested = 1;

      expect((await repo.getById('i1'))?.invested).toBe(100);
    });
  });
}

export function runVideoSnapshotRepositoryContract(
  createRepo: () => Promise<VideoSnapshotRepository> | VideoSnapshotRepository,
) {
  describe('VideoSnapshotRepository contract', () => {
    test('lists the snapshots of one video, oldest first', async () => {
      const repo = await createRepo();
      await repo.add(makeVideoSnapshot({ at: 3000, price: 3 }));
      await repo.add(makeVideoSnapshot({ at: 1000, price: 1 }));
      await repo.add(makeVideoSnapshot({ videoId: 'v2', at: 2000, price: 2 }));

      expect((await repo.listByVideo('v1')).map((s) => s.price)).toEqual([1, 3]);
      expect(await repo.listByVideo('nobody')).toEqual([]);
    });

    test('rejects a second snapshot of the same video at the same moment', async () => {
      const repo = await createRepo();
      await repo.add(makeVideoSnapshot());

      await expect(repo.add(makeVideoSnapshot({ price: 5 }))).rejects.toThrow(DuplicateKeyError);
    });
  });
}
