import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../theme';

type MessageProps = Readonly<{
  text: string;
  action?: Readonly<{ label: string; run: () => void }>;
}>;

/** A centered message with an optional button: loading, empty and error states. */
export function Message({ text, action }: MessageProps) {
  return (
    <View style={styles.message}>
      <Text style={styles.text}>{text}</Text>
      {action ? (
        <Pressable accessibilityRole="button" onPress={action.run} style={styles.button}>
          <Text style={styles.buttonText}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  message: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  text: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.control,
    backgroundColor: colors.primary,
  },
  buttonText: { ...typography.body, color: colors.onPrimary },
});
