import { fireEvent, render, screen } from '@testing-library/react-native';

import { SettingsScreen } from '../../src/features/settings/SettingsScreen';
import { ru } from '../../src/i18n/ru';

describe('SettingsScreen', () => {
  test('groups the items under Account, Content, Help and Login', async () => {
    await render(<SettingsScreen />);

    for (const title of Object.values(ru.settings.groups)) {
      expect(screen.getByText(title).props.accessibilityRole).toBe('header');
    }
  });

  test('has an item for every line of the reference, all switched off for now', async () => {
    await render(<SettingsScreen />);

    const { darkMode, notifications, onboarding, states, brand, showcase, ...buttons } =
      ru.settings.items;
    expect(darkMode).toBeTruthy();
    expect([notifications, onboarding, states, brand, showcase]).toHaveLength(5);
    for (const label of Object.values(buttons)) {
      const item = screen.getByRole('button', { name: label });
      expect(item.props.accessibilityState.disabled).toBe(true);
    }
  });

  test('the notifications and the two mockup lines open their screens', async () => {
    const onOpen = jest.fn();
    await render(<SettingsScreen onOpen={onOpen} />);

    await fireEvent.press(screen.getByRole('button', { name: ru.settings.items.notifications }));
    await fireEvent.press(screen.getByRole('button', { name: ru.settings.items.onboarding }));
    await fireEvent.press(screen.getByRole('button', { name: ru.settings.items.states }));

    expect(onOpen.mock.calls.map(([target]) => target)).toEqual([
      'notifications',
      'onboarding',
      'states',
    ]);
  });

  test('the legal and privacy item is there, because that is where the rules will live', async () => {
    await render(<SettingsScreen />);

    expect(screen.getByText(ru.settings.items.legal)).toBeTruthy();
  });

  test('the dark theme switch is shown on and switched off', async () => {
    await render(<SettingsScreen />);

    const toggle = screen.getByRole('switch', { name: ru.settings.items.darkMode });
    expect(toggle.props.accessibilityState.checked).toBe(true);
    expect(toggle.props.accessibilityState.disabled).toBe(true);
  });

  test('says in one line that the items will start working later', async () => {
    await render(<SettingsScreen />);

    expect(screen.getByText(ru.settings.soon)).toBeTruthy();
  });
});
