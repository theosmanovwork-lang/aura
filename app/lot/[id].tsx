import { router, useLocalSearchParams } from 'expo-router';

import { LotScreen } from '../../src/features/lot/LotScreen';

export default function LotRoute() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const lotId = Array.isArray(id) ? (id[0] ?? '') : id;
  return <LotScreen key={lotId} lotId={lotId} onBack={() => router.back()} />;
}
