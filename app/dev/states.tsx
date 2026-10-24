import { router } from 'expo-router';

import { StatesScreen } from '../../src/features/states/StatesScreen';

export default function StatesRoute() {
  return <StatesScreen onBack={() => router.back()} />;
}
