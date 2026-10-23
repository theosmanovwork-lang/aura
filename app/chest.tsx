import { router } from 'expo-router';

import { ChestScreen } from '../src/features/chest/ChestScreen';

export default function ChestRoute() {
  return <ChestScreen onClose={() => router.back()} />;
}
