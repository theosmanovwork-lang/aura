import { renderRouter, screen } from 'expo-router/testing-library';

import RootLayout from '../app/_layout';
import HomeScreen from '../app/index';
import { ru } from '../src/i18n/ru';

describe('RootLayout', () => {
  test('renders the home screen inside the root stack', async () => {
    await renderRouter({ _layout: RootLayout, index: HomeScreen });

    expect(await screen.findByText(ru.home.greeting)).toBeTruthy();
  });
});
