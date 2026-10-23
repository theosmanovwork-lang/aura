import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '../../components/Icon';
import { ru } from '../../i18n/ru';
import { colors, iconSizes, MIN_TOUCH_TARGET, spacing } from '../../theme';

type SoonActionProps = Readonly<{ icon: IconName; label: string; testID: string }>;

/** A control drawn like the reference but switched off until its feature exists. */
export function SoonAction({ icon, label, testID }: SoonActionProps) {
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

/** The reference's comment and share buttons, in a column under the working actions. */
export function SoonRail() {
  return (
    <View testID="soon-rail" style={styles.rail}>
      <SoonAction testID="soon-comments" icon="chatbubble-outline" label={ru.feed.soon.comments} />
      <SoonAction testID="soon-share" icon="arrow-redo-outline" label={ru.feed.soon.share} />
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
    opacity: 0.85,
  },
});
