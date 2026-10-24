import type { Repositories } from '../../data/repositories';
import { NotFoundError } from '../../data/repositories';
import { assertCanPostComment, createComment, type Comment } from '../../domain/comment';
import { runInOrder } from '../runInOrder';

export type CommentView = Readonly<{
  comment: Comment;
  authorName: string;
  /** The comment was written by the author of the video. */
  byVideoAuthor: boolean;
}>;

/** Nicknames of the authors; a lookup that fails or finds nobody leaves that name empty. */
async function namesOf(repos: Repositories, comments: readonly Comment[]) {
  const ids = [...new Set(comments.map((comment) => comment.authorId))];
  const users = await Promise.all(ids.map((id) => repos.users.getById(id).catch(() => null)));
  return new Map(users.flatMap((user) => (user ? [[user.id, user.nickname] as const] : [])));
}

/** The comments of a video, newest first, each with its author's nickname. */
export async function loadComments(repos: Repositories, videoId: string): Promise<CommentView[]> {
  const [comments, video] = await Promise.all([
    repos.comments.listByVideo(videoId),
    repos.videos.getById(videoId).catch(() => null),
  ]);
  const names = await namesOf(repos, comments);
  return comments.map((comment) => ({
    comment,
    authorName: names.get(comment.authorId) ?? '',
    byVideoAuthor: video !== null && video.authorId === comment.authorId,
  }));
}

async function postCommentNow(
  repos: Repositories,
  userId: string,
  videoId: string,
  text: string,
  now: number,
): Promise<Comment> {
  const video = await repos.videos.getById(videoId);
  if (!video || video.moderationStatus !== 'published') {
    throw new NotFoundError('videos', videoId);
  }
  const previous = await repos.comments.getLatestByAuthor(userId, videoId);
  assertCanPostComment(text, previous, now);
  const comment = createComment({
    id: `comment-${userId}-${videoId}-${now}-${Math.random().toString(36).slice(2, 8)}`,
    videoId,
    authorId: userId,
    text,
    createdAt: now,
  });
  return repos.comments.add(comment);
}

/**
 * Leaves a comment under a published video. Sends by the same person under the same video are
 * handled one at a time, so a double tap cannot slip past the "same text twice" check.
 */
export function postComment(
  repos: Repositories,
  userId: string,
  videoId: string,
  text: string,
  now: number,
): Promise<Comment> {
  return runInOrder(`comment:${userId}:${videoId}`, () =>
    postCommentNow(repos, userId, videoId, text, now),
  );
}
