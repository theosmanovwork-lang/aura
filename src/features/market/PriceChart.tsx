import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { VideoSnapshot } from '../../domain/videoPrice';
import { ru } from '../../i18n/ru';
import { colors, MIN_TOUCH_TARGET, radii, spacing, typography } from '../../theme';
import { BarChart } from '../trends/BarChart';
import { filterHistory, PERIODS, type Period } from './marketFormat';

const CHART_HEIGHT = 140;

type PriceChartProps = Readonly<{ history: readonly VideoSnapshot[]; now: number }>;

/** The price history as bars, with the periods «1Д 1Н 1М Всё» under it. */
export function PriceChart({ history, now }: PriceChartProps) {
  const [period, setPeriod] = useState<Period>('all');
  const prices = filterHistory(history, period, now).map((snapshot) => snapshot.price);

  return (
    <View testID="market-chart" style={styles.card}>
      <BarChart values={prices} height={CHART_HEIGHT} />
      <View
        accessibilityRole="tablist"
        accessibilityLabel={ru.market.periodsLabel}
        style={styles.periods}
      >
        {PERIODS.map(({ key }) => {
          const selected = key === period;
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={ru.market.periods[key]}
              accessibilityState={{ selected }}
              onPress={() => setPeriod(key)}
              style={[styles.period, selected && styles.periodOpen]}
            >
              <Text style={[styles.periodText, selected && styles.periodTextOpen]}>
                {ru.market.periods[key]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.panel,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  periods: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  period: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  periodOpen: { backgroundColor: colors.surfaceMuted },
  periodText: { ...typography.figure, color: colors.textMuted },
  periodTextOpen: { color: colors.text },
});
