import { router } from 'expo-router';

import { BrandScreen } from '../../src/features/brand/BrandScreen';

export default function BrandRoute() {
  return <BrandScreen onBack={() => router.back()} />;
}
