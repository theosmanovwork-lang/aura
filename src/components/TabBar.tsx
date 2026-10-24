// Not re-exported from the package root, so the build path is the only way to get this type.
import type { BottomTabBarProps } from 'expo-router/build/layouts/Tabs';
import { Pressable, Text, View } from 'react-native';

import { ru } from '../i18n/ru';
import {
  contentColumn,
  makeStyles,
  MIN_TOUCH_TARGET,
  spacing,
  TAB_BAR_HEIGHT,
  ThemeProvider,
  useColors,
} from '../theme';

const MAX_FONT_SCALE = 1.2;

const spokenName = (title: string, position: number, total: number): string =>
  ru.a11y.tab
    .replace('{title}', title)
    .replace('{position}', String(position))
    .replace('{total}', String(total));

/** The first tab is the feed: video above it, so the bar is dark there whatever the phone is set to. */
export function TabBar(props: BottomTabBarProps) {
  return (
    <ThemeProvider scheme={props.state.index === 0 ? 'dark' : undefined}>
      <Bar {...props} />
    </ThemeProvider>
  );
}

/** A flat bar under the screen: a line on top, icon and name for every tab, the open one is bold. */
function Bar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const styles = useStyles();
  const colors = useColors();
  const count = state.routes.length;

  return (
    <View style={[styles.strip, { paddingBottom: insets.bottom }]}>
      <View testID="tab-bar" accessibilityRole="tablist" style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]!;
          const focused = state.index === index;
          const title = options.title ?? route.name;
          const color = focused ? colors.text : colors.iconInactive;

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
                style={[styles.label, { color }, focused && styles.labelOpen]}
              >
                {title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  strip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.tabBar,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#1A1A1A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -8 },
    elevation: 8,
  },
  bar: {
    ...contentColumn,
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  item: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: { fontFamily: 'Onest_600SemiBold', fontSize: 10, lineHeight: 14 },
  labelOpen: { fontFamily: 'Onest_700Bold' },
}));
