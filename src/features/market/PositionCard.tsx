import { StyleSheet, Text, View } from 'react-native';

import { AuraText } from '../../components/AuraText';
import type { Investment } from '../../domain/investment';
import { formatPoints } from '../../i18n/format';
import { ru } from '../../i18n/ru';
import { colors, radii, spacing, typography } from '../../theme';
import { formatPrice } from './marketFormat';

type PositionCardProps = Readonly<{ position: Investment; value: number }>;

const MINUS = '−';

/** What the user has put into the video, what it is worth now and the difference. */
export function PositionCard({ position, value }: PositionCardProps) {
  const texts = ru.market.position;
  const diff = Math.round((value - position.invested) * 100) / 100;
  const sign = diff > 0 ? '+' : diff < 0 ? MINUS : '';
  const result = `${sign}${formatPrice(Math.abs(diff))}`;

  return (
    <View testID="position-card" style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        {texts.title}
      </Text>
      <Line
        label={texts.invested}
        value={`${formatPoints(position.invested)} ${ru.wallet.sparks[0]}`}
      />
      <Line label={texts.now} value={`${formatPrice(value)} ${ru.wallet.sparks[0]}`} />
      <Line label={texts.result} value={result} />
    </View>
  );
}

function Line({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <View style={styles.line}>
      <Text style={styles.label}>{label}</Text>
      <AuraText style={styles.value}>{value}</AuraText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.panel,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: { ...typography.heading, color: colors.text },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  label: { ...typography.bodySmall, color: colors.textMuted },
  value: { ...typography.figure, color: colors.text },
});
