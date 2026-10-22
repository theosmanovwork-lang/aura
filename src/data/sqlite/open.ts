import { ensureSeeded } from '../bootstrap';
import type { Repositories } from '../repositories';
import { createSeed } from '../seed';
import type { SqlDatabase } from './database';
import { openExpoDatabase } from './expoDatabase';
import { createSqliteRepositories } from './index';
import { migrate } from './migrations';
import { inTransaction } from './transaction';

export const DATABASE_NAME = 'aura.db';

let opening: Promise<Repositories> | undefined;

async function open(
  openDb: (name: string) => Promise<SqlDatabase>,
  now: () => number,
): Promise<Repositories> {
  const db = await openDb(DATABASE_NAME);
  await migrate(db);
  const repos = createSqliteRepositories(db);
  await ensureSeeded(repos, createSeed(now()), (work) => inTransaction(db, work));
  return repos;
}

/**
 * The one place the app opens its storage: open file, upgrade schema, fill demo data once.
 * Simultaneous calls (for example a double effect on start) share a single opening.
 */
export function openAppRepositories(
  openDb: (name: string) => Promise<SqlDatabase> = openExpoDatabase,
  now: () => number = Date.now,
): Promise<Repositories> {
  opening ??= open(openDb, now).finally(() => {
    opening = undefined;
  });
  return opening;
}
