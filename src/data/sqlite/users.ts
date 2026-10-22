import type { User } from '../../domain/user';
import type { UserRepository } from '../repositories';
import { NotFoundError } from '../repositories/errors';
import type { SqlDatabase } from './database';
import { insertRow, selectOne, updateExisting } from './support';

type UserRow = { id: string; nickname: string; created_at: number };

const toUser = (row: UserRow): User => ({
  id: row.id,
  nickname: row.nickname,
  createdAt: row.created_at,
});

export function createSqliteUserRepository(db: SqlDatabase): UserRepository {
  const getById = async (id: string) => {
    const row = await selectOne<UserRow>(db, 'SELECT * FROM users WHERE id = ?', [id]);
    return row ? toUser(row) : null;
  };

  return {
    create: async (user) => {
      await insertRow(
        db,
        'users',
        'INSERT INTO users (id, nickname, created_at) VALUES (?, ?, ?)',
        [user.id, user.nickname, user.createdAt],
        { id: user.id },
      );
      return user;
    },
    getById,
    rename: async (id, nickname) => {
      await updateExisting(db, 'users', id, 'UPDATE users SET nickname = ? WHERE id = ?', [
        nickname,
        id,
      ]);
      const user = await getById(id);
      if (!user) throw new NotFoundError('users', id);
      return user;
    },
  };
}
