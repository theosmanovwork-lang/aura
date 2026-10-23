import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ru } from '../../i18n/ru';
import { colors, MIN_TOUCH_TARGET, spacing, typography } from '../../theme';

const INDICATOR_WIDTH = 24;
const IDLE_OPACITY = 0.6;

/** «Подписки | Для вас» drawn like the reference; both are switched off until feeds exist. */
export function FeedTopTabs() {
  return (
    <View accessibilityRole="tablist" style={styles.tabs}>
      <Pressable
        accessibilityRole="tab"
        accessibilityLabel={ru.feed.tabs.following}
        accessibilityState={{ disabled: true, selected: false }}
        disabled
        style={styles.tab}
      >
        <Text style={[styles.label, styles.idle]}>{ru.feed.tabs.following}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityLabel={ru.feed.tabs.forYou}
        accessibilityState={{ disabled: true, selected: true }}
        disabled
        style={styles.tab}
      >
        <Text style={[styles.label, styles.open]}>{ru.feed.tabs.forYou}</Text>
        <View style={styles.indicator} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  tab: {
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  label: { ...typography.bodyStrong, color: colors.text },
  idle: { opacity: IDLE_OPACITY },
  open: { ...typography.heading, lineHeight: 22 },
  indicator: {
    width: INDICATOR_WIDTH,
    height: 2,
    marginTop: spacing.xxs,
    backgroundColor: colors.text,
  },
});
