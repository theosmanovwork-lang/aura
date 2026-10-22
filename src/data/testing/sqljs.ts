import initSqlJs, { type SqlJsStatic } from 'sql.js';

import type { SqlDatabase } from '../sqlite/database';

export type TestDatabase = SqlDatabase & { exportBytes(): Uint8Array };

let engine: Promise<SqlJsStatic> | undefined;

/** A real in-memory SQLite engine (sql.js) behind the same interface the app uses on the phone. */
export async function createTestDatabase(bytes?: Uint8Array): Promise<TestDatabase> {
  engine ??= initSqlJs();
  const SQL = await engine;
  const db = new SQL.Database(bytes);

  return {
    exec: async (sql) => {
      db.exec(sql);
    },
    run: async (sql, params = []) => {
      db.run(sql, [...params]);
      return db.getRowsModified();
    },
    all: async <T>(sql: string, params: readonly (string | number | null)[] = []) => {
      const statement = db.prepare(sql);
      try {
        statement.bind([...params]);
        const rows: T[] = [];
        while (statement.step()) rows.push(statement.getAsObject() as T);
        return rows;
      } finally {
        statement.free();
      }
    },
    exportBytes: () => db.export(),
  };
}
