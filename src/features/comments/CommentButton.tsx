import { Pressable, Text } from 'react-native';

import { Icon } from '../../components/Icon';
import { formatCount } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import {
  MIN_TOUCH_TARGET,
  iconSizes,
  makeStyles,
  spacing,
  typography,
  useColors,
} from '../../theme';

type CommentButtonProps = Readonly<{ count: number; onPress: () => void }>;

/** The comments button in the action rail: a speech bubble with the number of comments. */
export function CommentButton({ count, onPress }: CommentButtonProps) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <Pressable
      testID="comments-button"
      accessibilityRole="button"
      accessibilityLabel={ru.comments.open}
      accessibilityValue={{ text: formatCount(count) }}
      onPress={onPress}
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}
    >
      <Icon name="chatbubble-outline" size={iconSizes.lg} color={colors.text} />
      <Text style={styles.count}>{formatCount(count)}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
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
