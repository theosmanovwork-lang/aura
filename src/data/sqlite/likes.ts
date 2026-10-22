import type { LikeRepository } from '../repositories';
import type { SqlDatabase } from './database';
import { insertRow, selectOne } from './support';

export function createSqliteLikeRepository(db: SqlDatabase): LikeRepository {
  const has = async (userId: string, videoId: string) =>
    (await selectOne(db, 'SELECT 1 AS found FROM likes WHERE user_id = ? AND video_id = ?', [
      userId,
      videoId,
    ])) !== null;

  return {
    add: async (like) => {
      await insertRow(
        db,
        'likes',
        'INSERT INTO likes (user_id, video_id, created_at) VALUES (?, ?, ?)',
        [like.userId, like.videoId, like.createdAt],
        { user_id: `${like.userId}/${like.videoId}` },
      );
      return like;
    },
    remove: async (userId, videoId) =>
      (await db.run('DELETE FROM likes WHERE user_id = ? AND video_id = ?', [userId, videoId])) > 0,
    has,
    listVideoIds: async (userId) =>
      (
        await db.all<{ video_id: string }>(
          'SELECT video_id FROM likes WHERE user_id = ? ORDER BY seq',
          [userId],
        )
      ).map((row) => row.video_id),
  };
}
