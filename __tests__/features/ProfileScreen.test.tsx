import { fireEvent, render, screen } from '@testing-library/react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { CURRENT_USER_ID, seed } from '../../src/data/seed';
import { investInVideo } from '../../src/features/investments/investmentService';
import { ProfileScreen } from '../../src/features/profile/ProfileScreen';
import { ensureWelcomeBonus, WELCOME_BONUS_POINTS } from '../../src/features/wallet/walletService';
import { formatPoints } from '../../src/i18n/format';
import { ru } from '../../src/i18n/ru';

const NOW = Date.UTC(2026, 5, 1);

const renderProfile = async (props: Partial<Parameters<typeof ProfileScreen>[0]> = {}) => {
  const repos = createMemoryRepositories(seed);
  await render(
    <RepositoriesProvider repositories={repos}>
      <ProfileScreen now={() => NOW} {...props} />
    </RepositoriesProvider>,
  );
  return repos;
};

describe('ProfileScreen', () => {
  test('shows the nickname, the first letter in the avatar and the balance', async () => {
    await renderProfile();

    expect(await screen.findByText('@гость')).toBeTruthy();
    expect(screen.getAllByText('Г').length).toBeGreaterThan(0);
    expect(screen.getByTestId('profile-balance')).toHaveTextContent(
      formatPoints(WELCOME_BONUS_POINTS),
      {
        exact: false,
      },
    );
  });

  test('shows the three numbers: balance, followers and the place today', async () => {
    await renderProfile();
    await screen.findByText('@гость');

    expect(screen.getByText(ru.screens.profile.stats.balance)).toBeTruthy();
    expect(screen.getByText(ru.screens.profile.stats.followers)).toBeTruthy();
    expect(screen.getByText(ru.screens.profile.stats.rank)).toBeTruthy();
    expect(screen.getByText('#3')).toBeTruthy();
  });

  test('the edit and tasks buttons are drawn and switched off', async () => {
    await renderProfile();
    await screen.findByText('@гость');

    for (const label of [ru.screens.profile.edit, ru.screens.profile.tasks]) {
      expect(screen.getByRole('button', { name: label }).props.accessibilityState.disabled).toBe(
        true,
      );
    }
  });

  test('the settings button opens the settings', async () => {
    const onOpenSettings = jest.fn();
    await renderProfile({ onOpenSettings });

    await fireEvent.press(await screen.findByRole('button', { name: ru.screens.profile.settings }));

    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  test('opens on the posts tab with an invitation to shoot the first video', async () => {
    await renderProfile();

    expect(await screen.findByText(ru.screens.profile.empty.posts[0])).toBeTruthy();
    expect(screen.getByText(ru.screens.profile.shoot)).toBeTruthy();
    expect(
      screen.getByRole('tab', { name: ru.screens.profile.tabs.posts }).props.accessibilityState
        .selected,
    ).toBe(true);
  });

  test('the other tabs explain what will be there and offer the feed', async () => {
    const onOpenFeed = jest.fn();
    await renderProfile({ onOpenFeed });
    await screen.findByText('@гость');

    await fireEvent.press(screen.getByRole('tab', { name: ru.screens.profile.tabs.reposts }));
    expect(screen.getByText(ru.screens.profile.empty.reposts[0])).toBeTruthy();

    await fireEvent.press(screen.getByRole('tab', { name: ru.screens.profile.tabs.investments }));
    expect(await screen.findByText(ru.screens.profile.empty.investments[0])).toBeTruthy();
    await fireEvent.press(screen.getByTestId('profile-empty-action'));
    expect(onOpenFeed).toHaveBeenCalledTimes(1);
  });

  test('the investments tab lists what was put into videos and opens the video page', async () => {
    const repos = createMemoryRepositories(seed);
    await ensureWelcomeBonus(repos, CURRENT_USER_ID, NOW);
    await investInVideo(repos, {
      userId: CURRENT_USER_ID,
      videoId: 'video-1',
      amount: 100,
      now: NOW,
    });
    const onOpenVideo = jest.fn();
    await render(
      <RepositoriesProvider repositories={repos}>
        <ProfileScreen now={() => NOW} onOpenVideo={onOpenVideo} />
      </RepositoriesProvider>,
    );

    await fireEvent.press(
      await screen.findByRole('tab', { name: ru.screens.profile.tabs.investments }),
    );
    const row = await screen.findByTestId(/investment-row-/);
    await fireEvent.press(row);

    expect(onOpenVideo).toHaveBeenCalledWith('video-1');
    expect(screen.getByTestId('profile-available')).toHaveTextContent('100', { exact: false });
  });

  test('a failed load shows an error with a retry button', async () => {
    const repos = createMemoryRepositories(seed);
    jest.spyOn(repos.videos, 'listPublished').mockRejectedValueOnce(new Error('disk'));
    await render(
      <RepositoriesProvider repositories={repos}>
        <ProfileScreen now={() => NOW} />
      </RepositoriesProvider>,
    );

    expect(await screen.findByText(ru.screens.profile.error)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: ru.screens.profile.retry }));
    expect(await screen.findByText('@гость')).toBeTruthy();
  });
});
