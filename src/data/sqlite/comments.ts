import type { Comment } from '../../domain/comment';
import type { CommentRepository } from '../repositories';
import type { SqlDatabase } from './database';
import { insertRow, selectOne } from './support';

type CommentRow = {
  id: string;
  video_id: string;
  author_id: string;
  text: string;
  created_at: number;
};

const COLUMNS = 'id, video_id, author_id, text, created_at';

const toComment = (row: CommentRow): Comment => ({
  id: row.id,
  videoId: row.video_id,
  authorId: row.author_id,
  text: row.text,
  createdAt: row.created_at,
});

export function createSqliteCommentRepository(db: SqlDatabase): CommentRepository {
  return {
    add: async (comment) => {
      await insertRow(
        db,
        'comments',
        `INSERT INTO comments (${COLUMNS}) VALUES (?, ?, ?, ?, ?)`,
        [comment.id, comment.videoId, comment.authorId, comment.text, comment.createdAt],
        { id: comment.id },
      );
      return comment;
    },
    listByVideo: async (videoId) =>
      (
        await db.all<CommentRow>(
          `SELECT ${COLUMNS} FROM comments WHERE video_id = ? ORDER BY created_at DESC, seq DESC`,
          [videoId],
        )
      ).map(toComment),
    countByVideo: async (videoIds) => {
      const counts: Record<string, number> = Object.fromEntries(videoIds.map((id) => [id, 0]));
      if (videoIds.length === 0) return counts;
      const marks = videoIds.map(() => '?').join(', ');
      const rows = await db.all<{ video_id: string; total: number }>(
        `SELECT video_id, COUNT(*) AS total FROM comments WHERE video_id IN (${marks}) GROUP BY video_id`,
        videoIds,
      );
      return { ...counts, ...Object.fromEntries(rows.map((row) => [row.video_id, row.total])) };
    },
    getLatestByAuthor: async (authorId, videoId) => {
      const row = await selectOne<CommentRow>(
        db,
        `SELECT ${COLUMNS} FROM comments WHERE author_id = ? AND video_id = ? ORDER BY created_at DESC, seq DESC LIMIT 1`,
        [authorId, videoId],
      );
      return row ? toComment(row) : null;
    },
  };
}
