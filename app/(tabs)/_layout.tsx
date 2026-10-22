import { Tabs } from 'expo-router/js-tabs';

import { ru } from '../../src/i18n/ru';
import { colors, typography } from '../../src/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: typography.caption,
      }}
    >
      <Tabs.Screen name="index" options={{ title: ru.tabs.feed }} />
      <Tabs.Screen name="trends" options={{ title: ru.tabs.trends }} />
      <Tabs.Screen name="wallet" options={{ title: ru.tabs.wallet }} />
      <Tabs.Screen name="profile" options={{ title: ru.tabs.profile }} />
    </Tabs>
  );
}
