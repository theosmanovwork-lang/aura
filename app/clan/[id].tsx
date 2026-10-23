import { router, useLocalSearchParams } from 'expo-router';

import { ClanScreen } from '../../src/features/clan/ClanScreen';

export default function ClanRoute() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const clanId = Array.isArray(id) ? (id[0] ?? '') : id;
  return (
    <ClanScreen
      key={clanId}
      clanId={clanId}
      onBack={() => router.back()}
      onOpenChat={() => router.push({ pathname: '/chat/[id]', params: { id: 'd2' } })}
      onOpenUser={(name) => router.push({ pathname: '/user/[handle]', params: { handle: name } })}
    />
  );
}
