import type { VideoSnapshotRepository } from '../repositories';
import type { SqlDatabase } from './database';
import { insertRow } from './support';

type SnapshotRow = { video_id: string; at: number; price: number };

export function createSqliteVideoSnapshotRepository(db: SqlDatabase): VideoSnapshotRepository {
  return {
    add: async (snapshot) => {
      await insertRow(
        db,
        'video_snapshots',
        'INSERT INTO video_snapshots (video_id, at, price) VALUES (?, ?, ?)',
        [snapshot.videoId, snapshot.at, snapshot.price],
        { video_id: `${snapshot.videoId}@${snapshot.at}` },
      );
      return snapshot;
    },
    listByVideo: async (videoId) =>
      (
        await db.all<SnapshotRow>(
          'SELECT video_id, at, price FROM video_snapshots WHERE video_id = ? ORDER BY at, seq',
          [videoId],
        )
      ).map((row) => ({ videoId: row.video_id, at: row.at, price: row.price })),
  };
}
