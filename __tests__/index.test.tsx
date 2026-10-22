import { render, screen } from '@testing-library/react-native';

import HomeScreen from '../app/index';
import { ru } from '../src/i18n/ru';

describe('HomeScreen', () => {
  test('shows the Russian greeting from the i18n file', async () => {
    await render(<HomeScreen />);

    expect(screen.getByText(ru.home.greeting)).toBeTruthy();
    expect(screen.getByText(ru.home.subtitle)).toBeTruthy();
  });

  test('keeps greeting text in Russian', () => {
    expect(ru.home.greeting).toMatch(/[А-Яа-яЁё]/);
  });
});
