import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { AuraText } from '../../src/components/AuraText';
import { ru } from '../../src/i18n/ru';

describe('AuraText', () => {
  test('sets the currency word apart in its own style and leaves the rest alone', async () => {
    await render(<AuraText>{'Сколько Аура'}</AuraText>);

    const word = screen.getByText('Аура');
    expect(StyleSheet.flatten(word.props.style).fontStyle).toBe('italic');
    expect(StyleSheet.flatten(word.props.style).fontFamily).toBeTruthy();
    expect(screen.getByText('Сколько Аура')).toBeTruthy();
  });

  test('styles every occurrence', async () => {
    await render(<AuraText testID="t">{'Аура сгорит, Аура ничего не стоит'}</AuraText>);

    expect(screen.getAllByText('Аура')).toHaveLength(2);
  });

  test('a text without the word is shown as it is', async () => {
    await render(<AuraText>{'Что набирает популярность'}</AuraText>);

    expect(screen.getByText('Что набирает популярность')).toBeTruthy();
    expect(screen.queryByText('Аура')).toBeNull();
  });

  test('the word is the same in every form: it does not decline', () => {
    expect(new Set(ru.wallet.sparks).size).toBe(1);
    expect(ru.wallet.sparks[0]).toBe('Аура');
  });
});
