import { fireEvent, render, screen } from '@testing-library/react-native';

import { demoDialogs } from '../../src/data/seed/demoCommunity';
import { ChatsScreen } from '../../src/features/chats/ChatsScreen';
import { ru } from '../../src/i18n/ru';

const unreadDialogs = demoDialogs.filter((d) => d.unread > 0);

describe('ChatsScreen', () => {
  test('has the title, the global chat with the online count and your clan with the weekly chest', async () => {
    await render(<ChatsScreen />);

    expect(screen.getByText(ru.chats.title)).toBeTruthy();
    expect(screen.getByTestId('global-chat')).toHaveTextContent('1 284', { exact: false });
    expect(screen.getByText(ru.chats.clan.yours)).toBeTruthy();
    expect(
      screen.getByText(ru.chats.clan.tasks.replace('{done}', '4').replace('{total}', '6')),
    ).toBeTruthy();
  });

  test('your clan opens its page', async () => {
    const onOpenClan = jest.fn();
    await render(<ChatsScreen onOpenClan={onOpenClan} />);

    await fireEvent.press(screen.getByTestId('my-clan'));

    expect(onOpenClan).toHaveBeenCalledWith('clan-neon');
  });

  test('lists every conversation with its last message', async () => {
    await render(<ChatsScreen />);

    for (const dialog of demoDialogs) {
      expect(screen.getByTestId(`dialog-${dialog.id}`)).toHaveTextContent(dialog.message, {
        exact: false,
      });
    }
  });

  test('counts the conversations with unread messages and says how many in each', async () => {
    await render(<ChatsScreen />);

    expect(
      screen.getByText(ru.chats.messagesSub.replace('{n}', String(unreadDialogs.length))),
    ).toBeTruthy();
    expect(screen.getByTestId('dialog-d2').props.accessibilityLabel).toContain(
      ru.chats.unread.replace('{n}', '14'),
    );
  });

  test('opening a conversation marks it as read', async () => {
    await render(<ChatsScreen />);

    await fireEvent.press(screen.getByTestId('dialog-d1'));

    expect(
      screen.getByText(ru.chats.messagesSub.replace('{n}', String(unreadDialogs.length - 1))),
    ).toBeTruthy();
    expect(screen.getByTestId('dialog-d1').props.accessibilityLabel).not.toContain('непрочитанных');
  });

  test('when everything is read the counter drops to zero', async () => {
    await render(<ChatsScreen />);

    for (const dialog of unreadDialogs)
      await fireEvent.press(screen.getByTestId(`dialog-${dialog.id}`));

    expect(screen.getByText(ru.chats.messagesSub.replace('{n}', '0'))).toBeTruthy();
  });

  test('the compose and search buttons are there for screen readers', async () => {
    await render(<ChatsScreen />);

    expect(screen.getByRole('button', { name: ru.chats.compose })).toBeTruthy();
    expect(screen.getByRole('button', { name: ru.chats.search })).toBeTruthy();
  });
});
