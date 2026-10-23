import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { countLabel, formatCount } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { colors, iconSizes, MIN_TOUCH_TARGET, spacing, typography } from '../../theme';

type ActionRailProps = Readonly<{
  liked: boolean;
  likeCount: number;
  viewCount: number;
  onToggleLike: () => void;
}>;

/** The column of actions on the right edge of a video: the like and the number of views. */
export function ActionRail({ liked, likeCount, viewCount, onToggleLike }: ActionRailProps) {
  return (
    <View testID="action-rail" style={styles.rail}>
      <Pressable
        testID="like-button"
        accessibilityRole="button"
        accessibilityLabel={liked ? ru.feed.unlike : ru.feed.like}
        accessibilityState={{ selected: liked }}
        accessibilityValue={{ text: formatCount(likeCount) }}
        onPress={onToggleLike}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
      >
        <Icon
          testID="like-icon"
          name={liked ? 'heart' : 'heart-outline'}
          size={iconSizes.lg}
          color={liked ? colors.like : colors.text}
        />
        <Text style={styles.count}>{formatCount(likeCount)}</Text>
      </Pressable>

      <View
        testID="views-indicator"
        accessible
        accessibilityRole="text"
        accessibilityLabel={countLabel(viewCount, ru.feed.views)}
        style={styles.action}
      >
        <Icon name="eye-outline" size={iconSizes.lg} color={colors.text} />
        <Text style={styles.count}>{formatCount(viewCount)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { alignItems: 'center', gap: spacing.md },
  action: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  pressed: { opacity: 0.7 },
  count: {
    ...typography.figureSmall,
    color: colors.text,
    textShadowColor: colors.textShadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
