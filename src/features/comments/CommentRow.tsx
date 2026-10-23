import { StyleSheet, Text, View } from 'react-native';

import { formatAgo } from '../../i18n/format';
import { colors, radii, spacing, typography } from '../../theme';
import type { CommentView } from './commentService';

const AVATAR = 36;

type CommentRowProps = Readonly<{ view: CommentView; now: number }>;

/** One comment: a round letter, the nickname with the time, and the text. */
export function CommentRow({ view, now }: CommentRowProps) {
  const { comment, authorName } = view;
  return (
    <View testID="comment-row" accessible style={styles.row}>
      <View
        style={styles.avatar}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Text style={styles.letter}>{authorName.slice(0, 1).toUpperCase()}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.meta}>
          {authorName ? `${authorName} · ` : ''}
          {formatAgo(now, comment.createdAt)}
        </Text>
        <Text style={styles.text}>{comment.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  letter: { ...typography.titleSmall, color: colors.text },
  body: { flex: 1, gap: spacing.xxs },
  meta: { ...typography.caption, color: colors.textMuted },
  text: { ...typography.bodySmall, color: colors.text },
});
