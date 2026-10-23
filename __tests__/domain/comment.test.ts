import {
  assertCanPostComment,
  COMMENT_COOLDOWN_MS,
  CommentRuleError,
  createComment,
  MAX_COMMENT_LENGTH,
  normalizeCommentText,
  type Comment,
} from '../../src/domain/comment';

const previous: Comment = {
  id: 'c1',
  videoId: 'v1',
  authorId: 'u1',
  text: 'Классное видео',
  createdAt: 10_000,
};

const codeOf = (run: () => unknown) => {
  try {
    run();
  } catch (error) {
    return error instanceof CommentRuleError ? error.code : 'other';
  }
  return 'none';
};

describe('normalizeCommentText', () => {
  test('trims the edges and squeezes inner whitespace', () => {
    expect(normalizeCommentText('  привет \n\n  мир  ')).toBe('привет мир');
  });
});

describe('assertCanPostComment', () => {
  test('accepts a normal text when there is no previous comment', () => {
    expect(() => assertCanPostComment('Отлично', null, 5000)).not.toThrow();
  });

  test('rejects an empty or blank text', () => {
    expect(codeOf(() => assertCanPostComment('   ', null, 5000))).toBe('empty');
  });

  test('rejects a text over the limit but accepts exactly the limit', () => {
    expect(codeOf(() => assertCanPostComment('а'.repeat(MAX_COMMENT_LENGTH + 1), null, 5000))).toBe(
      'too_long',
    );
    expect(() => assertCanPostComment('а'.repeat(MAX_COMMENT_LENGTH), null, 5000)).not.toThrow();
  });

  test('rejects a second comment sent too soon after the previous one', () => {
    const now = previous.createdAt + COMMENT_COOLDOWN_MS - 1;
    expect(codeOf(() => assertCanPostComment('Другой текст', previous, now))).toBe('too_fast');
  });

  test('allows a different text once the pause has passed', () => {
    const now = previous.createdAt + COMMENT_COOLDOWN_MS;
    expect(() => assertCanPostComment('Другой текст', previous, now)).not.toThrow();
  });

  test('rejects the same text twice in a row, ignoring spaces and case', () => {
    const now = previous.createdAt + COMMENT_COOLDOWN_MS * 10;
    expect(codeOf(() => assertCanPostComment('  КЛАССНОЕ   видео ', previous, now))).toBe(
      'duplicate',
    );
  });
});

describe('createComment', () => {
  test('returns a new comment with the cleaned text', () => {
    const comment = createComment({
      id: 'c2',
      videoId: 'v1',
      authorId: 'u2',
      text: '  Супер  ',
      createdAt: 20_000,
    });

    expect(comment).toEqual({
      id: 'c2',
      videoId: 'v1',
      authorId: 'u2',
      text: 'Супер',
      createdAt: 20_000,
    });
  });

  test('refuses an empty text', () => {
    expect(
      codeOf(() =>
        createComment({ id: 'c', videoId: 'v', authorId: 'u', text: ' ', createdAt: 1 }),
      ),
    ).toBe('empty');
  });
});
