export type SqlValue = string | number | null;

/** The only thing the SQLite repositories need from a database. */
export interface SqlDatabase {
  exec(sql: string): Promise<void>;
  /** Runs one statement and returns the number of changed rows. */
  run(sql: string, params?: readonly SqlValue[]): Promise<number>;
  all<T>(sql: string, params?: readonly SqlValue[]): Promise<T[]>;
}
