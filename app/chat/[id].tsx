import { router, useLocalSearchParams } from 'expo-router';

import { DialogScreen } from '../../src/features/dialog/DialogScreen';

export default function ChatRoute() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const dialogId = Array.isArray(id) ? (id[0] ?? '') : id;
  return (
    <DialogScreen
      key={dialogId}
      dialogId={dialogId}
      onBack={() => router.back()}
      onOpenProfile={(name) =>
        router.push({ pathname: '/user/[handle]', params: { handle: name } })
      }
    />
  );
}
