import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuraGlyph } from '../../components/AuraIcon';
import { Glyph, type GlyphName } from '../../components/Glyph';
import { SilverView } from '../../components/SilverView';
import { formatCount } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles } from '../../theme';

type ActionRailProps = Readonly<{
  liked: boolean;
  likeCount: number;
  commentCount: number;
  onToggleLike: () => void;
  onOpenComments: () => void;
}>;

type RoundProps = Readonly<{
  testID: string;
  label: string;
  glyph: GlyphName;
  count?: number;
  value?: string;
  disabled?: boolean;
  onPress?: () => void;
}>;

function RoundAction({
  testID,
  label,
  glyph,
  count,
  value,
  disabled = false,
  onPress,
}: RoundProps) {
  const styles = useStyles();
  return (
    <View style={styles.item}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={value ? { text: value } : undefined}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={[styles.round, styles.plate, disabled && styles.quiet]}
      >
        <Glyph name={glyph} size={26} color="#FFFFFF" />
      </Pressable>
      {count === undefined ? null : <Text style={styles.count}>{formatCount(count)}</Text>}
    </View>
  );
}

/** The column of actions on the right edge of a video: Aura (the like), comments, repost, share. */
export function ActionRail({
  liked,
  likeCount,
  commentCount,
  onToggleLike,
  onOpenComments,
}: ActionRailProps): ReactNode {
  const styles = useStyles();
  return (
    <View testID="action-rail" style={styles.rail}>
      <View style={styles.item}>
        <Pressable
          testID="like-button"
          accessibilityRole="button"
          accessibilityLabel={liked ? ru.feed.unlike : ru.feed.like}
          accessibilityState={{ selected: liked }}
          accessibilityValue={{ text: formatCount(likeCount) }}
          onPress={onToggleLike}
        >
          {liked ? (
            <View testID="like-icon-on" style={[styles.round, styles.likeOn]}>
              <AuraGlyph size={28} color="#C7CBD1" />
            </View>
          ) : (
            <SilverView testID="like-icon" style={styles.round}>
              <AuraGlyph size={28} color="#1A1A1A" />
            </SilverView>
          )}
        </Pressable>
        <Text style={styles.count}>{formatCount(likeCount)}</Text>
      </View>
      <RoundAction
        testID="comments-button"
        label={ru.comments.open}
        glyph="chat"
        count={commentCount}
        value={formatCount(commentCount)}
        onPress={onOpenComments}
      />
      <RoundAction testID="soon-repost" label={ru.feed.soon.repost} glyph="repost" disabled />
      <RoundAction testID="soon-share" label={ru.feed.soon.share} glyph="share" disabled />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  rail: { alignItems: 'center', gap: 16 },
  item: { alignItems: 'center', gap: 4 },
  round: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plate: { backgroundColor: colors.onVideoPlate },
  likeOn: { backgroundColor: '#1A1A1A', borderWidth: 2, borderColor: '#C7CBD1' },
  quiet: { opacity: 0.85 },
  count: {
    fontFamily: fontFamilies.extrabold,
    fontSize: 13,
    color: colors.onVideo,
    textShadowColor: colors.textShadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
}));
