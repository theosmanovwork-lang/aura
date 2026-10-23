import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, MIN_TOUCH_TARGET, radii, spacing, typography } from '../theme';

/** A pressed button shrinks a little (Prufbase: scale 0.98). */
const PRESS_SCALE = 0.98;

type ButtonProps = Readonly<{
  label: string;
  onPress: () => void;
  /** `primary` is the main action; `chip` is one choice out of several. */
  variant?: 'primary' | 'chip';
  /** For chips: whether this choice is the chosen one. */
  selected?: boolean;
  disabled?: boolean;
  testID?: string;
}>;

export function Button({
  label,
  onPress,
  variant = 'primary',
  selected,
  disabled = false,
  testID,
}: ButtonProps) {
  const isChip = variant === 'chip';
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isChip ? styles.chip : styles.primary,
        selected && styles.selected,
        pressed && !disabled && (isChip ? styles.pressed : styles.primaryPressed),
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.text,
          !isChip && styles.primaryText,
          isChip && selected && styles.selectedText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primary: { backgroundColor: colors.primary, borderRadius: radii.pill },
  primaryPressed: { backgroundColor: colors.primaryPressed, transform: [{ scale: PRESS_SCALE }] },
  chip: { backgroundColor: colors.surfaceMuted },
  pressed: { opacity: 0.8, transform: [{ scale: PRESS_SCALE }] },
  selected: { borderColor: colors.primary },
  selectedText: { color: colors.primary },
  disabled: { opacity: 0.4 },
  text: { ...typography.titleSmall, color: colors.text, textAlign: 'center' },
  primaryText: { color: colors.onPrimary },
});
