import { router, useLocalSearchParams } from 'expo-router';

import { PersonScreen } from '../../src/features/person/PersonScreen';

export default function UserRoute() {
  const { handle } = useLocalSearchParams<{ handle: string | string[] }>();
  const name = Array.isArray(handle) ? (handle[0] ?? '') : handle;
  return (
    <PersonScreen
      key={name}
      handle={name}
      onBack={() => router.back()}
      onWrite={() => router.push({ pathname: '/chat/[id]', params: { id: 'd1' } })}
      onOpenClan={() => router.push({ pathname: '/clan/[id]', params: { id: 'clan-neon' } })}
      onOpenVideo={() => router.dismissAll()}
    />
  );
}
