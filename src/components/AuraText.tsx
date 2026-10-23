import { StyleSheet, Text, type TextProps } from 'react-native';

import { ru } from '../i18n/ru';
import { auraWordStyle } from '../theme';

const WORD = ru.wallet.sparks[0];

type AuraTextProps = Omit<TextProps, 'children'> & Readonly<{ children: string }>;

/** A text in which every «Аура» (the currency, never declined) is set in its own serif italic style. */
export function AuraText({ children, ...rest }: AuraTextProps) {
  if (children === WORD)
    return (
      <Text {...rest} style={[rest.style, styles.word]}>
        {children}
      </Text>
    );
  const parts = children.split(WORD);
  if (parts.length === 1) return <Text {...rest}>{children}</Text>;

  return (
    <Text {...rest}>
      {parts.flatMap((part, index) =>
        index === 0
          ? [part]
          : [
              <Text key={index} style={styles.word}>
                {WORD}
              </Text>,
              part,
            ],
      )}
    </Text>
  );
}

const styles = StyleSheet.create({ word: auraWordStyle });
