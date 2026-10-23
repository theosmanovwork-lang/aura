import { LIKE_WEIGHT, VIEW_WEIGHT } from './trendScore';
import type { Video } from './video';

/** The price of a video at one moment. A row of these is the history shown on the chart. */
export type VideoSnapshot = Readonly<{
  videoId: string;
  at: number;
  price: number;
}>;

/**
 * Price of a video (a made-up number, not money): its views plus the weighted Aura it got.
 * Never below 1, so a brand-new video still has a price a position can be measured against.
 */
export function videoPrice(video: Pick<Video, 'viewCount' | 'likeCount'>): number {
  return Math.max(1, video.viewCount * VIEW_WEIGHT + video.likeCount * LIKE_WEIGHT);
}
