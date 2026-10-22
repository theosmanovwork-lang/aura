import { useEffect, useRef } from 'react';

/** A ref that always holds the newest value, so callbacks can read it without being recreated. */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}
