import { router } from 'expo-router';

import { TopUpScreen } from '../src/features/topup/TopUpScreen';

export default function TopUpRoute() {
  return <TopUpScreen onBack={() => router.back()} />;
}
