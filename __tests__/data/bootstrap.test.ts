import { ensureSeeded } from '../../src/data/bootstrap';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { createSqliteRepositories } from '../../src/data/sqlite';
import { inTransaction } from '../../src/data/sqlite/transaction';
import { migrate } from '../../src/data/sqlite/migrations';
import { makeTrend, makeVideo } from '../../src/data/testing/fixtures';
import { createTestDatabase } from '../../src/data/testing/sqljs';

describe('ensureSeeded', () => {
  test('fills an empty database with the demo data', async () => {
    const repos = createMemoryRepositories();

    await ensureSeeded(repos, seed);

    expect(await repos.trends.list()).toHaveLength(seed.trends.length);
    expect(await repos.users.getById('user-me')).not.toBeNull();
    const published = seed.videos.filter((v) => v.moderationStatus === 'published');
    expect(await repos.videos.listPublished()).toHaveLength(published.length);
  });

  test('does nothing when the database already has data (no duplicates, no errors)', async () => {
    const repos = createMemoryRepositories();
    await ensureSeeded(repos, seed);

    await expect(ensureSeeded(repos, seed)).resolves.toBeUndefined();
    expect(await repos.trends.list()).toHaveLength(seed.trends.length);
  });

  test('does not overwrite data the user already has', async () => {
    const repos = createMemoryRepositories({ trends: [makeTrend()] });

    await ensureSeeded(repos, seed);

    expect((await repos.trends.list()).map((t) => t.id)).toEqual(['t1']);
  });

  test('is all-or-nothing: a failure midway leaves the database empty so the next start retries', async () => {
    const db = await createTestDatabase();
    await migrate(db);
    const repos = createSqliteRepositories(db);
    const broken = { ...seed, videos: [makeVideo({ id: 'dup' }), makeVideo({ id: 'dup' })] };

    await expect(ensureSeeded(repos, broken, (work) => inTransaction(db, work))).rejects.toThrow();

    expect(await repos.trends.list()).toEqual([]);
    expect(await repos.users.getById('user-me')).toBeNull();
    await ensureSeeded(repos, seed, (work) => inTransaction(db, work));
    expect(await repos.trends.list()).toHaveLength(seed.trends.length);
  });
});
