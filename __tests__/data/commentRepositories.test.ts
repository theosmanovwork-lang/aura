import { createMemoryCommentRepository } from '../../src/data/memory';
import { createSqliteRepositories } from '../../src/data/sqlite';
import { LATEST_SCHEMA_VERSION, migrate } from '../../src/data/sqlite/migrations';
import { runCommentRepositoryContract } from '../../src/data/testing/contracts';
import { makeComment } from '../../src/data/testing/fixtures';
import { createTestDatabase } from '../../src/data/testing/sqljs';

const openSqlite = async () => {
  const db = await createTestDatabase();
  await migrate(db);
  return { db, repos: createSqliteRepositories(db) };
};

describe('memory', () => {
  runCommentRepositoryContract(() => createMemoryCommentRepository());
});

describe('sqlite', () => {
  runCommentRepositoryContract(async () => (await openSqlite()).repos.comments);

  test('the schema has the comments table from version 6', async () => {
    expect(LATEST_SCHEMA_VERSION).toBeGreaterThanOrEqual(6);
  });

  test('the table itself refuses an empty text', async () => {
    const { repos } = await openSqlite();

    await expect(repos.comments.add(makeComment({ text: '   ' }))).rejects.toThrow();
  });

  test('the table itself refuses a text over 300 characters', async () => {
    const { repos } = await openSqlite();

    await expect(repos.comments.add(makeComment({ text: 'а'.repeat(301) }))).rejects.toThrow();
  });
});
