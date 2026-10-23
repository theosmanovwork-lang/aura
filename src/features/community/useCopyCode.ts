import * as Clipboard from 'expo-clipboard';
import { useCallback, useState } from 'react';

/** Copies a text to the clipboard; `copied` turns true only if the phone really took it. */
export function useCopyCode(code: string) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    try {
      setCopied(await Clipboard.setStringAsync(code));
    } catch {
      setCopied(false);
    }
  }, [code]);
  return { copied, copy };
}
