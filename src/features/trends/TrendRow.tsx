import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatCount } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { colors, spacing, typography } from '../../theme';
import { BarChart } from './BarChart';
import { growthColor } from './growthColor';
import { describeGrowth, formatGrowth } from './format';
import type { TrendSummary } from './trendService';

const MINI_CHART_POINTS = 14;

type TrendRowProps = Readonly<{ summary: TrendSummary; onPress: (trendId: string) => void }>;

export function TrendRow({ summary, onPress }: TrendRowProps) {
  const { trend, score, growthPercent, history } = summary;
  const growthStyle = { color: growthColor(growthPercent) };

  return (
    <Pressable
      testID={`trend-row-${trend.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${trend.name}, ${ru.trends.index} ${formatCount(score)}, ${describeGrowth(growthPercent)}`}
      onPress={() => onPress(trend.id)}
      style={styles.row}
    >
      <View style={styles.main}>
        <Text style={styles.name}>{trend.name}</Text>
        <Text style={styles.index}>
          {ru.trends.index} <Text style={styles.score}>{formatCount(score)}</Text>
        </Text>
        <Text style={[styles.growth, growthStyle]}>{formatGrowth(growthPercent)}</Text>
      </View>
      <View style={styles.chart}>
        <BarChart values={history.slice(-MINI_CHART_POINTS)} height={36} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: spacing.md,
    backgroundColor: colors.surface,
  },
  main: { flex: 1, gap: spacing.xs },
  name: { ...typography.body, fontWeight: '700', color: colors.text },
  index: { ...typography.caption, color: colors.textMuted },
  score: { color: colors.text },
  growth: { ...typography.body, fontWeight: '700' },
  chart: { width: 96 },
});
