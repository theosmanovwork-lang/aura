import { router } from 'expo-router';

import { ShowcaseScreen } from '../../src/features/showcase/ShowcaseScreen';

export default function ComponentsRoute() {
  return <ShowcaseScreen onBack={() => router.back()} />;
}
