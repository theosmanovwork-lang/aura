import type { SqlDatabase } from './database';

/** Runs the work as one all-or-nothing step. Rolls back on any error and rethrows that error. */
export async function inTransaction<T>(db: SqlDatabase, work: () => Promise<T>): Promise<T> {
  await db.exec('BEGIN IMMEDIATE');
  try {
    const result = await work();
    await db.exec('COMMIT');
    return result;
  } catch (error) {
    await db.exec('ROLLBACK').catch(() => undefined);
    throw error;
  }
}
