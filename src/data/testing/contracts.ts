import type { LedgerEntry } from '../../domain/ledger';
import type {
  PredictionRepository,
  TrendRepository,
  UserRepository,
  VideoRepository,
  WalletRepository,
} from '../repositories';
import { DuplicateKeyError, NotFoundError } from '../repositories';
import { makeEntry, makePrediction, makeTrend, makeUser, makeVideo } from './fixtures';

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
