import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'react-native';

import { RepositoriesProvider } from '../src/data/RepositoriesProvider';
import { ru } from '../src/i18n/ru';
import { fontAssets, fontFamilies, ThemeProvider, useColors, useScheme } from '../src/theme';

export { AppErrorScreen as ErrorBoundary } from '../src/components/AppErrorScreen';

const HEADER_TITLES = {
  'video/[id]': ru.market.title,
  settings: ru.settings.title,
} as const;

function Screens() {
  const colors = useColors();
  const scheme = useScheme();
  // The feed (the first tab, at the root path) is video: its clock and battery icons are always light.
  const onFeed = usePathname() === '/';
  const onChest = usePathname() === '/chest';
  const light = scheme === 'dark' || onFeed || onChest;
  return (
    <>
      <StatusBar barStyle={light ? 'light-content' : 'dark-content'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="chest"
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
        {Object.entries(HEADER_TITLES).map(([name, title]) => (
          <Stack.Screen
            key={name}
            name={name}
            options={{
              headerShown: true,
              title,
              headerShadowVisible: false,
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              headerTitleStyle: { fontFamily: fontFamilies.bold },
            }}
          />
        ))}
      </Stack>
    </>
  );
}

export default function RootLayout() {
  // The app opens at once in the phone's font and switches when the fonts are ready (or stays if they fail).
  useFonts(fontAssets);
  return (
    <ThemeProvider>
      <RepositoriesProvider>
        <Screens />
      </RepositoriesProvider>
    </ThemeProvider>
  );
}
