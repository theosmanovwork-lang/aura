import { act, fireEvent, render, screen, within } from '@testing-library/react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { MAX_COMMENT_LENGTH } from '../../src/domain/comment';
import { CommentsSheet } from '../../src/features/comments/CommentsSheet';
import { ru } from '../../src/i18n/ru';

const USER = 'user-me';

async function renderSheet(videoId: string | null = 'video-1') {
  const repos = createMemoryRepositories(seed);
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
    expect(screen.getByText(`${ru.comments.title} · 3 комментария`)).toBeTruthy();
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

  test('an empty text shows a hint and saves nothing', async () => {
    const { repos } = await renderSheet('video-2');
    await screen.findByText(ru.comments.empty);

    await type('   ');
    await fireEvent.press(screen.getByTestId('comment-send'));

    expect(await screen.findByText(ru.comments.errors.empty)).toBeTruthy();
    expect(await repos.comments.listByVideo('video-2')).toHaveLength(0);
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
