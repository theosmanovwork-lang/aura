// Not re-exported from the package root, so the build path is the only way to get this type.
import type { BottomTabBarProps } from 'expo-router/build/layouts/Tabs';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, View } from 'react-native';

import {
  colors,
  lightColors,
  MIN_TOUCH_TARGET,
  radii,
  spacing,
  TAB_BAR_HEIGHT,
  typography,
} from '../theme';

/** Screens that are still dark; the strip under the pill matches the screen above it. */
const DARK_SCREENS: ReadonlySet<string> = new Set(['index']);

const LABEL_FADE_MS = 180;
const LABEL_MAX_WIDTH = 72;
const MAX_FONT_SCALE = 1.2;

type TabLabelProps = Readonly<{ name: string; text: string }>;

/** The name of the open tab; it fades in unless the phone asks for less motion. */
function TabLabel({ name, text }: TabLabelProps) {
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let cancelled = false;
    const start = (reduceMotion: boolean) => {
      if (cancelled) return;
      if (reduceMotion) opacity.setValue(1);
      else
        Animated.timing(opacity, {
          toValue: 1,
          duration: LABEL_FADE_MS,
          useNativeDriver: true,
        }).start();
    };
    AccessibilityInfo.isReduceMotionEnabled().then(start, () => start(false));
    return () => {
      cancelled = true;
      opacity.stopAnimation();
    };
  }, [opacity]);

  return (
    <Animated.Text
      testID={`tab-label-${name}`}
      numberOfLines={1}
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      style={[styles.label, { opacity }]}
    >
      {text}
    </Animated.Text>
  );
}

/** A rounded pill under the screen: the open tab shows icon and name, the others only the icon. */
export function FloatingTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
}: BottomTabBarProps) {
  const count = state.routes.length;
  const openName = state.routes[state.index]?.name ?? '';
  const stripColor = DARK_SCREENS.has(openName) ? colors.background : lightColors.background;

  return (
    <View
      style={[
        styles.strip,
        { backgroundColor: stripColor, paddingBottom: insets.bottom + spacing.sm },
      ]}
    >
      <View testID="tab-pill" accessibilityRole="tablist" style={styles.pill}>
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
              accessibilityLabel={`${title}, tab, ${index + 1} of ${count}`}
              accessibilityState={{ selected: focused }}
              onPress={onPress}
              style={[styles.item, focused && styles.itemOpen]}
            >
              {options.tabBarIcon?.({ focused, color, size: 24 })}
              {focused ? <TabLabel name={route.name} text={title} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
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
    backgroundColor: colors.surface,
    shadowColor: colors.background,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  item: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
  },
  itemOpen: { backgroundColor: colors.accentSoft },
  label: { ...typography.tabLabel, maxWidth: LABEL_MAX_WIDTH, color: colors.accent },
});
