import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Small taps of the phone. They never throw and do nothing on the web or where the phone has no motor. */
const run = (action: () => Promise<void>): void => {
  if (Platform.OS === 'web') return;
  action().catch(() => undefined);
};

/** A light tick: a button press, a tab change. */
export const tick = (): void => run(() => Haptics.selectionAsync());

/** A soft knock: a coin tap, a follow. */
export const knock = (): void => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));

/** A heavy thump: the chest flash. */
export const thump = (): void => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));

/** A pleasant double tap: something good happened (a bid accepted, a card received). */
export const success = (): void =>
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
