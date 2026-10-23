import {
  createMemoryInvestmentRepository,
  createMemoryVideoSnapshotRepository,
} from '../../src/data/memory';
import { createSqliteRepositories } from '../../src/data/sqlite';
import { migrate } from '../../src/data/sqlite/migrations';
import {
  runInvestmentRepositoryContract,
  runVideoSnapshotRepositoryContract,
} from '../../src/data/testing/contracts';
import { makeEntry } from '../../src/data/testing/fixtures';
import { createTestDatabase } from '../../src/data/testing/sqljs';

const openSqlite = async () => {
  const db = await createTestDatabase();
  await migrate(db);
  return createSqliteRepositories(db);
};

describe('memory', () => {
  runInvestmentRepositoryContract(() => createMemoryInvestmentRepository());
  runVideoSnapshotRepositoryContract(() => createMemoryVideoSnapshotRepository());
});

describe('sqlite', () => {
  runInvestmentRepositoryContract(async () => (await openSqlite()).investments);
  runVideoSnapshotRepositoryContract(async () => (await openSqlite()).videoSnapshots);

  test.each(['investment_open', 'investment_close'] as const)(
    'the ledger accepts the new kind %s',
    async (kind) => {
      const repos = await openSqlite();
      await repos.wallet.append(makeEntry({ id: 'bonus', amount: 100 }));

      const entry = makeEntry({ id: 'e2', amount: kind === 'investment_open' ? -10 : 10, kind });
      await repos.wallet.append(entry);

      expect((await repos.wallet.listByUser('u1')).map((e) => e.kind)).toContain(kind);
    },
  );
});
