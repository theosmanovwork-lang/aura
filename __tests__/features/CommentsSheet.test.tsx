import { act, fireEvent, render, screen, within } from '@testing-library/react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { MAX_COMMENT_LENGTH } from '../../src/domain/comment';
import { CommentsSheet } from '../../src/features/comments/CommentsSheet';
import { ru } from '../../src/i18n/ru';

const USER = 'user-me';

async function renderSheet(
  videoId: string | null = 'video-1',
  prepare?: (repos: ReturnType<typeof createMemoryRepositories>) => Promise<void>,
) {
  const repos = createMemoryRepositories(seed);
  await prepare?.(repos);
  const onClose = jest.fn();
  const onCountChange = jest.fn();
  await render(
    <RepositoriesProvider repositories={repos}>
      <CommentsSheet
        videoId={videoId}
        userId={USER}
        onClose={onClose}
        onCountChange={onCountChange}
      />
    </RepositoriesProvider>,
  );
  return { repos, onClose, onCountChange };
}

const type = async (text: string) =>
  fireEvent.changeText(await screen.findByTestId('comment-input'), text);

describe('CommentsSheet', () => {
  test('stays closed without a video', async () => {
    await renderSheet(null);

    expect(screen.queryByTestId('comments-sheet')).toBeNull();
  });

  test('shows the title with the count and the comments, newest first', async () => {
    await renderSheet();

    const rows = await screen.findAllByTestId('comment-row');
    expect(rows).toHaveLength(3);
    expect(within(rows[0]!).getByText('Хочу продолжение с Марсом')).toBeTruthy();
    expect(screen.getByText('3 комментария')).toBeTruthy();
  });

  test('says so when a video has no comments yet', async () => {
    await renderSheet('video-2');

    expect(await screen.findByText(ru.comments.empty)).toBeTruthy();
  });

  test('sending a comment adds it to the list, clears the field and reports the new count', async () => {
    const { onCountChange } = await renderSheet('video-2');
    await screen.findByText(ru.comments.empty);

    await type('  Всем привет  ');
    await fireEvent.press(screen.getByTestId('comment-send'));

    expect(await screen.findByText('Всем привет')).toBeTruthy();
    expect(screen.getByTestId('comment-input').props.value).toBe('');
    expect(onCountChange).toHaveBeenCalledWith('video-2', 1);
  });

  test('an empty text cannot be sent: the button stays off and nothing is saved', async () => {
    const { repos } = await renderSheet('video-2');
    await screen.findByText(ru.comments.empty);

    await type('   ');
    expect(screen.getByTestId('comment-send').props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(screen.getByTestId('comment-send'));

    expect(await repos.comments.listByVideo('video-2')).toHaveLength(0);
  });

  test('a quick reaction chip sends that word as a comment', async () => {
    const { repos } = await renderSheet('video-2');
    await screen.findByText(ru.comments.empty);

    await fireEvent.press(screen.getByTestId(`reaction-${ru.comments.reactions[0]}`));

    expect(await screen.findByTestId('comment-row')).toHaveTextContent(ru.comments.reactions[0], {
      exact: false,
    });
    expect((await repos.comments.listByVideo('video-2')).map((c) => c.text)).toEqual([
      ru.comments.reactions[0],
    ]);
  });

  test('the author of the video gets the «автор» mark', async () => {
    await renderSheet('video-1', async (repos) => {
      const video = (await repos.videos.getById('video-1'))!;
      await repos.comments.add({
        id: 'c-author',
        videoId: 'video-1',
        authorId: video.authorId,
        text: 'спасибо всем',
        createdAt: Date.now(),
      });
    });

    const rows = await screen.findAllByTestId('comment-row');

    expect(screen.getAllByText(ru.comments.byAuthor)).toHaveLength(1);
    expect(within(rows[0]!).getByText(ru.comments.byAuthor)).toBeTruthy();
  });

  test('the heart under a comment can be switched on and off', async () => {
    await renderSheet();
    const hearts = await screen.findAllByTestId('comment-like');

    await fireEvent.press(hearts[0]!);
    expect(screen.getAllByTestId('comment-like')[0]!.props.accessibilityState.selected).toBe(true);

    await fireEvent.press(screen.getAllByTestId('comment-like')[0]!);
    expect(screen.getAllByTestId('comment-like')[0]!.props.accessibilityState.selected).toBe(false);
  });

  test('a text over the limit is refused and kept in the field', async () => {
    await renderSheet('video-2');
    await screen.findByText(ru.comments.empty);

    await type('а'.repeat(MAX_COMMENT_LENGTH + 1));
    await fireEvent.press(screen.getByTestId('comment-send'));

    expect(await screen.findByText(ru.comments.errors.too_long)).toBeTruthy();
    expect(screen.getByTestId('comment-input').props.value).toHaveLength(MAX_COMMENT_LENGTH + 1);
  });

  test('a second comment right away is refused with a hint, the text stays', async () => {
    await renderSheet('video-2');
    await screen.findByText(ru.comments.empty);
    await type('Первый');
    await fireEvent.press(screen.getByTestId('comment-send'));
    await screen.findByText('Первый');

    await type('Второй');
    await fireEvent.press(screen.getByTestId('comment-send'));

    expect(await screen.findByText(ru.comments.errors.too_fast)).toBeTruthy();
    expect(screen.getByTestId('comment-input').props.value).toBe('Второй');
  });

  test('a storage failure shows a general error instead of crashing', async () => {
    const { repos } = await renderSheet('video-2');
    await screen.findByText(ru.comments.empty);
    jest.spyOn(repos.comments, 'add').mockRejectedValueOnce(new Error('disk'));

    await type('Привет');
    await fireEvent.press(screen.getByTestId('comment-send'));

    expect(await screen.findByText(ru.comments.errors.other)).toBeTruthy();
  });

  test('a failed load shows an error with a retry button', async () => {
    const repos = createMemoryRepositories(seed);
    jest.spyOn(repos.comments, 'listByVideo').mockRejectedValueOnce(new Error('disk'));
    await render(
      <RepositoriesProvider repositories={repos}>
        <CommentsSheet
          videoId="video-1"
          userId={USER}
          onClose={jest.fn()}
          onCountChange={jest.fn()}
        />
      </RepositoriesProvider>,
    );

    expect(await screen.findByText(ru.comments.error)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: ru.comments.retry }));
    expect(await screen.findAllByTestId('comment-row')).toHaveLength(3);
  });

  test('the close button and the dark area close the sheet', async () => {
    const { onClose } = await renderSheet();
    await screen.findAllByTestId('comment-row');

    await fireEvent.press(screen.getByTestId('comments-close'));
    await fireEvent.press(screen.getByTestId('comments-backdrop'));

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test('the counter shows up when the text nears the limit', async () => {
    await renderSheet('video-2');
    await screen.findByText(ru.comments.empty);

    await type('а'.repeat(250));

    expect(screen.getByText(`250 из ${MAX_COMMENT_LENGTH}`)).toBeTruthy();
    await act(async () => {});
  });
});

describe('CommentsSheet hardening', () => {
  test('two quick taps on send save one comment and show no false error', async () => {
    const { repos } = await renderSheet('video-2');
    await screen.findByText(ru.comments.empty);
    await type('Привет');

    await fireEvent.press(screen.getByTestId('comment-send'));
    await fireEvent.press(screen.getByTestId('comment-send'));

    await screen.findByText('Привет');
    expect(await repos.comments.listByVideo('video-2')).toHaveLength(1);
    expect(screen.queryByText(ru.comments.errors.duplicate)).toBeNull();
    expect(screen.queryByText(ru.comments.errors.too_fast)).toBeNull();
  });

  test('text typed while sending is kept', async () => {
    const { repos } = await renderSheet('video-2');
    await screen.findByText(ru.comments.empty);
    const original = repos.comments.add.bind(repos.comments);
    jest.spyOn(repos.comments, 'add').mockImplementationOnce(async (comment) => {
      await type('Уже набираю дальше');
      return original(comment);
    });
    await type('Первый');

    await fireEvent.press(screen.getByTestId('comment-send'));

    await screen.findByText('Первый');
    expect(screen.getByTestId('comment-input').props.value).toBe('Уже набираю дальше');
  });
});
