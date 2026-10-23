import { fireEvent, render, screen } from '@testing-library/react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { CURRENT_USER_ID, seed } from '../../src/data/seed';
import { investInVideo, takeFromVideo } from '../../src/features/investments/investmentService';
import { MyInvestments } from '../../src/features/investments/MyInvestments';
import { ensureWelcomeBonus } from '../../src/features/wallet/walletService';
import { ru } from '../../src/i18n/ru';

const NOW = Date.UTC(2026, 5, 1);
const TITLE = (id: string) => seed.videos.find((v) => v.id === id)!.title;

const setup = async () => {
  const repos = createMemoryRepositories(seed);
  await ensureWelcomeBonus(repos, CURRENT_USER_ID, 0);
  return repos;
};

const renderList = async (
  repos: ReturnType<typeof createMemoryRepositories>,
  onOpenVideo = jest.fn(),
) => {
  await render(
    <RepositoriesProvider repositories={repos}>
      <MyInvestments onOpenVideo={onOpenVideo} />
    </RepositoriesProvider>,
  );
  return onOpenVideo;
};

describe('MyInvestments', () => {
  test('says so when nothing has been put in yet', async () => {
    await renderList(await setup());

    expect(await screen.findByText(ru.investments.empty)).toBeTruthy();
  });

  test('lists each video with its title, state and result, the newest move first', async () => {
    const repos = await setup();
    await investInVideo(repos, {
      userId: CURRENT_USER_ID,
      videoId: 'video-1',
      amount: 100,
      now: NOW,
    });
    await investInVideo(repos, {
      userId: CURRENT_USER_ID,
      videoId: 'video-3',
      amount: 50,
      now: NOW + 10,
    });
    await takeFromVideo(repos, {
      userId: CURRENT_USER_ID,
      videoId: 'video-3',
      amount: 50,
      now: NOW + 20,
    });

    await renderList(repos);

    expect(await screen.findByText(ru.investments.title)).toBeTruthy();
    const rows = screen.getAllByTestId(/^investment-row-/);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent(TITLE('video-3'), { exact: false });
    expect(rows[0]).toHaveTextContent(ru.investments.closed, { exact: false });
    expect(rows[1]).toHaveTextContent(TITLE('video-1'), { exact: false });
    expect(rows[1]).toHaveTextContent(ru.investments.holding, { exact: false });
  });

  test('each row is read aloud as one sentence with the result', async () => {
    const repos = await setup();
    await investInVideo(repos, {
      userId: CURRENT_USER_ID,
      videoId: 'video-1',
      amount: 100,
      now: NOW,
    });

    await renderList(repos);

    const row = await screen.findByTestId(/^investment-row-/);
    expect(row.props.accessibilityLabel).toContain(TITLE('video-1'));
    expect(row.props.accessibilityLabel).toContain(ru.investments.result);
    expect(row.props.accessibilityLabel).toContain('Аура');
  });

  test('pressing a row opens the video page', async () => {
    const repos = await setup();
    await investInVideo(repos, {
      userId: CURRENT_USER_ID,
      videoId: 'video-1',
      amount: 100,
      now: NOW,
    });
    const onOpenVideo = await renderList(repos);

    await fireEvent.press(await screen.findByTestId(/^investment-row-/));

    expect(onOpenVideo).toHaveBeenCalledWith('video-1');
  });
});
