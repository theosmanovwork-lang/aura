import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { Avatar } from '../../components/Avatar';
import { Glyph } from '../../components/Glyph';
import { MAX_COMMENT_LENGTH } from '../../domain/comment';
import { ru } from '../../i18n/ru';
import { PressableScale } from '../../motion/PressableScale';
import { fontFamilies, makeStyles, useColors } from '../../theme';

/** The counter appears once the text gets close to the limit. */
const COUNTER_FROM = MAX_COMMENT_LENGTH - 60;

type CommentInputProps = Readonly<{
  sending: boolean;
  error: string | null;
  /** The first letter of your own nickname, for the round avatar. */
  initial?: string;
  /** Called with the typed text; resolves true when it was saved, so the field can be cleared. */
  onSend: (text: string) => Promise<boolean>;
}>;

export function CommentInput({ sending, error, initial = '', onSend }: CommentInputProps) {
  const styles = useStyles();
  const colors = useColors();
  const [text, setText] = useState('');
  const ready = text.trim().length > 0 && !sending;

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
      <View style={styles.chips}>
        {ru.comments.reactions.map((reaction) => (
          <PressableScale
            key={reaction}
            testID={`reaction-${reaction}`}
            accessibilityRole="button"
            accessibilityState={{ disabled: sending }}
            disabled={sending}
            onPress={() => void onSend(reaction)}
            style={styles.chip}
          >
            <Text style={styles.chipText}>{reaction}</Text>
          </PressableScale>
        ))}
      </View>
      <View style={styles.row}>
        <Avatar initial={initial} tone="brand" size={36} />
        <View style={styles.field}>
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
          <View
            accessible
            accessibilityRole="button"
            accessibilityLabel={ru.comments.gift}
            accessibilityState={{ disabled: true }}
            style={styles.gift}
          >
            <Glyph name="gift" size={16} color={colors.text} strokeWidth={2.2} />
          </View>
        </View>
        <PressableScale
          testID="comment-send"
          accessibilityRole="button"
          accessibilityLabel={ru.comments.send}
          accessibilityState={{ disabled: !ready }}
          disabled={!ready}
          onPress={send}
          style={[styles.send, ready ? styles.sendOn : styles.sendOff]}
        >
          <Glyph
            name="arrowUp"
            size={18}
            color={ready ? colors.onPrimary : colors.textMuted}
            strokeWidth={2.4}
          />
        </PressableScale>
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
  wrap: { gap: 10 },
  chips: { flexDirection: 'row', gap: 6 },
  chip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  chipText: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  field: {
    flex: 1,
    minHeight: 44,
    paddingLeft: 14,
    paddingRight: 6,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minWidth: 0,
    maxHeight: 120,
    paddingVertical: 10,
    fontFamily: fontFamilies.medium,
    fontSize: 15,
    color: colors.text,
  },
  gift: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  send: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sendOn: { backgroundColor: colors.primary },
  sendOff: { backgroundColor: colors.surfaceMuted },
  error: { fontFamily: fontFamilies.semibold, fontSize: 12, color: colors.destructive },
  counter: {
    alignSelf: 'flex-end',
    fontFamily: fontFamilies.semibold,
    fontSize: 12,
    color: colors.textMuted,
  },
}));
