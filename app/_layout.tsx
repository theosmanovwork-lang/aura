import { useFonts } from 'expo-font';
import { Stack, router, usePathname, useRootNavigationState } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'react-native';

import { RepositoriesProvider } from '../src/data/RepositoriesProvider';
import { LaunchSplash } from '../src/features/launch/LaunchSplash';
import { LAUNCH_ENABLED } from '../src/features/launch/launchConfig';
import { ru } from '../src/i18n/ru';
import { fontAssets, fontFamilies, ThemeProvider, useColors, useScheme } from '../src/theme';

export { AppErrorScreen as ErrorBoundary } from '../src/components/AppErrorScreen';

const HEADER_TITLES = {
  'video/[id]': ru.market.title,
  settings: ru.settings.title,
} as const;

/** Once the launch splash is over the welcome flow opens on top of the tabs (every start of the app). */
function useWelcomeAfterLaunch(launched: boolean) {
  const navigationReady = useRootNavigationState()?.key !== undefined;
  const opened = useRef(false);
  useEffect(() => {
    if (!LAUNCH_ENABLED || !launched || !navigationReady || opened.current) return;
    opened.current = true;
    router.push('/onboarding');
  }, [launched, navigationReady]);
}

function Screens({ launched }: Readonly<{ launched: boolean }>) {
  useWelcomeAfterLaunch(launched);
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
        <Stack.Screen
          name="invest/[videoId]"
          options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="topup" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="lot/[id]" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
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
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const [launched, setLaunched] = useState(!LAUNCH_ENABLED);
  return (
    <ThemeProvider>
      <RepositoriesProvider>
        <Screens launched={launched} />
        {launched ? null : (
          <LaunchSplash
            ready={fontsLoaded || fontError !== null}
            onDone={() => setLaunched(true)}
          />
        )}
      </RepositoriesProvider>
    </ThemeProvider>
  );
}
