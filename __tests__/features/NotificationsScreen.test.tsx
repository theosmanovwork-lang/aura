import { fireEvent, render, screen } from '@testing-library/react-native';

import { demoNotifications } from '../../src/data/seed/demoNotifications';
import { NotificationsScreen } from '../../src/features/notifications/NotificationsScreen';
import { ru } from '../../src/i18n/ru';

const renderNotes = (props: Partial<Parameters<typeof NotificationsScreen>[0]> = {}) =>
  render(<NotificationsScreen onBack={jest.fn()} {...props} />);

const unreadCount = () => screen.queryAllByTestId(/^unread-/).length;

describe('NotificationsScreen', () => {
  test('groups the news under «Сегодня» and «Вчера» with red dots on unread ones', async () => {
    await renderNotes();

    expect(screen.getByText(ru.notifications.groups.today)).toBeTruthy();
    expect(screen.getByText(ru.notifications.groups.yesterday)).toBeTruthy();
    expect(screen.getAllByTestId(/^notice-/)).toHaveLength(demoNotifications.length);
    expect(unreadCount()).toBe(3);
  });

  test('«Прочитать все» removes every dot', async () => {
    await renderNotes();

    await fireEvent.press(screen.getByTestId('read-all'));

    expect(unreadCount()).toBe(0);
  });

  test('opening one news item reads it and reports it', async () => {
    const onOpen = jest.fn();
    await renderNotes({ onOpen });

    await fireEvent.press(screen.getByTestId('notice-n1'));

    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'n1', target: 'lot' }));
    expect(unreadCount()).toBe(2);
  });

  test('the filters keep only their kind; clan news show only under «Все»', async () => {
    await renderNotes();

    await fireEvent.press(screen.getByTestId('filter-auction'));
    expect(screen.getAllByTestId(/^notice-/)).toHaveLength(2);

    await fireEvent.press(screen.getByTestId('filter-invest'));
    expect(screen.getAllByTestId(/^notice-/)).toHaveLength(1);

    await fireEvent.press(screen.getByTestId('filter-social'));
    expect(screen.getAllByTestId(/^notice-/)).toHaveLength(2);
    expect(screen.queryByText(ru.notifications.groups.today)).toBeTruthy();
  });

  test('back calls onBack', async () => {
    const onBack = jest.fn();
    await renderNotes({ onBack });

    await fireEvent.press(screen.getByRole('button', { name: ru.notifications.back }));

    expect(onBack).toHaveBeenCalled();
  });
});
