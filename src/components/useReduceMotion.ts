import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** True when the phone asks for less motion, false when it does not, null until it has answered. */
export function useReduceMotion(): boolean | null {
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then(
      (value) => !cancelled && setReduced(value),
      () => !cancelled && setReduced(false),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return reduced;
}
