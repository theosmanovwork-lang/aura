import { useState } from 'react';
import { Text, View } from 'react-native';

import { Avatar } from '../../components/Avatar';
import { Glyph } from '../../components/Glyph';
import { formatAgo } from '../../i18n/format';
import { ru } from '../../i18n/ru';
import { PressableScale } from '../../motion/PressableScale';
import { Pop } from '../../motion/Pop';
import { knock } from '../../motion/haptics';
import { fontFamilies, makeStyles, useColors } from '../../theme';
import type { CommentView } from './commentService';

const AVATAR = 36;

type CommentRowProps = Readonly<{ view: CommentView; now: number }>;

/**
 * One comment: a letter, the nickname (with «автор» for the author of the video), the time and
 * the text; a heart on the right. The heart is only a mark on this screen, it is not saved.
 */
export function CommentRow({ view, now }: CommentRowProps) {
  const styles = useStyles();
  const colors = useColors();
  const { comment, authorName, byVideoAuthor } = view;
  const [liked, setLiked] = useState(false);
  return (
    <View testID="comment-row" style={styles.row}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Avatar initial={authorName.slice(0, 1).toUpperCase()} tone="brand" size={AVATAR} />
      </View>
      <View accessible style={styles.body}>
        <View style={styles.meta}>
          <Text style={styles.name}>{authorName}</Text>
          {byVideoAuthor ? <Text style={styles.badge}>{ru.comments.byAuthor}</Text> : null}
          <Text style={styles.time}>{formatAgo(now, comment.createdAt)}</Text>
        </View>
        <Text style={styles.text}>{comment.text}</Text>
        <Text style={styles.reply}>{ru.comments.reply}</Text>
      </View>
      <PressableScale
        testID="comment-like"
        accessibilityRole="button"
        accessibilityLabel={ru.comments.like}
        accessibilityState={{ selected: liked }}
        onPress={() => {
          knock();
          setLiked((on) => !on);
        }}
        style={styles.like}
      >
        <Pop trigger={liked} peak={1.4}>
          <Glyph
            name="heart"
            size={18}
            color={liked ? colors.destructive : colors.textMuted}
            filled={liked}
            strokeWidth={2}
          />
        </Pop>
        <Text style={styles.likeCount}>{liked ? 1 : 0}</Text>
      </PressableScale>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: { flexDirection: 'row', gap: 10, paddingVertical: 8 },
  body: { flex: 1, minWidth: 0, gap: 3 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.text },
  badge: {
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    overflow: 'hidden',
    lineHeight: 18,
    fontFamily: fontFamilies.bold,
    fontSize: 10,
    color: colors.onPrimary,
    backgroundColor: colors.primary,
  },
  time: { fontFamily: fontFamilies.medium, fontSize: 13, color: colors.textMuted },
  text: { fontFamily: fontFamilies.medium, fontSize: 14, lineHeight: 20, color: colors.text },
  reply: { fontFamily: fontFamilies.bold, fontSize: 12, color: colors.textMuted },
  like: { width: 36, alignItems: 'center', gap: 2 },
  likeCount: { fontFamily: fontFamilies.bold, fontSize: 11, color: colors.textMuted },
}));
