import type { Repositories } from '../repositories';
import type { SqlDatabase } from './database';
import { createSqlitePredictionRepository } from './predictions';
import { createSqliteTrendRepository } from './trends';
import { createSqliteUserRepository } from './users';
import { createSqliteVideoRepository } from './videos';
import { createSqliteWalletRepository } from './wallet';

export type { SqlDatabase } from './database';

export function createSqliteRepositories(db: SqlDatabase): Repositories {
  return {
    users: createSqliteUserRepository(db),
    trends: createSqliteTrendRepository(db),
    videos: createSqliteVideoRepository(db),
    wallet: createSqliteWalletRepository(db),
    predictions: createSqlitePredictionRepository(db),
  };
}
