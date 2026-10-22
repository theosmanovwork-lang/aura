import type { SqlDatabase } from './database';

/** Each entry is one schema version. Never edit an old entry: add a new one. */
export const MIGRATIONS: readonly string[] = [
  `
  CREATE TABLE users (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL UNIQUE,
    nickname TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE trends (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE videos (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL UNIQUE,
    author_id TEXT NOT NULL,
    trend_id TEXT NOT NULL,
    title TEXT NOT NULL,
    video_uri TEXT NOT NULL,
    is_ai_generated INTEGER NOT NULL CHECK (is_ai_generated IN (0, 1)),
    age_rating TEXT NOT NULL CHECK (age_rating IN ('0+', '6+', '12+', '16+', '18+')),
    moderation_status TEXT NOT NULL CHECK (moderation_status IN ('pending', 'published', 'rejected')),
    like_count INTEGER NOT NULL CHECK (like_count >= 0),
    view_count INTEGER NOT NULL CHECK (view_count >= 0),
    created_at INTEGER NOT NULL
  );
  CREATE INDEX videos_feed ON videos (moderation_status, created_at);
  CREATE TABLE ledger (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount <> 0),
    asset TEXT NOT NULL CHECK (asset = 'POINTS'),
    kind TEXT NOT NULL CHECK (kind IN ('welcome_bonus', 'prediction_stake', 'prediction_payout')),
    ref_id TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX ledger_user ON ledger (user_id);
  CREATE TABLE predictions (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    trend_id TEXT NOT NULL,
    stake INTEGER NOT NULL CHECK (stake > 0),
    baseline_score REAL NOT NULL,
    created_at INTEGER NOT NULL,
    closes_at INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'won', 'lost', 'void'))
  );
  CREATE INDEX predictions_user ON predictions (user_id);
  `,
  `
  CREATE TABLE likes (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    video_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE (user_id, video_id)
  );
  `,
  `
  CREATE TABLE trend_snapshots (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    trend_id TEXT NOT NULL,
    at INTEGER NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0),
    UNIQUE (trend_id, at)
  );
  `,
  `
  CREATE TRIGGER ledger_no_overdraft BEFORE INSERT ON ledger
  WHEN NEW.amount < 0
    AND COALESCE((SELECT SUM(amount) FROM ledger WHERE user_id = NEW.user_id), 0) + NEW.amount < 0
  BEGIN
    SELECT RAISE(ABORT, 'ledger:insufficient_points');
  END;
  CREATE TRIGGER ledger_no_update BEFORE UPDATE ON ledger
  BEGIN
    SELECT RAISE(ABORT, 'ledger is append-only');
  END;
  CREATE TRIGGER ledger_no_delete BEFORE DELETE ON ledger
  BEGIN
    SELECT RAISE(ABORT, 'ledger is append-only');
  END;
  `,
];

export const LATEST_SCHEMA_VERSION = MIGRATIONS.length;

async function readVersion(db: SqlDatabase): Promise<number> {
  const [row] = await db.all<{ user_version: number }>('PRAGMA user_version');
  return row?.user_version ?? 0;
}

/** Applies the next migration, if any, in one transaction. Returns the resulting version. */
async function applyNext(db: SqlDatabase, migrations: readonly string[]): Promise<number> {
  await db.exec('BEGIN IMMEDIATE');
  try {
    // Read again under the write lock: another start may have migrated in the meantime.
    const version = await readVersion(db);
    if (version >= migrations.length) {
      await db.exec('COMMIT');
      return version;
    }
    await db.exec(migrations[version] as string);
    await db.exec(`PRAGMA user_version = ${version + 1}`);
    await db.exec('COMMIT');
    return version + 1;
  } catch (error) {
    await db.exec('ROLLBACK').catch(() => undefined);
    throw error;
  }
}

/** Brings the database up to the latest schema. Safe to call on every app start. */
export async function migrate(
  db: SqlDatabase,
  migrations: readonly string[] = MIGRATIONS,
): Promise<void> {
  let version = await readVersion(db);
  if (version > migrations.length) {
    throw new Error(
      `Database schema v${version} is newer than this app supports (v${migrations.length})`,
    );
  }
  while (version < migrations.length) version = await applyNext(db, migrations);
}
