import { fireEvent, render, screen } from '@testing-library/react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { CURRENT_USER_ID, seed } from '../../src/data/seed';
import { ProfileScreen } from '../../src/features/profile/ProfileScreen';
import { investInVideo } from '../../src/features/investments/investmentService';
import { placePrediction } from '../../src/features/predictions/predictionService';
import { ensureWelcomeBonus } from '../../src/features/wallet/walletService';
import { ru } from '../../src/i18n/ru';

const NOW = 7_000_000;

const renderProfile = async (onOpenSettings = jest.fn(), onOpenVideo = jest.fn()) => {
  const repos = createMemoryRepositories(seed);
  await ensureWelcomeBonus(repos, CURRENT_USER_ID, 0);
  await render(
    <RepositoriesProvider repositories={repos}>
      <ProfileScreen now={() => NOW} onOpenSettings={onOpenSettings} onOpenVideo={onOpenVideo} />
    </RepositoriesProvider>,
  );
  await screen.findByTestId('profile-avatar');
  return { repos, onOpenSettings };
};

describe('profile content', () => {
  test('opens on the video tab with an invitation to make the first video', async () => {
    await renderProfile();

    expect(screen.getByText(ru.screens.profile.videosEmptyTitle)).toBeTruthy();
    expect(screen.getByText(ru.screens.profile.subtitle)).toBeTruthy();
    expect(screen.getByTestId('profile-tab-label-videos')).toBeTruthy();
  });

  test('the repost tab explains what will appear there', async () => {
    await renderProfile();

    await fireEvent.press(screen.getByRole('button', { name: ru.screens.profile.tabs.reposts }));

    expect(screen.getByText(ru.screens.profile.repostsEmptyTitle)).toBeTruthy();
    expect(screen.getByText(ru.screens.profile.repostsEmptyText)).toBeTruthy();
  });

  test('the investments tab lists the predictions the user made', async () => {
    const { repos } = await renderProfile();
    const prediction = await placePrediction(repos, {
      userId: CURRENT_USER_ID,
      trendId: 'trend-neirokot',
      stake: 50,
      now: NOW,
    });

    await fireEvent.press(
      screen.getByRole('button', { name: ru.screens.profile.tabs.investments }),
    );

    expect(await screen.findByTestId(`prediction-row-${prediction.id}`)).toBeTruthy();
  });

  test('the investments tab lists what was put into videos, above the predictions', async () => {
    const { repos } = await renderProfile();
    await investInVideo(repos, {
      userId: CURRENT_USER_ID,
      videoId: 'video-1',
      amount: 100,
      now: NOW,
    });

    await fireEvent.press(
      screen.getByRole('button', { name: ru.screens.profile.tabs.investments }),
    );

    expect(await screen.findByText(ru.investments.title)).toBeTruthy();
    expect(screen.getAllByTestId(/^investment-row-/)).toHaveLength(1);
  });

  test('the investments tab says so when nothing was put in yet', async () => {
    await renderProfile();

    await fireEvent.press(
      screen.getByRole('button', { name: ru.screens.profile.tabs.investments }),
    );

    expect(await screen.findByText(ru.investments.empty)).toBeTruthy();
  });

  test('pressing a row of the investments opens the video page', async () => {
    const onOpenVideo = jest.fn();
    const { repos } = await renderProfile(jest.fn(), onOpenVideo);
    await investInVideo(repos, {
      userId: CURRENT_USER_ID,
      videoId: 'video-1',
      amount: 100,
      now: NOW,
    });
    await fireEvent.press(
      screen.getByRole('button', { name: ru.screens.profile.tabs.investments }),
    );

    await fireEvent.press(await screen.findByTestId(/^investment-row-/));

    expect(onOpenVideo).toHaveBeenCalledWith('video-1');
  });

  test('under the name there is the available amount with an info mark', async () => {
    await renderProfile();

    const line = screen.getByTestId('profile-available');
    expect(line).toHaveTextContent(ru.screens.profile.available, { exact: false });
    expect(line).toHaveTextContent('1 000', { exact: false });
    expect(screen.getByLabelText(ru.screens.profile.availableInfo)).toBeTruthy();
  });

  test('the menu button opens the settings', async () => {
    const { onOpenSettings } = await renderProfile();

    await fireEvent.press(screen.getByRole('button', { name: ru.screens.profile.menu }));

    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
