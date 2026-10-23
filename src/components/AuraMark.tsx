import { StyleSheet, Text } from 'react-native';

import { ru } from '../i18n/ru';
import { auraWordStyle, colors, iconSizes } from '../theme';

/** First letter of the currency word: the mark that takes the place of a heart. */
const GLYPH = ru.wallet.sparks[0].slice(0, 1);

/** A soft glow around the open mark, so the state does not rest on brightness alone. */
const GLOW_RADIUS = 8;

type AuraMarkProps = Readonly<{ active: boolean; testID?: string; size?: number }>;

/** The currency mark: a serif italic letter, bright when active and muted when not. */
export function AuraMark({ active, testID, size = iconSizes.lg }: AuraMarkProps) {
  return (
    <Text
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      allowFontScaling={false}
      style={[
        styles.mark,
        { fontSize: size, lineHeight: size + 4 },
        active ? styles.active : styles.idle,
      ]}
    >
      {GLYPH}
    </Text>
  );
}

const styles = StyleSheet.create({
  mark: { ...auraWordStyle },
  idle: { color: colors.text, opacity: 0.7 },
  active: {
    color: colors.like,
    opacity: 1,
    textShadowColor: colors.like,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: GLOW_RADIUS,
  },
});
