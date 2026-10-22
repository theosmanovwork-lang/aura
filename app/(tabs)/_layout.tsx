import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '../../src/components/Icon';
import { ru } from '../../src/i18n/ru';
import { colors, iconSizes, TAB_BAR_HEIGHT, typography } from '../../src/theme';

type TabSpec = Readonly<{ name: string; title: string; icon: IconName; iconOpen: IconName }>;

const TABS: readonly TabSpec[] = [
  { name: 'index', title: ru.tabs.feed, icon: 'home-outline', iconOpen: 'home' },
  { name: 'trends', title: ru.tabs.trends, icon: 'trending-up-outline', iconOpen: 'trending-up' },
  { name: 'wallet', title: ru.tabs.wallet, icon: 'sparkles-outline', iconOpen: 'sparkles' },
  { name: 'profile', title: ru.tabs.profile, icon: 'person-outline', iconOpen: 'person' },
];

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.iconInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: TAB_BAR_HEIGHT + insets.bottom,
        },
        tabBarLabelStyle: typography.tabLabel,
      }}
    >
      {TABS.map(({ name, title, icon, iconOpen }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ focused, color }) => {
              const shown = focused ? iconOpen : icon;
              return (
                <Icon
                  name={shown}
                  size={iconSizes.md}
                  color={typeof color === 'string' ? color : colors.iconInactive}
                  testID={`tab-icon-${shown}`}
                />
              );
            },
          }}
        />
      ))}
    </Tabs>
  );
}
