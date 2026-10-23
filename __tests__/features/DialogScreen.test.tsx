import { fireEvent, render, screen } from '@testing-library/react-native';

import { DialogScreen } from '../../src/features/dialog/DialogScreen';
import { ru } from '../../src/i18n/ru';

const renderDialog = (props: Partial<Parameters<typeof DialogScreen>[0]> = {}) =>
  render(<DialogScreen dialogId="d1" onBack={jest.fn()} {...props} />);

describe('DialogScreen', () => {
  test('shows who you write to, the day, the messages, the gift and the trade offer', async () => {
    await renderDialog();

    expect(screen.getByText('kira')).toBeTruthy();
    expect(screen.getByText(ru.dialog.online)).toBeTruthy();
    expect(screen.getByText(ru.dialog.today)).toBeTruthy();
    expect(screen.getByText('привет! видела твоё видео с закатом, топ')).toBeTruthy();
    expect(screen.getByText('Подарок: 200 ауры')).toBeTruthy();
    expect(screen.getByTestId('trade-offer')).toBeTruthy();
  });

  test('the send button is off until there is text, then the message appears and the field clears', async () => {
    await renderDialog();
    expect(screen.getByTestId('dialog-send').props.accessibilityState.disabled).toBe(true);

    await fireEvent.changeText(screen.getByTestId('dialog-input'), '  привет, kira  ');
    expect(screen.getByTestId('dialog-send').props.accessibilityState.disabled).toBe(false);
    await fireEvent.press(screen.getByTestId('dialog-send'));

    expect(screen.getByText('привет, kira')).toBeTruthy();
    expect(screen.getByTestId('dialog-input').props.value).toBe('');
  });

  test('accepting the trade closes the offer with the result', async () => {
    await renderDialog();

    await fireEvent.press(screen.getByTestId('trade-accept'));

    expect(screen.getByText(ru.dialog.accepted)).toBeTruthy();
    expect(screen.queryByTestId('trade-accept')).toBeNull();
  });

  test('declining the trade closes the offer with the result', async () => {
    await renderDialog();

    await fireEvent.press(screen.getByTestId('trade-decline'));

    expect(screen.getByText(ru.dialog.declined)).toBeTruthy();
  });

  test('the person at the top opens the profile, back goes back', async () => {
    const onBack = jest.fn();
    const onOpenProfile = jest.fn();
    await renderDialog({ onBack, onOpenProfile });

    await fireEvent.press(screen.getByTestId('dialog-profile'));
    await fireEvent.press(screen.getByRole('button', { name: ru.common.back }));

    expect(onOpenProfile).toHaveBeenCalledWith('kira');
    expect(onBack).toHaveBeenCalled();
  });
});
