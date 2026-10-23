import { Pressable, StyleSheet } from 'react-native';

import { AuraText } from '../../components/AuraText';
import { Icon } from '../../components/Icon';
import { formatPoints } from '../../i18n/format';
import { pluralRu } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { colors, iconSizes, radii, spacing, typography } from '../../theme';

type AuraPlateProps = Readonly<{ amount: number }>;

/** «12 214 Аура ›» above the author name: the Aura amount of the video; drawn, switched off for now. */
export function AuraPlate({ amount }: AuraPlateProps) {
  const text = `${formatPoints(amount)} ${pluralRu(amount, ru.wallet.sparks)}`;
  return (
    <Pressable
      testID="aura-plate"
      accessibilityRole="button"
      accessibilityLabel={text}
      accessibilityState={{ disabled: true }}
      disabled
      style={styles.plate}
    >
      <AuraText style={styles.text}>{text}</AuraText>
      <Icon name="chevron-forward" size={iconSizes.sm} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
});
