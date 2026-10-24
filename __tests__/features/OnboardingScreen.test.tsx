import { fireEvent, render, screen } from '@testing-library/react-native';

import { OnboardingScreen } from '../../src/features/onboarding/OnboardingScreen';
import { ageOn, checkNickname, daysInMonth } from '../../src/features/onboarding/nickname';
import { ru } from '../../src/i18n/ru';

const TODAY = new Date(2026, 9, 24);
const renderFlow = (onFinish = jest.fn()) =>
  render(<OnboardingScreen onFinish={onFinish} today={() => TODAY} />).then(() => onFinish);

const toNick = async () => fireEvent.press(screen.getByTestId('onboarding-start'));

describe('nickname rules', () => {
  test('tells empty, invalid, taken and free apart', () => {
    expect(checkNickname('')).toBe('empty');
    expect(checkNickname('ab')).toBe('invalid');
    expect(checkNickname('имя')).toBe('invalid');
    expect(checkNickname('a'.repeat(21))).toBe('invalid');
    expect(checkNickname('Kira')).toBe('taken');
    expect(checkNickname('mira.wav')).toBe('free');
  });

  test('counts whole years and days of a month', () => {
    expect(ageOn(new Date(2026, 9, 24), 24, 9, 2013)).toBe(13);
    expect(ageOn(new Date(2026, 9, 23), 24, 9, 2013)).toBe(12);
    expect(daysInMonth(1, 2024)).toBe(29);
    expect(daysInMonth(1, 2025)).toBe(28);
  });
});

describe('OnboardingScreen', () => {
  test('starts with the welcome and its three points', async () => {
    await renderFlow();

    expect(screen.getByText(ru.onboarding.welcome.title)).toBeTruthy();
    for (const [title] of ru.onboarding.welcome.props) expect(screen.getByText(title)).toBeTruthy();
  });

  test('«У меня уже есть аккаунт» leaves the flow', async () => {
    const onFinish = await renderFlow();

    await fireEvent.press(screen.getByTestId('onboarding-have-account'));

    expect(onFinish).toHaveBeenCalled();
  });

  test('a taken nickname shows the warning and blocks «Дальше»; a free one lets it go', async () => {
    await renderFlow();
    await toNick();

    expect(screen.getByText(ru.onboarding.nick.free)).toBeTruthy();
    await fireEvent.changeText(screen.getByTestId('nick-input'), 'kira');
    expect(screen.getByText(ru.onboarding.nick.taken)).toBeTruthy();
    expect(
      screen.getByText(ru.onboarding.nick.takenHint.replace('{name}', 'kira.wav')),
    ).toBeTruthy();
    expect(screen.getByTestId('nick-next').props.accessibilityState.disabled).toBe(true);

    await fireEvent.changeText(screen.getByTestId('nick-input'), 'kira.wav');
    expect(screen.getByTestId('nick-next').props.accessibilityState.disabled).toBe(false);
  });

  test('the age step blocks under 13 and says so; an adult sees the 18+ note', async () => {
    await renderFlow();
    await toNick();
    await fireEvent.press(screen.getByTestId('nick-next'));
    expect(screen.getByTestId('onboarding-step')).toHaveTextContent('2 / 3');
    expect(screen.getByText(ru.onboarding.age.note)).toBeTruthy();

    for (let i = 0; i < 15; i += 1) await fireEvent.press(screen.getByTestId('age-year-down'));
    expect(screen.getByText(ru.onboarding.age.tooYoung)).toBeTruthy();
    expect(screen.getByTestId('age-next').props.accessibilityState.disabled).toBe(true);
  });

  test('the day follows the month: 31 March becomes 28 when February comes', async () => {
    await renderFlow();
    await toNick();
    await fireEvent.press(screen.getByTestId('nick-next'));

    await fireEvent.press(screen.getByTestId('age-month-up'));
    for (let i = 0; i < 20; i += 1) await fireEvent.press(screen.getByTestId('age-day-down'));
    expect(screen.getByTestId('age-day')).toHaveTextContent('31');
    await fireEvent.press(screen.getByTestId('age-month-up'));

    expect(screen.getByTestId('age-day')).toHaveTextContent('28');
  });

  test('interests need three: the button asks for more, then counts and finishes', async () => {
    const onFinish = await renderFlow();
    await toNick();
    await fireEvent.press(screen.getByTestId('nick-next'));
    await fireEvent.press(screen.getByTestId('age-next'));
    expect(screen.getByTestId('onboarding-step')).toHaveTextContent('3 / 3');
    expect(screen.getByText(ru.onboarding.interests.go.replace('{n}', '5'))).toBeTruthy();

    for (const tag of ['Мемы', 'Авто', 'Музыка'])
      await fireEvent.press(screen.getByTestId(`tag-${tag}`));
    expect(screen.getByText(ru.onboarding.interests.more.replace('{n}', '1'))).toBeTruthy();
    expect(screen.getByTestId('interests-go').props.accessibilityState.disabled).toBe(true);

    await fireEvent.press(screen.getByTestId('tag-Игры'));
    await fireEvent.press(screen.getByTestId('interests-go'));

    expect(onFinish).toHaveBeenCalled();
  });

  test('back goes one step back', async () => {
    await renderFlow();
    await toNick();

    await fireEvent.press(screen.getByRole('button', { name: ru.onboarding.back }));

    expect(screen.getByTestId('onboarding-welcome')).toBeTruthy();
  });
});
