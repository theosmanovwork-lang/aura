import { createSqliteRepositories } from '../../src/data/sqlite';
import { LATEST_SCHEMA_VERSION, MIGRATIONS, migrate } from '../../src/data/sqlite/migrations';
import { InsufficientPointsError } from '../../src/data/repositories';
import { makeEntry } from '../../src/data/testing/fixtures';
import { createTestDatabase } from '../../src/data/testing/sqljs';

describe('migration to the investments schema', () => {
  test('is the fifth version', () => {
    expect(LATEST_SCHEMA_VERSION).toBeGreaterThanOrEqual(5);
  });

  test('keeps every ledger row, in order, and the balance', async () => {
    const db = await createTestDatabase();
    await migrate(db, MIGRATIONS.slice(0, 4));
    const before = createSqliteRepositories(db).wallet;
    await before.append(makeEntry({ id: 'a', amount: 1000, kind: 'welcome_bonus', createdAt: 1 }));
    await before.append(
      makeEntry({ id: 'b', amount: -250, kind: 'prediction_stake', refId: 'p1', createdAt: 2 }),
    );
    const entriesBefore = await before.listByUser('u1');

    await migrate(db);

    const after = createSqliteRepositories(db).wallet;
    expect(await after.listByUser('u1')).toEqual(entriesBefore);
    expect(await after.getBalance('u1')).toBe(750);
  });

  test('the ledger still refuses an overdraft, changes and deletes after the upgrade', async () => {
    const db = await createTestDatabase();
    await migrate(db, MIGRATIONS.slice(0, 4));
    await migrate(db);
    const wallet = createSqliteRepositories(db).wallet;
    await wallet.append(makeEntry({ id: 'a', amount: 100 }));

    await expect(
      wallet.append(makeEntry({ id: 'b', amount: -101, kind: 'investment_open' })),
    ).rejects.toThrow(InsufficientPointsError);
    await expect(db.run("UPDATE ledger SET amount = 5 WHERE id = 'a'")).rejects.toThrow(
      /append-only/,
    );
    await expect(db.run("DELETE FROM ledger WHERE id = 'a'")).rejects.toThrow(/append-only/);
  });

  test('creates the investments and video price tables', async () => {
    const db = await createTestDatabase();
    await migrate(db);

    const tables = await db.all<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
    );
    expect(tables.map((t) => t.name)).toEqual(
      expect.arrayContaining(['investments', 'video_snapshots']),
    );
  });
});
