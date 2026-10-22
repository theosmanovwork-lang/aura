import { Stack } from 'expo-router';

import { RepositoriesProvider } from '../src/data/RepositoriesProvider';
import { ru } from '../src/i18n/ru';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <RepositoriesProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="trend/[id]"
          options={{
            headerShown: true,
            title: ru.trends.detailTitle,
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
          }}
        />
      </Stack>
    </RepositoriesProvider>
  );
}
