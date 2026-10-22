import { seed } from '../../src/data/seed';
import { openAppRepositories } from '../../src/data/sqlite/open';
import { createTestDatabase } from '../../src/data/testing/sqljs';

describe('openAppRepositories', () => {
  test('opens the named database, migrates it and loads the demo data once', async () => {
    const db = await createTestDatabase();
    const openDb = jest.fn().mockResolvedValue(db);

    const first = await openAppRepositories(openDb);
    const second = await openAppRepositories(openDb);

    expect(openDb).toHaveBeenCalledWith('aura.db');
    expect(await first.trends.list()).toHaveLength(seed.trends.length);
    expect(await second.trends.list()).toHaveLength(seed.trends.length);
  });

  test('two simultaneous starts share one opening (no double migration)', async () => {
    const db = await createTestDatabase();
    const openDb = jest.fn().mockResolvedValue(db);

    const [first, second] = await Promise.all([
      openAppRepositories(openDb),
      openAppRepositories(openDb),
    ]);

    expect(openDb).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
  });

  test('can be opened again after the previous start finished', async () => {
    const openDb = jest.fn().mockImplementation(() => createTestDatabase());

    await openAppRepositories(openDb);
    await openAppRepositories(openDb);

    expect(openDb).toHaveBeenCalledTimes(2);
  });

  test('the demo history ends at the moment of the first start', async () => {
    const db = await createTestDatabase();
    const now = Date.UTC(2030, 5, 15, 12);

    const repos = await openAppRepositories(
      () => Promise.resolve(db),
      () => now,
    );

    expect((await repos.snapshots.listByTrend('trend-neirokot')).at(-1)?.at).toBe(now);
  });
});
