import { fireEvent, render, screen } from '@testing-library/react-native';

import { demoClanProfile } from '../../src/data/seed/demoPeople';
import { ClanScreen } from '../../src/features/clan/ClanScreen';
import { ru } from '../../src/i18n/ru';

const renderClan = (props: Partial<Parameters<typeof ClanScreen>[0]> = {}) =>
  render(<ClanScreen clanId="clan-neon" onBack={jest.fn()} {...props} />);

describe('ClanScreen', () => {
  test('shows the name, the place in the world, the members count and the stats', async () => {
    await renderClan();

    expect(screen.getByText(demoClanProfile.name)).toBeTruthy();
    expect(screen.getByText(ru.clan.top.replace('{n}', '1'))).toBeTruthy();
    expect(
      screen.getByText(
        ru.clan.members.replace('{n}', '48').replace('{max}', '50').replace('{level}', '12'),
      ),
    ).toBeTruthy();
    expect(screen.getByText('128K')).toBeTruthy();
  });

  test('the weekly chest shows the progress in words and in segments', async () => {
    await renderClan();

    expect(
      screen.getByLabelText(ru.clan.chestSpoken.replace('{done}', '7').replace('{total}', '10')),
    ).toBeTruthy();
    expect(screen.getByText(/7 из 10/)).toBeTruthy();
  });

  test('lists the members with roles, and a member opens that profile', async () => {
    const onOpenUser = jest.fn();
    await renderClan({ onOpenUser });

    expect(screen.getByText(ru.clan.role.leader)).toBeTruthy();
    expect(screen.getByText(ru.clan.role.officer)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('member-denis_f'));

    expect(onOpenUser).toHaveBeenCalledWith('denis_f');
  });

  test('«Подать заявку» switches to «Заявка отправлена» and back', async () => {
    await renderClan();

    await fireEvent.press(screen.getByTestId('clan-join'));
    expect(screen.getByText(ru.clan.sent)).toBeTruthy();

    await fireEvent.press(screen.getByTestId('clan-join'));
    expect(screen.getByText(ru.clan.join)).toBeTruthy();
  });

  test('the chat button opens the clan chat', async () => {
    const onOpenChat = jest.fn();
    await renderClan({ onOpenChat });

    await fireEvent.press(screen.getByRole('button', { name: ru.clan.chat }));

    expect(onOpenChat).toHaveBeenCalled();
  });

  test('an unknown clan says so', async () => {
    await renderClan({ clanId: 'nope' });

    expect(screen.getByText(ru.clan.notFound)).toBeTruthy();
  });
});
