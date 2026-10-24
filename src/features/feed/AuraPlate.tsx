import { Pressable, Text } from 'react-native';

import { AuraCoin } from '../../components/AuraIcon';
import { Glyph } from '../../components/Glyph';
import { formatPoints } from '../../i18n/format';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles } from '../../theme';

type AuraPlateProps = Readonly<{ amount: number; onPress?: () => void }>;

/** «18 420 в пуле ›» above the author name; opens the page of the video when `onPress` is given. */
export function AuraPlate({ amount, onPress }: AuraPlateProps) {
  const styles = useStyles();
  const disabled = onPress === undefined;
  const text = ru.feed.pool.replace('{n}', formatPoints(amount));
  return (
    <Pressable
      testID="aura-plate"
      accessibilityRole="button"
      accessibilityLabel={text}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={styles.plate}
    >
      <AuraCoin size={20} tone="light" />
      <Text style={styles.text}>{formatPoints(amount)}</Text>
      <Glyph name="chevronRight" size={12} color="#FFFFFF" strokeWidth={3} />
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  plate: {
    alignSelf: 'flex-start',
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 5,
    paddingRight: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(26,26,26,0.55)',
  },
  text: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.onVideo },
}));
