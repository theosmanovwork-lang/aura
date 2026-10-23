import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../../theme';
import { describeGrowth, formatGrowth } from './format';
import { growthColor } from './growthColor';

type GrowthPillProps = Readonly<{
  percent: number | null;
  trendId: string;
  /** The bigger variant for the top of a trend screen. */
  large?: boolean;
}>;

const pillBackground = (percent: number | null): string => {
  if (percent === null || percent === 0) return colors.surfaceMuted;
  return percent > 0 ? colors.positiveSoft : colors.negativeSoft;
};

/** Growth over the last day in a tinted pill: green for growth, red for a fall, grey otherwise. */
export function GrowthPill({ percent, trendId, large = false }: GrowthPillProps) {
  return (
    <View
      testID={`growth-pill-${trendId}`}
      style={[styles.pill, { backgroundColor: pillBackground(percent) }]}
    >
      <Text
        style={[large ? styles.large : styles.small, { color: growthColor(percent) }]}
        accessibilityLabel={describeGrowth(percent)}
      >
        {formatGrowth(percent)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.pill,
  },
  small: { ...typography.caption, fontWeight: '700' },
  large: { ...typography.bodyStrong },
});
