import { Text, View } from 'react-native';

import { makeStyles, radii, typography, useColors } from '../../theme';

const BADGE_SIZE = 28;
/** The number stays inside the circle even when the system text size is very large. */
const MAX_FONT_SCALE = 1.3;

type RankBadgeProps = Readonly<{ rank: number; trendId: string }>;

/** The place of a wave in the list. Decoration only: screen readers get the order from the list. */
export function RankBadge({ rank, trendId }: RankBadgeProps) {
  const styles = useStyles();
  const colors = useColors();
  const first = rank === 1;
  return (
    <View
      testID={`trend-rank-${trendId}`}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.badge, { backgroundColor: first ? colors.accent : colors.surfaceMuted }]}
    >
      <Text
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        style={[styles.rank, { color: first ? colors.onAccent : colors.textMuted }]}
      >
        {rank}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  badge: {
    minWidth: BADGE_SIZE,
    minHeight: BADGE_SIZE,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rank: { ...typography.figureSmall },
}));
