import { DuplicateKeyError, NotFoundError } from '../repositories/errors';
import type { SqlDatabase, SqlValue } from './database';

const UNIQUE_FAILURE = /UNIQUE constraint failed: (\w+)\.(\w+)/;

/** Inserts a row; turns a UNIQUE violation into DuplicateKeyError naming the clashing key. */
export async function insertRow(
  db: SqlDatabase,
  table: string,
  sql: string,
  params: readonly SqlValue[],
  keys: Readonly<Record<string, string>>,
): Promise<void> {
  try {
    await db.run(sql, params);
  } catch (error) {
    const column = UNIQUE_FAILURE.exec(String(error instanceof Error ? error.message : error))?.[2];
    if (column && keys[column] !== undefined) throw new DuplicateKeyError(table, keys[column]);
    throw error;
  }
}

/** Runs an UPDATE that must touch exactly the row with this id. */
export async function updateExisting(
  db: SqlDatabase,
  table: string,
  id: string,
  sql: string,
  params: readonly SqlValue[],
): Promise<void> {
  if ((await db.run(sql, params)) === 0) throw new NotFoundError(table, id);
}

export async function selectOne<Row>(
  db: SqlDatabase,
  sql: string,
  params: readonly SqlValue[],
): Promise<Row | null> {
  const [row] = await db.all<Row>(sql, params);
  return row ?? null;
}
