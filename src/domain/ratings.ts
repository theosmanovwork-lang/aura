import type { Video } from './video';
import { videoPrice } from './videoPrice';

/** How many places a rating shows. */
export const RATING_LIMIT = 20;

export type VideoPlace = Readonly<{ video: Video; price: number }>;
export type AuthorPlace = Readonly<{ authorId: string; total: number; videoCount: number }>;

const published = (videos: readonly Video[]) =>
  videos.filter((video) => video.moderationStatus === 'published');

/** The best videos by price (views plus weighted Aura), highest first; equal prices go by id. */
export function rankVideos(videos: readonly Video[]): VideoPlace[] {
  return published(videos)
    .map((video) => ({ video, price: videoPrice(video) }))
    .sort((a, b) => b.price - a.price || a.video.id.localeCompare(b.video.id))
    .slice(0, RATING_LIMIT);
}

/** Authors by the summed price of their published videos, highest first; ties go by author id. */
export function rankAuthors(videos: readonly Video[]): AuthorPlace[] {
  const totals = new Map<string, { total: number; videoCount: number }>();
  for (const video of published(videos)) {
    const current = totals.get(video.authorId) ?? { total: 0, videoCount: 0 };
    totals.set(video.authorId, {
      total: current.total + videoPrice(video),
      videoCount: current.videoCount + 1,
    });
  }
  return [...totals.entries()]
    .map(([authorId, sums]) => ({ authorId, ...sums }))
    .sort((a, b) => b.total - a.total || a.authorId.localeCompare(b.authorId))
    .slice(0, RATING_LIMIT);
}
