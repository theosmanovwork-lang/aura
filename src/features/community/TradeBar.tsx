import { Pressable, Text } from 'react-native';

import { Glyph } from '../../components/Glyph';
import { useTabBarInset } from '../../components/useTabBarInset';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';

/** The black pill at the bottom: «Аукцион / Торги». It floats over the list. */
export function TradeBar() {
  const styles = useStyles();
  const colors = useColors();
  const bottom = useTabBarInset();
  return (
    <Pressable
      disabled
      accessibilityState={{ disabled: true }}
      testID="trade-button"
      accessibilityRole="button"
      accessibilityLabel={ru.community.trade}
      style={[styles.pill, { bottom: bottom + 8 }]}
    >
      <Glyph name="swap" size={22} color={colors.onPrimary} strokeWidth={2.2} />
      <Text style={[styles.text, { color: colors.onPrimary }]}>{ru.community.trade}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  pill: {
    position: 'absolute',
    alignSelf: 'center',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 18,
    paddingRight: 22,
    borderRadius: 26,
    backgroundColor: colors.primary,
    shadowColor: '#1A1A1A',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  text: { fontFamily: fontFamilies.extrabold, fontSize: 15 },
}));
