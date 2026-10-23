import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '../../components/Icon';
import { ru } from '../../i18n/ru';
import { MIN_TOUCH_TARGET, iconSizes, makeStyles, spacing, useColors } from '../../theme';

type SoonActionProps = Readonly<{ icon: IconName; label: string; testID: string }>;

/** A control drawn like the reference but switched off until its feature exists. */
export function SoonAction({ icon, label, testID }: SoonActionProps) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: true }}
      disabled
      style={styles.action}
    >
      <Icon name={icon} size={iconSizes.lg} color={colors.text} />
    </Pressable>
  );
}

/** The reference's repost and share buttons, in a column under the working actions. */
export function SoonRail() {
  const styles = useStyles();
  return (
    <View testID="soon-rail" style={styles.rail}>
      <SoonAction testID="soon-repost" icon="repeat" label={ru.feed.soon.repost} />
      <SoonAction testID="soon-share" icon="arrow-redo-outline" label={ru.feed.soon.share} />
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
    opacity: 0.85,
  },
}));
