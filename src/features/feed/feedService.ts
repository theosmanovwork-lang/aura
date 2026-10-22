import type { Repositories } from '../../data/repositories';
import { NotFoundError } from '../../data/repositories';
import type { Video } from '../../domain/video';

export type FeedItem = Readonly<{ video: Video; liked: boolean }>;

/** Published videos, newest first, each with "did this user like it". */
export async function loadFeed(repos: Repositories, userId: string): Promise<FeedItem[]> {
  const [videos, likedIds] = await Promise.all([
    repos.videos.listPublished(),
    repos.likes.listVideoIds(userId),
  ]);
  const liked = new Set(likedIds);
  return videos.map((video) => ({ video, liked: liked.has(video.id) }));
}

const queues = new Map<string, Promise<unknown>>();

/** Runs tasks with the same key one after another, so quick repeated taps cannot interleave. */
function runInOrder<T>(key: string, task: () => Promise<T>): Promise<T> {
  const result = (queues.get(key) ?? Promise.resolve()).then(task, task);
  const tail = result.then(
    () => undefined,
    () => undefined,
  );
  queues.set(key, tail);
  void tail.then(() => {
    if (queues.get(key) === tail) queues.delete(key);
  });
  return result;
}

async function toggleLikeNow(
  repos: Repositories,
  userId: string,
  videoId: string,
  now: number,
): Promise<{ liked: boolean; likeCount: number }> {
  const video = await repos.videos.getById(videoId);
  if (!video) throw new NotFoundError('videos', videoId);

  const wasLiked = await repos.likes.has(userId, videoId);
  if (wasLiked) {
    await repos.likes.remove(userId, videoId);
  } else {
    await repos.likes.add({ userId, videoId, createdAt: now });
  }

  const likeCount = Math.max(0, video.likeCount + (wasLiked ? -1 : 1));
  try {
    await repos.videos.update(videoId, { likeCount });
  } catch (error) {
    // Put the like back the way it was so the like and the counter never disagree.
    if (wasLiked) await repos.likes.add({ userId, videoId, createdAt: now });
    else await repos.likes.remove(userId, videoId);
    throw error;
  }
  return { liked: !wasLiked, likeCount };
}

/**
 * Likes the video, or removes the like if it was already there, and keeps the counter in step.
 * Taps on the same video by the same user are processed one at a time.
 */
export function toggleLike(
  repos: Repositories,
  userId: string,
  videoId: string,
  now: number,
): Promise<{ liked: boolean; likeCount: number }> {
  return runInOrder(`${userId}:${videoId}`, () => toggleLikeNow(repos, userId, videoId, now));
}

/** Counts one view and returns the new total. */
export async function recordView(repos: Repositories, videoId: string): Promise<number> {
  const video = await repos.videos.getById(videoId);
  if (!video) throw new NotFoundError('videos', videoId);

  const viewCount = video.viewCount + 1;
  await repos.videos.update(videoId, { viewCount });
  return viewCount;
}
