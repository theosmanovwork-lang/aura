import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, lightColors, spacing, typography } from '../theme';

type MessageProps = Readonly<{
  text: string;
  /** Light screens (everything except the feed) use the light palette. */
  light?: boolean;
  action?: Readonly<{ label: string; run: () => void }>;
}>;

/** A centered message with an optional button: loading, empty and error states. */
export function Message({ text, action, light = false }: MessageProps) {
  return (
    <View style={[styles.message, light && styles.messageLight]}>
      <Text style={[styles.text, light && styles.textLight]}>{text}</Text>
      {action ? (
        <Pressable
          accessibilityRole="button"
          onPress={action.run}
          style={[styles.button, light && styles.buttonLight]}
        >
          <Text style={[styles.buttonText, light && styles.buttonTextLight]}>{action.label}</Text>
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
  messageLight: { backgroundColor: lightColors.background },
  textLight: { color: lightColors.textMuted },
  buttonLight: { backgroundColor: lightColors.primary },
  buttonTextLight: { color: lightColors.onPrimary },
  text: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.primary,
  },
  buttonText: { ...typography.body, color: colors.text },
});
