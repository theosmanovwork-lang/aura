import type { Repositories } from '../repositories';
import type { SqlDatabase } from './database';
import { createSqliteCommentRepository } from './comments';
import { createSqliteInvestmentRepository } from './investments';
import { createSqliteLikeRepository } from './likes';
import { createSqlitePredictionRepository } from './predictions';
import { createSqliteTrendRepository } from './trends';
import { createSqliteTrendSnapshotRepository } from './snapshots';
import { createSqliteUserRepository } from './users';
import { createSqliteVideoRepository } from './videos';
import { createSqliteVideoSnapshotRepository } from './videoSnapshots';
import { createSqliteWalletRepository } from './wallet';

export type { SqlDatabase } from './database';

export function createSqliteRepositories(db: SqlDatabase): Repositories {
  return {
    users: createSqliteUserRepository(db),
    trends: createSqliteTrendRepository(db),
    videos: createSqliteVideoRepository(db),
    wallet: createSqliteWalletRepository(db),
    predictions: createSqlitePredictionRepository(db),
    likes: createSqliteLikeRepository(db),
    snapshots: createSqliteTrendSnapshotRepository(db),
    investments: createSqliteInvestmentRepository(db),
    videoSnapshots: createSqliteVideoSnapshotRepository(db),
    comments: createSqliteCommentRepository(db),
  };
}
