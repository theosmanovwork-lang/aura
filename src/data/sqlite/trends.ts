import type { Trend } from '../../domain/trend';
import type { TrendRepository } from '../repositories';
import type { SqlDatabase } from './database';
import { insertRow, selectOne } from './support';

type TrendRow = { id: string; slug: string; name: string; created_at: number };

const toTrend = (row: TrendRow): Trend => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  createdAt: row.created_at,
});

export function createSqliteTrendRepository(db: SqlDatabase): TrendRepository {
  const findBy = async (column: 'id' | 'slug', value: string) => {
    const row = await selectOne<TrendRow>(db, `SELECT * FROM trends WHERE ${column} = ?`, [value]);
    return row ? toTrend(row) : null;
  };

  return {
    add: async (trend) => {
      await insertRow(
        db,
        'trends',
        'INSERT INTO trends (id, slug, name, created_at) VALUES (?, ?, ?, ?)',
        [trend.id, trend.slug, trend.name, trend.createdAt],
        { id: trend.id, slug: trend.slug },
      );
      return trend;
    },
    list: async () => (await db.all<TrendRow>('SELECT * FROM trends ORDER BY seq')).map(toTrend),
    getById: (id) => findBy('id', id),
    getBySlug: (slug) => findBy('slug', slug),
  };
}
