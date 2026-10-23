import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { MAX_COMMENT_LENGTH } from '../../domain/comment';
import { ru } from '../../i18n/ru';
import { MIN_TOUCH_TARGET, makeStyles, radii, spacing, typography, useColors } from '../../theme';

/** The counter appears once the text gets close to the limit. */
const COUNTER_FROM = MAX_COMMENT_LENGTH - 60;

type CommentInputProps = Readonly<{
  sending: boolean;
  error: string | null;
  /** Called with the typed text; resolves true when it was saved, so the field can be cleared. */
  onSend: (text: string) => Promise<boolean>;
}>;

export function CommentInput({ sending, error, onSend }: CommentInputProps) {
  const styles = useStyles();
  const colors = useColors();
  const [text, setText] = useState('');

  const send = async () => {
    const sent = text;
    // Only clear what was sent: anything typed while sending stays.
    if (await onSend(sent)) setText((current) => (current === sent ? '' : current));
  };

  return (
    <View style={styles.wrap}>
      {error ? (
        <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
      <View style={styles.row}>
        <TextInput
          testID="comment-input"
          accessibilityLabel={ru.comments.inputLabel}
          placeholder={ru.comments.placeholder}
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          style={styles.input}
        />
        <Pressable
          testID="comment-send"
          accessibilityRole="button"
          accessibilityLabel={ru.comments.send}
          accessibilityState={{ disabled: sending }}
          disabled={sending}
          onPress={send}
          style={({ pressed }) => [styles.send, (pressed || sending) && styles.sendQuiet]}
        >
          <Text style={styles.sendText}>{sending ? ru.comments.sending : ru.comments.send}</Text>
        </Pressable>
      </View>
      {text.length >= COUNTER_FROM ? (
        <Text style={styles.counter}>
          {ru.comments.counter
            .replace('{n}', String(text.length))
            .replace('{max}', String(MAX_COMMENT_LENGTH))}
        </Text>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  input: {
    ...typography.bodySmall,
    flex: 1,
    maxHeight: 120,
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.fieldBorder,
  },
  send: {
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  sendQuiet: { opacity: 0.6 },
  sendText: { ...typography.titleSmall, color: colors.onPrimary },
  error: { ...typography.caption, color: colors.destructive },
  counter: { ...typography.caption, color: colors.textMuted, alignSelf: 'flex-end' },
}));
