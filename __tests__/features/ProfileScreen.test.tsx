import { fireEvent, render, screen } from '@testing-library/react-native';

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

  test('tabs switch the empty state and report the selected one', async () => {
    await renderProfile();
    await screen.findByText('@гость');
    const likes = screen.getByRole('button', { name: ru.screens.profile.tabs.likes });
    expect(
      screen.getByRole('button', { name: ru.screens.profile.tabs.predictions }).props
        .accessibilityState.selected,
    ).toBe(true);

    await fireEvent.press(likes);

    expect(
      screen.getByRole('button', { name: ru.screens.profile.tabs.likes }).props.accessibilityState
        .selected,
    ).toBe(true);
    expect(screen.getByText(ru.screens.profile.subtitle)).toBeTruthy();
  });

  test('the page uses the dark background', async () => {
    const { toJSON } = await renderProfile();
    await screen.findByText('@гость');

    expect(JSON.stringify(toJSON())).toContain(colors.background);
  });
});
