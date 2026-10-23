import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuraText } from '../../components/AuraText';
import { Icon } from '../../components/Icon';
import { formatPoints } from '../../i18n/format';
import { ru } from '../../i18n/ru';
import {
  MIN_TOUCH_TARGET,
  iconSizes,
  makeStyles,
  radii,
  spacing,
  typography,
  useColors,
} from '../../theme';

const MAX_DIGITS = 6;
const KEY_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'delete'],
] as const;

type AmountPadProps = Readonly<{
  /** Putting Aura in, or taking it back out. */
  mode: 'invest' | 'take';
  min: number;
  max: number;
  /** True while a move is being saved: the confirm button is off. */
  pending?: boolean;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}>;

const fill = (template: string, values: Readonly<Record<string, string>>): string =>
  Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, value), template);

/** A number pad for choosing a whole amount of Aura, with the limit that applies and a confirm button. */
export function AmountPad({
  mode,
  min,
  max,
  pending = false,
  onConfirm,
  onCancel,
}: AmountPadProps) {
  const styles = useStyles();
  const colors = useColors();
  const [digits, setDigits] = useState('');
  const amount = digits === '' ? 0 : Number(digits);
  const valid = amount >= min && amount <= max && !pending;
  const texts = ru.market.pad;
  const hint =
    mode === 'invest'
      ? fill(texts.min, { min: String(min) })
      : fill(texts.takable, { max: formatPoints(max) });
  const confirmLabel = fill(mode === 'invest' ? texts.confirmInvest : texts.confirmTake, {
    amount: formatPoints(amount),
  });

  const press = (key: string) => {
    if (key === 'delete') return setDigits((current) => current.slice(0, -1));
    setDigits((current) => {
      if (current.length >= MAX_DIGITS) return current;
      return current === '' && key === '0' ? current : current + key;
    });
  };

  return (
    <View style={styles.pad}>
      <Text style={styles.label}>{texts.amountLabel}</Text>
      <Text
        testID="pad-amount"
        accessibilityLabel={`${texts.amountLabel} ${digits === '' ? '0' : digits}`}
        accessibilityLiveRegion="polite"
        style={styles.amount}
      >
        {digits === '' ? '0' : digits}
      </Text>
      <AuraText style={styles.hint}>{hint}</AuraText>
      {KEY_ROWS.map((row, index) => (
        <View key={index} style={styles.row}>
          {row.map((key) =>
            key === '' ? (
              <View key="space" style={styles.key} />
            ) : (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={key === 'delete' ? texts.deleteDigit : key}
                onPress={() => press(key)}
                style={({ pressed }) => [styles.key, pressed && styles.pressed]}
              >
                {key === 'delete' ? (
                  <Icon name="backspace-outline" size={iconSizes.md} color={colors.text} />
                ) : (
                  <Text style={styles.digit}>{key}</Text>
                )}
              </Pressable>
            ),
          )}
        </View>
      ))}
      <Pressable
        testID="pad-confirm"
        accessibilityRole="button"
        accessibilityLabel={confirmLabel}
        accessibilityState={{ disabled: !valid }}
        disabled={!valid}
        onPress={() => onConfirm(amount)}
        style={[styles.confirm, !valid && styles.off]}
      >
        <AuraText style={styles.confirmText}>{confirmLabel}</AuraText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={ru.market.actions.cancel}
        onPress={onCancel}
        style={styles.cancel}
      >
        <Text style={styles.cancelText}>{ru.market.actions.cancel}</Text>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  pad: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.panel,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  label: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  amount: { ...typography.figureDisplay, color: colors.text, textAlign: 'center' },
  hint: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  key: {
    flex: 1,
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET + spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  digit: { ...typography.figureXL, color: colors.text },
  confirm: {
    minHeight: MIN_TOUCH_TARGET + spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  off: { opacity: 0.4 },
  confirmText: { ...typography.bodyStrong, color: colors.onPrimary },
  cancel: { minHeight: MIN_TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' },
  cancelText: { ...typography.bodyStrong, color: colors.textMuted },
}));
