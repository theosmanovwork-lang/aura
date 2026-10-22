import type { Video } from './video';

export const VIEW_WEIGHT = 1;
export const LIKE_WEIGHT = 5;

/**
 * Popularity index of a trend (a made-up number, not money): views plus weighted likes of
 * all its published videos. Pass the videos that carry the trend's tag.
 */
export function calcTrendScore(videos: readonly Video[]): number {
  return videos
    .filter((video) => video.moderationStatus === 'published')
    .reduce((sum, video) => sum + video.viewCount * VIEW_WEIGHT + video.likeCount * LIKE_WEIGHT, 0);
}

/** Change in percent with one decimal, or null when there is no sensible starting value. */
export function calcGrowthPercent(from: number, to: number): number | null {
  if (!Number.isFinite(from) || !Number.isFinite(to) || from <= 0) return null;
  return Math.round(((to - from) / from) * 1000) / 10;
}
