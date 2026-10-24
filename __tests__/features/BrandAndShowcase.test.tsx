import { render, screen } from '@testing-library/react-native';

import { GLYPH_NAMES } from '../../src/components/Glyph';
import { BrandScreen } from '../../src/features/brand/BrandScreen';
import { SplashView } from '../../src/features/brand/SplashView';
import { ShowcaseScreen } from '../../src/features/showcase/ShowcaseScreen';
import { ru } from '../../src/i18n/ru';

describe('SplashView', () => {
  test('shows the word, the tagline and a loader', async () => {
    await render(<SplashView progress={0.5} />);

    expect(screen.getByText('aura')).toBeTruthy();
    expect(screen.getByText(ru.brand.tagline)).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: ru.brand.loading })).toBeTruthy();
  });
});

describe('BrandScreen', () => {
  test('shows the logo on light and dark, three icons with the second one chosen, and the splash', async () => {
    await render(<BrandScreen onBack={jest.fn()} />);

    expect(screen.getByText(ru.brand.light)).toBeTruthy();
    expect(screen.getByText(ru.brand.dark)).toBeTruthy();
    for (const name of Object.values(ru.brand.iconNames))
      expect(screen.getByText(name)).toBeTruthy();
    expect(screen.getAllByText(ru.brand.chosen)).toHaveLength(1);
    expect(screen.getByTestId('splash')).toBeTruthy();
  });
});

describe('ShowcaseScreen', () => {
  test('lists every icon of the app and the four rarities of cards', async () => {
    await render(<ShowcaseScreen onBack={jest.fn()} />);

    expect(GLYPH_NAMES.length).toBeGreaterThan(30);
    for (const name of GLYPH_NAMES) expect(screen.getByTestId(`icon-${name}`)).toBeTruthy();
    for (const rarity of Object.values(ru.cards.rarity)) {
      expect(screen.getAllByText(rarity).length).toBeGreaterThan(0);
    }
  });
});
