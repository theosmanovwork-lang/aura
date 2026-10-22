import { Stack } from 'expo-router';

import { RepositoriesProvider } from '../src/data/RepositoriesProvider';

export default function RootLayout() {
  return (
    <RepositoriesProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </RepositoriesProvider>
  );
}
