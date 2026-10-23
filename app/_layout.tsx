import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'react-native';

import { RepositoriesProvider } from '../src/data/RepositoriesProvider';
import { ru } from '../src/i18n/ru';
import { ThemeProvider, typography, useColors, useScheme } from '../src/theme';

export { AppErrorScreen as ErrorBoundary } from '../src/components/AppErrorScreen';

const HEADER_TITLES = {
  'trend/[id]': ru.trends.detailTitle,
  'video/[id]': ru.market.title,
  settings: ru.settings.title,
  chats: ru.stubs.chats.title,
  cards: ru.stubs.cards.title,
} as const;

function Screens() {
  const colors = useColors();
  const scheme = useScheme();
  // The feed (the first tab, at the root path) is video: its clock and battery icons are always light.
  const onFeed = usePathname() === '/';
  const light = scheme === 'dark' || onFeed;
  return (
    <>
      <StatusBar barStyle={light ? 'light-content' : 'dark-content'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
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
              headerTitleStyle: { fontWeight: typography.heading.fontWeight },
            }}
          />
        ))}
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RepositoriesProvider>
        <Screens />
      </RepositoriesProvider>
    </ThemeProvider>
  );
}
