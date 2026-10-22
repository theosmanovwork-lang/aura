import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatCount } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { lightColors as colors, radii, spacing, typography } from '../../theme';
import { BarChart } from './BarChart';
import { describeGrowth } from './format';
import { GrowthPill } from './GrowthPill';
import { RankBadge } from './RankBadge';
import type { TrendSummary } from './trendService';

const MINI_CHART_POINTS = 14;
const MINI_CHART_WIDTH = 96;
const MINI_CHART_HEIGHT = 40;

type TrendRowProps = Readonly<{
  summary: TrendSummary;
  rank: number;
  onPress: (trendId: string) => void;
}>;

export function TrendRow({ summary, rank, onPress }: TrendRowProps) {
  const { trend, score, growthPercent, history } = summary;

  return (
    <Pressable
      testID={`trend-row-${trend.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${trend.name}, ${ru.trends.index} ${formatCount(score)}, ${describeGrowth(growthPercent)}`}
      onPress={() => onPress(trend.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <RankBadge rank={rank} trendId={trend.id} />
      <View style={styles.main}>
        <Text style={styles.name}>{trend.name}</Text>
        <Text style={styles.index}>
          {ru.trends.index} <Text style={styles.score}>{formatCount(score)}</Text>
        </Text>
        <GrowthPill percent={growthPercent} trendId={trend.id} />
      </View>
      <View style={styles.chart}>
        <BarChart values={history.slice(-MINI_CHART_POINTS)} height={MINI_CHART_HEIGHT} />
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
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.85 },
  main: { flex: 1, gap: spacing.xs },
  name: { ...typography.bodyStrong, color: colors.text },
  index: { ...typography.caption, color: colors.textMuted },
  score: { ...typography.caption, fontWeight: '700', color: colors.text },
  chart: { width: MINI_CHART_WIDTH },
});
