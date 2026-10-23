import { Pressable, Text, View } from 'react-native';

import { AuraMark } from '../../components/AuraMark';
import { formatCount } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { MIN_TOUCH_TARGET, makeStyles, spacing, typography } from '../../theme';

type ActionRailProps = Readonly<{
  liked: boolean;
  likeCount: number;
  onToggleLike: () => void;
}>;

/** The column of actions on the right edge of a video: the Aura mark (the like) with its counter. */
export function ActionRail({ liked, likeCount, onToggleLike }: ActionRailProps) {
  const styles = useStyles();
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
        <AuraMark testID="like-icon" active={liked} />
        <Text style={styles.count}>{formatCount(likeCount)}</Text>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
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
}));
