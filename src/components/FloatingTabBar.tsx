// Not re-exported from the package root, so the build path is the only way to get this type.
import type { BottomTabBarProps } from 'expo-router/build/layouts/Tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from './GlassSurface';
import { ru } from '../i18n/ru';
import { colors, MIN_TOUCH_TARGET, radii, spacing, TAB_BAR_HEIGHT, typography } from '../theme';

const MAX_FONT_SCALE = 1.2;

const spokenName = (title: string, position: number, total: number): string =>
  ru.a11y.tab
    .replace('{title}', title)
    .replace('{position}', String(position))
    .replace('{total}', String(total));

/** A rounded pill under the screen: the open tab shows icon and name, the others only the icon. */
export function FloatingTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
}: BottomTabBarProps) {
  const count = state.routes.length;

  return (
    <View style={[styles.strip, { paddingBottom: insets.bottom + spacing.sm }]}>
      <GlassSurface testID="tab-pill" accessibilityRole="tablist" style={styles.pill}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]!;
          const focused = state.index === index;
          const title = options.title ?? route.name;
          const color = focused ? colors.accent : colors.iconInactive;

          const onPress = () => {
            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };

          return (
            <Pressable
              key={route.key}
              testID={`tab-item-${route.name}`}
              accessibilityRole="button"
              accessibilityLabel={spokenName(title, index + 1, count)}
              accessibilityState={{ selected: focused }}
              onPress={onPress}
              style={styles.item}
            >
              {options.tabBarIcon?.({ focused, color, size: 24 })}
              <Text
                testID={`tab-label-${route.name}`}
                numberOfLines={1}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
                style={[styles.label, { color }]}
              >
                {title}
              </Text>
            </Pressable>
          );
        })}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
  },
  pill: {
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  item: {
    flex: 1,
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  label: { ...typography.tabLabel },
});
