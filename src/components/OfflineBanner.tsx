import { Text, View } from 'react-native';

import { ru } from '../i18n/ru';
import { fontFamilies, makeStyles } from '../theme';
import { Glyph } from './Glyph';

/** The black strip under the header when there is no network: what you see is saved, buying and bidding are off. */
export function OfflineBanner() {
  const styles = useStyles();
  return (
    <View testID="offline-banner" accessibilityRole="alert" style={styles.bar}>
      <Glyph name="wifiOff" size={18} color="#FFFFFF" strokeWidth={2.2} />
      <Text style={styles.text}>{ru.states.offline}</Text>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  bar: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1A1A1A',
  },
  text: { fontFamily: fontFamilies.bold, fontSize: 13, color: '#FFFFFF' },
}));
