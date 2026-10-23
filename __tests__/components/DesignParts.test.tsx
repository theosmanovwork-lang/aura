import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Avatar } from '../../src/components/Avatar';
import { AuraCoin, AuraGlyph } from '../../src/components/AuraIcon';
import { EmptyState } from '../../src/components/EmptyState';
import { Glyph } from '../../src/components/Glyph';
import { SilverView } from '../../src/components/SilverView';
import { CardSlab } from '../../src/features/cards/CardSlab';
import { RARITY_STYLES } from '../../src/features/cards/rarity';
import { ru } from '../../src/i18n/ru';

describe('Avatar', () => {
  test('shows the letter in a circle that is half its size', async () => {
    await render(<Avatar testID="a" initial="К" tone="brand" size={40} />);

    expect(screen.getByText('К')).toBeTruthy();
    expect(screen.getByTestId('a').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderRadius: 20 })]),
    );
  });

  test('a clan has a rounded square instead of a circle', async () => {
    await render(<Avatar testID="a" initial="Н" tone="silver" size={40} square />);

    const style = [screen.getByTestId('a').props.style].flat(2);
    expect(style).toEqual(expect.arrayContaining([expect.objectContaining({ borderRadius: 16 })]));
  });

  test.each(['brand', 'green', 'ink', 'amber', 'red', 'silver'] as const)(
    'the %s tone draws',
    async (tone) => {
      await render(<Avatar initial="Я" tone={tone} size={30} />);

      expect(screen.getByText('Я')).toBeTruthy();
    },
  );
});

describe('icons', () => {
  test('the Aura coin and its glyph are decorative: screen readers skip them', async () => {
    await render(
      <>
        <AuraCoin testID="coin" tone="light" />
        <AuraGlyph testID="glyph" color="#000000" />
        <Glyph testID="glyph-play" name="video" color="#000000" filled />
      </>,
    );

    for (const id of ['coin', 'glyph', 'glyph-play']) {
      expect(screen.getByTestId(id, { hidden: true }).props.accessibilityElementsHidden).toBe(true);
    }
  });
});

describe('SilverView and EmptyState', () => {
  test('SilverView draws its children', async () => {
    await render(
      <SilverView>
        <Text>внутри</Text>
      </SilverView>,
    );

    expect(screen.getByText('внутри')).toBeTruthy();
  });

  test('EmptyState shows the title, the hint and the button', async () => {
    await render(
      <EmptyState
        icon={<Text>i</Text>}
        title="Пусто"
        text="Здесь пока ничего"
        action={<Text>Сделать</Text>}
      />,
    );

    expect(screen.getByText('Пусто')).toBeTruthy();
    expect(screen.getByText('Здесь пока ничего')).toBeTruthy();
    expect(screen.getByText('Сделать')).toBeTruthy();
  });
});

describe('CardSlab', () => {
  test.each(['common', 'rare', 'special', 'treasure'] as const)(
    'a %s card has a spoken name and the car',
    async (rarity) => {
      await render(
        <CardSlab
          testID="card"
          rarity={rarity}
          no="#071"
          name="Дедова классика"
          grade="9.5"
          rarityLabel={ru.cards.rarity[rarity]}
          carLabel={ru.cards.carAlt[rarity]}
          topLeft={ru.cards.rarity[rarity]}
          topRight="02:14:38"
        />,
      );

      expect(screen.getByTestId('card').props.accessibilityLabel).toBe(
        `Дедова классика, ${ru.cards.rarity[rarity]}, #071`,
      );
      expect(screen.getByText('02:14:38')).toBeTruthy();
      expect(screen.getByText('9.5')).toBeTruthy();
    },
  );

  test('the rarer the card, the more diamonds are lit', () => {
    const lit = (['common', 'rare', 'special', 'treasure'] as const).map(
      (r) => RARITY_STYLES[r].pipsLit,
    );

    expect(lit).toEqual([1, 2, 3, 4]);
  });

  test('only the treasure and the special cards sparkle; only the treasure has foil', () => {
    expect(RARITY_STYLES.common.sparkle).toBeNull();
    expect(RARITY_STYLES.special.sparkle).not.toBeNull();
    expect(RARITY_STYLES.treasure.foil).not.toBeNull();
    expect(RARITY_STYLES.rare.foil).toBeNull();
  });
});
