import { createMemoryRepositories } from '../../src/data/memory';
import { NotFoundError } from '../../src/data/repositories';
import { seed } from '../../src/data/seed';
import { COMMENT_COOLDOWN_MS, CommentRuleError } from '../../src/domain/comment';
import { loadComments, postComment } from '../../src/features/comments/commentService';

const NOW = Date.UTC(2026, 5, 1);
const setup = () => createMemoryRepositories(seed);

describe('postComment', () => {
  test('saves a cleaned comment that then shows first in the list', async () => {
    const repos = setup();

    const comment = await postComment(repos, 'user-me', 'video-1', '  Отлично  ', NOW);
    const list = await loadComments(repos, 'video-1');

    expect(comment.text).toBe('Отлично');
    expect(list[0]?.comment.id).toBe(comment.id);
    expect(list[0]?.authorName).toBe('mira.wav');
  });

  test('refuses an unknown or unpublished video', async () => {
    const repos = setup();

    await expect(postComment(repos, 'user-me', 'nope', 'Привет', NOW)).rejects.toThrow(
      NotFoundError,
    );
    await expect(postComment(repos, 'user-me', 'video-8', 'Привет', NOW)).rejects.toThrow(
      NotFoundError,
    );
  });

  test('refuses an empty text, a quick second comment and a repeat', async () => {
    const repos = setup();
    await postComment(repos, 'user-me', 'video-1', 'Первый', NOW);

    await expect(postComment(repos, 'user-me', 'video-1', '   ', NOW + 9999)).rejects.toMatchObject(
      {
        code: 'empty',
      },
    );
    await expect(postComment(repos, 'user-me', 'video-1', 'Второй', NOW + 1)).rejects.toMatchObject(
      {
        code: 'too_fast',
      },
    );
    await expect(
      postComment(repos, 'user-me', 'video-1', 'первый', NOW + COMMENT_COOLDOWN_MS),
    ).rejects.toBeInstanceOf(CommentRuleError);
  });

  test('two quick sends of the same text save only one comment', async () => {
    const repos = setup();

    const results = await Promise.allSettled([
      postComment(repos, 'user-me', 'video-1', 'Раз', NOW),
      postComment(repos, 'user-me', 'video-1', 'Раз', NOW),
    ]);

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const mine = (await loadComments(repos, 'video-1')).filter(
      (v) => v.comment.authorId === 'user-me',
    );
    expect(mine).toHaveLength(1);
  });

  test('the same text under another video is fine', async () => {
    const repos = setup();
    await postComment(repos, 'user-me', 'video-1', 'Раз', NOW);

    await expect(postComment(repos, 'user-me', 'video-2', 'Раз', NOW)).resolves.toBeTruthy();
  });
});

describe('loadComments', () => {
  test('shows demo comments of the seed with the names of their authors', async () => {
    const repos = setup();

    const list = await loadComments(repos, 'video-1');

    expect(list.length).toBeGreaterThan(0);
    expect(list.every((view) => view.authorName.length > 0)).toBe(true);
  });

  test('an author who is missing gets an empty name instead of breaking the list', async () => {
    const repos = createMemoryRepositories({
      comments: [{ id: 'c', videoId: 'v', authorId: 'ghost', text: 'Привет', createdAt: 1 }],
    });

    const list = await loadComments(repos, 'v');

    expect(list).toHaveLength(1);
    expect(list[0]?.authorName).toBe('');
  });
});
