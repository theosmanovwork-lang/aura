import type { Investment } from '../../domain/investment';
import type { InvestmentRepository } from '../repositories';
import { NotFoundError } from '../repositories/errors';
import type { SqlDatabase } from './database';
import { insertRow, selectOne, updateExisting } from './support';

type InvestmentRow = {
  id: string;
  user_id: string;
  video_id: string;
  invested: number;
  units: number;
  created_at: number;
  updated_at: number;
};

const toInvestment = (row: InvestmentRow): Investment => ({
  id: row.id,
  userId: row.user_id,
  videoId: row.video_id,
  invested: row.invested,
  units: row.units,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function createSqliteInvestmentRepository(db: SqlDatabase): InvestmentRepository {
  const getById = async (id: string) => {
    const row = await selectOne<InvestmentRow>(db, 'SELECT * FROM investments WHERE id = ?', [id]);
    return row ? toInvestment(row) : null;
  };

  return {
    add: async (i) => {
      await insertRow(
        db,
        'investments',
        `INSERT INTO investments (id, user_id, video_id, invested, units, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [i.id, i.userId, i.videoId, i.invested, i.units, i.createdAt, i.updatedAt],
        { id: i.id, user_id: `${i.userId}/${i.videoId}`, video_id: `${i.userId}/${i.videoId}` },
      );
      return i;
    },
    getById,
    getByUserAndVideo: async (userId, videoId) => {
      const row = await selectOne<InvestmentRow>(
        db,
        'SELECT * FROM investments WHERE user_id = ? AND video_id = ?',
        [userId, videoId],
      );
      return row ? toInvestment(row) : null;
    },
    listByUser: async (userId) =>
      (
        await db.all<InvestmentRow>('SELECT * FROM investments WHERE user_id = ? ORDER BY seq', [
          userId,
        ])
      ).map(toInvestment),
    update: async (id, patch) => {
      await updateExisting(
        db,
        'investments',
        id,
        'UPDATE investments SET invested = ?, units = ?, updated_at = ? WHERE id = ?',
        [patch.invested, patch.units, patch.updatedAt, id],
      );
      const investment = await getById(id);
      if (!investment) throw new NotFoundError('investments', id);
      return investment;
    },
  };
}
