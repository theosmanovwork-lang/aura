import { Text, View } from 'react-native';

import { Glyph } from '../../components/Glyph';
import { SilverView } from '../../components/SilverView';
import { useTabBarInset } from '../../components/useTabBarInset';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';
import { PressableScale } from '../../motion/PressableScale';

/** The black button at the bottom: «Выставить карточку». It floats over the list. */
export function TradeBar() {
  const styles = useStyles();
  const colors = useColors();
  const bottom = useTabBarInset();
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: bottom + 16 }]}>
      <PressableScale
        disabled
        accessibilityState={{ disabled: true }}
        testID="trade-button"
        accessibilityRole="button"
        accessibilityLabel={ru.community.trade}
        style={styles.pill}
      >
        <SilverView style={styles.mark}>
          <Glyph name="plus" size={16} color="#1A1A1A" strokeWidth={2.8} />
        </SilverView>
        <Text style={[styles.text, { color: colors.onPrimary }]}>{ru.community.trade}</Text>
      </PressableScale>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  pill: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 18,
    paddingRight: 22,
    borderRadius: 16,
    backgroundColor: colors.primary,
    shadowColor: '#1A1A1A',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  mark: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fontFamilies.bold, fontSize: 15 },
}));
