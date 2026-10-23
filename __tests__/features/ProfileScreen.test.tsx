import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { CURRENT_USER_ID } from '../../src/data/seed';
import { formatPoints } from '../../src/i18n/format';
import { ru } from '../../src/i18n/ru';
import { ProfileScreen } from '../../src/features/profile/ProfileScreen';
import { WELCOME_BONUS_POINTS } from '../../src/features/wallet/walletService';
import { colors } from '../../src/theme';

const NOW = new Date(2026, 9, 22, 21, 5).getTime();

const renderProfile = async () => {
  const repos = createMemoryRepositories();
  await repos.users.create({ id: CURRENT_USER_ID, nickname: 'гость', createdAt: NOW });
  return render(
    <RepositoriesProvider repositories={repos}>
      <ProfileScreen now={() => NOW} />
    </RepositoriesProvider>,
  );
};

describe('ProfileScreen', () => {
  test('shows the nickname, the first letter in the avatar and the balance', async () => {
    await renderProfile();

    expect(await screen.findByText('@гость')).toBeTruthy();
    expect(screen.getByText('Г')).toBeTruthy();
    expect(screen.getByTestId('profile-balance')).toHaveTextContent(
      formatPoints(WELCOME_BONUS_POINTS),
      { exact: false },
    );
  });

  test('the add and menu buttons and the edit button are drawn but switched off', async () => {
    await renderProfile();
    await screen.findByText('@гость');

    for (const label of [
      ru.screens.profile.add,
      ru.screens.profile.menu,
      ru.screens.profile.edit,
    ]) {
      const button = screen.getByRole('button', { name: label });
      expect(button.props.accessibilityState.disabled).toBe(true);
    }
  });

  test('the tabs are icons: only the open one shows its name next to the icon', async () => {
    await renderProfile();
    await screen.findByText('@гость');

    expect(screen.getByTestId('profile-tab-label-predictions')).toBeTruthy();
    expect(screen.queryByTestId('profile-tab-label-videos')).toBeNull();
    expect(screen.queryByTestId('profile-tab-label-reposts')).toBeNull();
  });

  test('pressing an icon opens that tab and moves the name there', async () => {
    await renderProfile();
    await screen.findByText('@гость');

    await fireEvent.press(screen.getByRole('button', { name: ru.screens.profile.tabs.reposts }));

    expect(await screen.findByTestId('profile-tab-label-reposts')).toBeTruthy();
    expect(screen.queryByTestId('profile-tab-label-predictions')).toBeNull();
    const reposts = screen.getByRole('button', { name: ru.screens.profile.tabs.reposts });
    expect(reposts.props.accessibilityState.selected).toBe(true);
    expect(screen.getByText(ru.screens.profile.subtitle)).toBeTruthy();
  });

  test('there is a repost tab and no likes tab: aura replaces likes', async () => {
    await renderProfile();
    await screen.findByText('@гость');

    expect(screen.getByRole('button', { name: ru.screens.profile.tabs.reposts })).toBeTruthy();
    expect(screen.queryByText(/лайк/i)).toBeNull();
  });

  test('every tab icon has a comfortable touch area', async () => {
    await renderProfile();
    await screen.findByText('@гость');

    for (const key of ['videos', 'predictions', 'reposts'] as const) {
      const tab = screen.getByRole('button', { name: ru.screens.profile.tabs[key] });
      const style = StyleSheet.flatten(tab.props.style);
      expect(style.minHeight).toBeGreaterThanOrEqual(44);
      expect(style.minWidth).toBeGreaterThanOrEqual(44);
    }
  });

  test('the balance is read aloud in the currency aura', async () => {
    await renderProfile();
    await screen.findByText('@гость');

    expect(screen.getByLabelText(/1\s?000 аур/)).toBeTruthy();
  });

  test('the page uses the dark background', async () => {
    const { toJSON } = await renderProfile();
    await screen.findByText('@гость');

    expect(JSON.stringify(toJSON())).toContain(colors.background);
  });
});
