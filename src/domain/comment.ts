export const MAX_COMMENT_LENGTH = 300;
/** The least time between two comments of one person under one video. */
export const COMMENT_COOLDOWN_MS = 3000;

export type Comment = Readonly<{
  id: string;
  videoId: string;
  authorId: string;
  text: string;
  createdAt: number;
}>;

export type CommentRuleCode = 'empty' | 'too_long' | 'too_fast' | 'duplicate';

export class CommentRuleError extends Error {
  constructor(readonly code: CommentRuleCode) {
    super(`comment:${code}`);
    this.name = 'CommentRuleError';
  }
}

/** Trims the edges and turns every run of whitespace into one space. */
export function normalizeCommentText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

const sameText = (a: string, b: string) =>
  normalizeCommentText(a).toLocaleLowerCase('ru') ===
  normalizeCommentText(b).toLocaleLowerCase('ru');

/**
 * Checks a new comment against the person's previous one under the same video.
 * There is no word filter: full moderation comes in a later stage.
 */
export function assertCanPostComment(
  text: string,
  previousByAuthor: Comment | null,
  now: number,
): void {
  const clean = normalizeCommentText(text);
  if (clean.length === 0) throw new CommentRuleError('empty');
  if (clean.length > MAX_COMMENT_LENGTH) throw new CommentRuleError('too_long');
  if (!previousByAuthor) return;
  if (now - previousByAuthor.createdAt < COMMENT_COOLDOWN_MS) {
    throw new CommentRuleError('too_fast');
  }
  if (sameText(clean, previousByAuthor.text)) throw new CommentRuleError('duplicate');
}

export function createComment(input: Comment): Comment {
  const text = normalizeCommentText(input.text);
  if (text.length === 0) throw new CommentRuleError('empty');
  if (text.length > MAX_COMMENT_LENGTH) throw new CommentRuleError('too_long');
  return { ...input, text };
}
