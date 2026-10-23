import { Pressable } from 'react-native';

import { AuraText } from '../../components/AuraText';
import { Icon } from '../../components/Icon';
import { formatPoints } from '../../i18n/format';
import { pluralRu } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { iconSizes, makeStyles, radii, spacing, typography, useColors } from '../../theme';

type AuraPlateProps = Readonly<{ amount: number; onPress?: () => void }>;

/** «12 214 Аура ›» above the author name; opens the page of the video when `onPress` is given. */
export function AuraPlate({ amount, onPress }: AuraPlateProps) {
  const styles = useStyles();
  const colors = useColors();
  const disabled = onPress === undefined;
  const text = `${formatPoints(amount)} ${pluralRu(amount, ru.wallet.sparks)}`;
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
      <AuraText style={styles.text}>{text}</AuraText>
      <Icon name="chevron-forward" size={iconSizes.sm} color={colors.text} />
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  plate: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  text: { ...typography.titleSmall, color: colors.text },
}));
