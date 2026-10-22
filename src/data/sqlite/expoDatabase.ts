import * as SQLite from 'expo-sqlite';

import type { SqlDatabase } from './database';

/** Opens a database file on the phone and adapts expo-sqlite to SqlDatabase. */
export async function openExpoDatabase(name: string): Promise<SqlDatabase> {
  const native = await SQLite.openDatabaseAsync(name);

  return {
    exec: (sql) => native.execAsync(sql),
    run: async (sql, params = []) => (await native.runAsync(sql, [...params])).changes,
    all: <T>(sql: string, params: readonly (string | number | null)[] = []) =>
      native.getAllAsync<T>(sql, [...params]),
  };
}
