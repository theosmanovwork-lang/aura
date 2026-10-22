import type { TrendSnapshotRepository } from '../repositories';
import type { SqlDatabase } from './database';
import { insertRow } from './support';

type SnapshotRow = { trend_id: string; at: number; score: number };

export function createSqliteTrendSnapshotRepository(db: SqlDatabase): TrendSnapshotRepository {
  return {
    add: async (snapshot) => {
      await insertRow(
        db,
        'trend_snapshots',
        'INSERT INTO trend_snapshots (trend_id, at, score) VALUES (?, ?, ?)',
        [snapshot.trendId, snapshot.at, snapshot.score],
        { trend_id: `${snapshot.trendId}@${snapshot.at}` },
      );
      return snapshot;
    },
    listByTrend: async (trendId) =>
      (
        await db.all<SnapshotRow>(
          'SELECT trend_id, at, score FROM trend_snapshots WHERE trend_id = ? ORDER BY at, seq',
          [trendId],
        )
      ).map((row) => ({ trendId: row.trend_id, at: row.at, score: row.score })),
  };
}
