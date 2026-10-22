import type { AgeRating, ModerationStatus, Video } from '../../domain/video';
import type { VideoRepository, VideoUpdate } from '../repositories';
import { NotFoundError } from '../repositories/errors';
import type { SqlDatabase, SqlValue } from './database';
import { insertRow, selectOne, updateExisting } from './support';

type VideoRow = {
  id: string;
  author_id: string;
  trend_id: string;
  title: string;
  video_uri: string;
  is_ai_generated: number;
  age_rating: string;
  moderation_status: string;
  like_count: number;
  view_count: number;
  created_at: number;
};

const toVideo = (row: VideoRow): Video => ({
  id: row.id,
  authorId: row.author_id,
  trendId: row.trend_id,
  title: row.title,
  videoUri: row.video_uri,
  isAiGenerated: row.is_ai_generated === 1,
  ageRating: row.age_rating as AgeRating,
  moderationStatus: row.moderation_status as ModerationStatus,
  likeCount: row.like_count,
  viewCount: row.view_count,
  createdAt: row.created_at,
});

const UPDATABLE_COLUMNS = {
  likeCount: 'like_count',
  viewCount: 'view_count',
  moderationStatus: 'moderation_status',
} as const;

export function createSqliteVideoRepository(db: SqlDatabase): VideoRepository {
  const getById = async (id: string) => {
    const row = await selectOne<VideoRow>(db, 'SELECT * FROM videos WHERE id = ?', [id]);
    return row ? toVideo(row) : null;
  };

  return {
    add: async (video) => {
      await insertRow(
        db,
        'videos',
        `INSERT INTO videos (id, author_id, trend_id, title, video_uri, is_ai_generated,
           age_rating, moderation_status, like_count, view_count, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          video.id,
          video.authorId,
          video.trendId,
          video.title,
          video.videoUri,
          video.isAiGenerated ? 1 : 0,
          video.ageRating,
          video.moderationStatus,
          video.likeCount,
          video.viewCount,
          video.createdAt,
        ],
        { id: video.id },
      );
      return video;
    },
    getById,
    listPublished: async () =>
      (
        await db.all<VideoRow>(
          `SELECT * FROM videos WHERE moderation_status = 'published'
           ORDER BY created_at DESC, id ASC`,
        )
      ).map(toVideo),
    update: async (id, patch: VideoUpdate) => {
      const changes = Object.entries(patch).filter(([, value]) => value !== undefined) as [
        keyof typeof UPDATABLE_COLUMNS,
        SqlValue,
      ][];
      for (const [key] of changes) {
        if (!(key in UPDATABLE_COLUMNS)) throw new Error(`Video field "${key}" is not updatable`);
      }
      if (changes.length > 0) {
        const assignments = changes.map(([key]) => `${UPDATABLE_COLUMNS[key]} = ?`).join(', ');
        const values = changes.map(([, value]) => value);
        await updateExisting(db, 'videos', id, `UPDATE videos SET ${assignments} WHERE id = ?`, [
          ...values,
          id,
        ]);
      }
      const video = await getById(id);
      if (!video) throw new NotFoundError('videos', id);
      return video;
    },
  };
}
