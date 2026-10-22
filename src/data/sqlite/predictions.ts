import type { Prediction, PredictionStatus } from '../../domain/prediction';
import type { PredictionRepository } from '../repositories';
import { NotFoundError } from '../repositories/errors';
import type { SqlDatabase } from './database';
import { insertRow, selectOne, updateExisting } from './support';

type PredictionRow = {
  id: string;
  user_id: string;
  trend_id: string;
  stake: number;
  baseline_score: number;
  created_at: number;
  closes_at: number;
  status: string;
};

const toPrediction = (row: PredictionRow): Prediction => ({
  id: row.id,
  userId: row.user_id,
  trendId: row.trend_id,
  stake: row.stake,
  baselineScore: row.baseline_score,
  createdAt: row.created_at,
  closesAt: row.closes_at,
  status: row.status as PredictionStatus,
});

export function createSqlitePredictionRepository(db: SqlDatabase): PredictionRepository {
  const getById = async (id: string) => {
    const row = await selectOne<PredictionRow>(db, 'SELECT * FROM predictions WHERE id = ?', [id]);
    return row ? toPrediction(row) : null;
  };

  return {
    add: async (p) => {
      await insertRow(
        db,
        'predictions',
        `INSERT INTO predictions (id, user_id, trend_id, stake, baseline_score, created_at,
           closes_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.userId, p.trendId, p.stake, p.baselineScore, p.createdAt, p.closesAt, p.status],
        { id: p.id },
      );
      return p;
    },
    getById,
    listByUser: async (userId) =>
      (
        await db.all<PredictionRow>('SELECT * FROM predictions WHERE user_id = ? ORDER BY seq', [
          userId,
        ])
      ).map(toPrediction),
    updateStatus: async (id, status) => {
      await updateExisting(
        db,
        'predictions',
        id,
        'UPDATE predictions SET status = ? WHERE id = ?',
        [status, id],
      );
      const prediction = await getById(id);
      if (!prediction) throw new NotFoundError('predictions', id);
      return prediction;
    },
  };
}
