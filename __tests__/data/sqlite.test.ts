import { ensureSeeded } from '../../src/data/bootstrap';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { migrate, LATEST_SCHEMA_VERSION, MIGRATIONS } from '../../src/data/sqlite/migrations';
import { createSqliteRepositories } from '../../src/data/sqlite';
import {
  runLikeRepositoryContract,
  runPredictionRepositoryContract,
  runTrendRepositoryContract,
  runTrendSnapshotRepositoryContract,
  runUserRepositoryContract,
  runVideoRepositoryContract,
  runWalletRepositoryContract,
} from '../../src/data/testing/contracts';
import { makeEntry, makeTrend, makeUser, makeVideo } from '../../src/data/testing/fixtures';
import { createTestDatabase } from '../../src/data/testing/sqljs';

const openRepositories = async () => {
  const db = await createTestDatabase();
  await migrate(db);
  return createSqliteRepositories(db);
};

runUserRepositoryContract(async () => (await openRepositories()).users);
runTrendRepositoryContract(async () => (await openRepositories()).trends);
runVideoRepositoryContract(async () => (await openRepositories()).videos);
runWalletRepositoryContract(async () => (await openRepositories()).wallet);
runPredictionRepositoryContract(async () => (await openRepositories()).predictions);
runLikeRepositoryContract(async () => (await openRepositories()).likes);
runTrendSnapshotRepositoryContract(async () => (await openRepositories()).snapshots);

describe('SQLite specifics', () => {
  test('the database enforces ledger rules itself (CHECK constraints)', async () => {
    const db = await createTestDatabase();
    await migrate(db);
    const insert = (amount: number, asset: string) =>
      db.run(
        'INSERT INTO ledger (id, user_id, amount, asset, kind, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        ['l', 'u1', amount, asset, 'welcome_bonus', 1],
      );

    await expect(insert(0, 'POINTS')).rejects.toThrow();
    await expect(insert(5, 'RUB')).rejects.toThrow();
  });

  test('the database itself refuses to change or delete ledger entries', async () => {
    const db = await createTestDatabase();
    await migrate(db);
    await createSqliteRepositories(db).wallet.append(makeEntry());

    await expect(db.run('UPDATE ledger SET amount = 999999 WHERE id = ?', ['l1'])).rejects.toThrow(
      'append-only',
    );
    await expect(db.run('DELETE FROM ledger WHERE id = ?', ['l1'])).rejects.toThrow('append-only');
  });

  test('the database itself refuses an overdraft, even if a bug skips the checks above it', async () => {
    const db = await createTestDatabase();
    await migrate(db);

    await expect(
      db.run(
        'INSERT INTO ledger (id, user_id, amount, asset, kind, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        ['x', 'u1', -5, 'POINTS', 'prediction_stake', 1],
      ),
    ).rejects.toThrow('ledger:insufficient_points');
  });

  test('stores booleans and optional fields faithfully', async () => {
    const repos = await openRepositories();
    await repos.videos.add(makeVideo({ isAiGenerated: true }));
    await repos.wallet.append(makeEntry({ refId: 'p1' }));
    await repos.wallet.append(makeEntry({ id: 'l2', amount: 3 }));

    expect((await repos.videos.getById('v1'))?.isAiGenerated).toBe(true);
    const [first, second] = await repos.wallet.listByUser('u1');
    expect(first?.refId).toBe('p1');
    expect(second && 'refId' in second).toBe(false);
  });

  test('refuses to update a field that is not allowed', async () => {
    const repos = await openRepositories();
    await repos.videos.add(makeVideo());

    await expect(
      repos.videos.update('v1', { title: 'hacked' } as unknown as { likeCount: number }),
    ).rejects.toThrow('not updatable');
  });

  test('returns the same results as the memory repositories for the demo seed', async () => {
    const sqlite = await openRepositories();
    const memory = createMemoryRepositories(seed);
    await ensureSeeded(sqlite, seed);

    expect(await sqlite.videos.listPublished()).toEqual(await memory.videos.listPublished());
    expect(await sqlite.trends.list()).toEqual(await memory.trends.list());
    expect(await sqlite.users.getById('user-me')).toEqual(await memory.users.getById('user-me'));
  });
});

describe('migrate', () => {
  test('sets the schema version and creates the tables', async () => {
    const db = await createTestDatabase();
    await migrate(db);

    const [{ user_version }] = await db.all<{ user_version: number }>('PRAGMA user_version');
    const tables = await db.all<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    );

    expect(user_version).toBe(LATEST_SCHEMA_VERSION);
    expect(tables.map((t) => t.name)).toEqual([
      'comments',
      'investments',
      'ledger',
      'likes',
      'predictions',
      'trend_snapshots',
      'trends',
      'users',
      'video_snapshots',
      'videos',
    ]);
  });

  test('upgrades a database that was created by the first schema version without losing data', async () => {
    const db = await createTestDatabase();
    await migrate(db, MIGRATIONS.slice(0, 1));
    await createSqliteRepositories(db).users.create(makeUser());

    await migrate(db);

    expect(await createSqliteRepositories(db).users.getById('u1')).toEqual(makeUser());
    const [{ user_version }] = await db.all<{ user_version: number }>('PRAGMA user_version');
    expect(user_version).toBe(LATEST_SCHEMA_VERSION);
  });

  test('upgrading from the previous version keeps the ledger and starts enforcing its rules', async () => {
    const db = await createTestDatabase();
    await migrate(db, MIGRATIONS.slice(0, 3));
    await createSqliteRepositories(db).wallet.append(makeEntry());

    await migrate(db);

    expect(await createSqliteRepositories(db).wallet.getBalance('u1')).toBe(100);
    await expect(
      createSqliteRepositories(db).wallet.append(
        makeEntry({ id: 'l2', amount: -500, kind: 'prediction_stake' }),
      ),
    ).rejects.toThrow('points');
  });

  test('is safe to run twice and keeps existing data', async () => {
    const db = await createTestDatabase();
    await migrate(db);
    const repos = createSqliteRepositories(db);
    await repos.users.create(makeUser());

    await migrate(db);

    expect(await repos.users.getById('u1')).toEqual(makeUser());
  });

  test('data survives closing and reopening the database file', async () => {
    const first = await createTestDatabase();
    await migrate(first);
    const firstRepos = createSqliteRepositories(first);
    await firstRepos.trends.add(makeTrend());
    await firstRepos.wallet.append(makeEntry());

    const reopened = await createTestDatabase(first.exportBytes());
    await migrate(reopened);
    const repos = createSqliteRepositories(reopened);

    expect(await repos.trends.getById('t1')).toEqual(makeTrend());
    expect(await repos.wallet.getBalance('u1')).toBe(100);
  });

  test('rolls back and keeps the old version when a migration fails', async () => {
    const real = await createTestDatabase();
    const statements: string[] = [];
    const failing = {
      ...real,
      exec: async (sql: string) => {
        statements.push(sql.trim().split(/\s+/)[0] ?? '');
        if (sql.includes('CREATE TABLE users')) throw new Error('disk full');
        return real.exec(sql);
      },
    };

    await expect(migrate(failing)).rejects.toThrow('disk full');

    expect(statements).toContain('ROLLBACK');
    const [{ user_version }] = await real.all<{ user_version: number }>('PRAGMA user_version');
    expect(user_version).toBe(0);
  });

  test('takes the write lock first (BEGIN IMMEDIATE) so two starts cannot both migrate', async () => {
    const real = await createTestDatabase();
    const statements: string[] = [];
    const spy = {
      ...real,
      exec: async (sql: string) => {
        statements.push(sql.trim());
        return real.exec(sql);
      },
    };

    await migrate(spy);

    expect(statements.find((sql) => sql.startsWith('BEGIN'))).toBe('BEGIN IMMEDIATE');
  });

  test('a failing ROLLBACK does not hide the original migration error', async () => {
    const real = await createTestDatabase();
    const failing = {
      ...real,
      exec: async (sql: string) => {
        if (sql.includes('CREATE TABLE users')) throw new Error('disk full');
        if (sql === 'ROLLBACK') throw new Error('connection lost');
        return real.exec(sql);
      },
    };

    await expect(migrate(failing)).rejects.toThrow('disk full');
  });

  test('refuses a database created by a newer version of the app', async () => {
    const db = await createTestDatabase();
    await db.exec(`PRAGMA user_version = ${LATEST_SCHEMA_VERSION + 1}`);

    await expect(migrate(db)).rejects.toThrow('newer');
  });
});
