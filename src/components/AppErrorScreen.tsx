import type { ErrorBoundaryProps } from 'expo-router';

import { ru } from '../i18n/ru';
import { Message } from './Message';

/** What a person sees instead of a white screen when a screen crashes. The details stay hidden. */
export function AppErrorScreen({ retry }: ErrorBoundaryProps) {
  return (
    <Message light text={ru.app.crash} action={{ label: ru.app.retry, run: () => void retry() }} />
  );
}
