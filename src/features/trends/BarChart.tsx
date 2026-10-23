import { StyleSheet, View } from 'react-native';

import { ru } from '../../i18n/ru';
import { colors } from '../../theme';
import { barHeights } from './chartMath';

type BarChartProps = Readonly<{ values: readonly number[]; height: number }>;

const MIN_BAR_HEIGHT = 3;
const BAR_GAP = 2;

/** A simple bar chart; the newest value (last bar) is highlighted. */
export function BarChart({ values, height }: BarChartProps) {
  const heights = barHeights(values, height, MIN_BAR_HEIGHT);
  return (
    <View accessible accessibilityLabel={ru.trends.chartLabel} style={[styles.chart, { height }]}>
      {heights.map((barHeight, index) => (
        <View
          key={index}
          testID="chart-bar"
          style={[
            styles.bar,
            { height: barHeight },
            index === heights.length - 1 && styles.lastBar,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: BAR_GAP },
  bar: { flex: 1, borderRadius: 2, backgroundColor: colors.chartBar },
  lastBar: { backgroundColor: colors.primary },
});
