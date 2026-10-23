import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { RepositoriesProvider } from '../src/data/RepositoriesProvider';
import { ru } from '../src/i18n/ru';
import { colors, fontAssets, fontFamilies } from '../src/theme';

export { AppErrorScreen as ErrorBoundary } from '../src/components/AppErrorScreen';

export default function RootLayout() {
  // The app opens at once in the system font and switches when the fonts are ready (or stays if they fail).
  useFonts(fontAssets);
  return (
    <RepositoriesProvider>
      {/* The app is dark everywhere: light clock and battery icons stay readable on a light phone. */}
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="trend/[id]"
          options={{
            headerShown: true,
            title: ru.trends.detailTitle,
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerTitleStyle: { fontFamily: fontFamilies.semibold },
          }}
        />
        <Stack.Screen
          name="video/[id]"
          options={{
            headerShown: true,
            title: ru.market.title,
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerTitleStyle: { fontFamily: fontFamilies.semibold },
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            title: ru.settings.title,
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerTitleStyle: { fontFamily: fontFamilies.semibold },
          }}
        />
        <Stack.Screen
          name="chats"
          options={{
            headerShown: true,
            title: ru.stubs.chats.title,
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerTitleStyle: { fontFamily: fontFamilies.semibold },
          }}
        />
        <Stack.Screen
          name="cards"
          options={{
            headerShown: true,
            title: ru.stubs.cards.title,
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerTitleStyle: { fontFamily: fontFamilies.semibold },
          }}
        />
      </Stack>
    </RepositoriesProvider>
  );
}
