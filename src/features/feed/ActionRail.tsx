import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuraGlyph } from '../../components/AuraIcon';
import { Glyph, type GlyphName } from '../../components/Glyph';
import { SilverView } from '../../components/SilverView';
import { formatCount } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles } from '../../theme';

type ActionRailProps = Readonly<{
  /** How many people hold shares of the video. */
  holders: number;
  commentCount: number;
  repostCount: number;
  shareCount: number;
  onOpenMarket?: () => void;
  onOpenComments: () => void;
}>;

type IconProps = Readonly<{
  testID: string;
  label: string;
  glyph: GlyphName;
  count: number;
  value?: string;
  disabled?: boolean;
  onPress?: () => void;
}>;

/** An icon straight on the video, no plate behind it, with its count under it. */
function RailIcon({ testID, label, glyph, count, value, disabled = false, onPress }: IconProps) {
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
        style={styles.icon}
      >
        <Glyph name={glyph} size={32} color="#FFFFFF" strokeWidth={1.9} />
      </Pressable>
      <Text style={styles.count}>{formatCount(count)}</Text>
    </View>
  );
}

/** The column of actions on the right edge of a video: shares (the Aura coin), comments, repost, share. */
export function ActionRail({
  holders,
  commentCount,
  repostCount,
  shareCount,
  onOpenMarket,
  onOpenComments,
}: ActionRailProps): ReactNode {
  const styles = useStyles();
  return (
    <View testID="action-rail" style={styles.rail}>
      <View style={styles.item}>
        <Pressable
          testID="aura-button"
          accessibilityRole="button"
          accessibilityLabel={ru.feed.aura}
          accessibilityValue={{ text: formatCount(holders) }}
          accessibilityState={{ disabled: onOpenMarket === undefined }}
          disabled={onOpenMarket === undefined}
          onPress={onOpenMarket}
          style={styles.icon}
        >
          <SilverView style={styles.coin}>
            <AuraGlyph size={24} color="#1A1A1A" />
          </SilverView>
        </Pressable>
        <Text style={styles.count}>{formatCount(holders)}</Text>
      </View>
      <RailIcon
        testID="comments-button"
        label={ru.comments.open}
        glyph="chat"
        count={commentCount}
        value={formatCount(commentCount)}
        onPress={onOpenComments}
      />
      <RailIcon
        testID="soon-repost"
        label={ru.feed.soon.repost}
        glyph="repost"
        count={repostCount}
        disabled
      />
      <RailIcon
        testID="soon-share"
        label={ru.feed.soon.share}
        glyph="share"
        count={shareCount}
        disabled
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  rail: { alignItems: 'center', gap: 12 },
  item: { alignItems: 'center', gap: 2 },
  icon: { width: 48, height: 44, alignItems: 'center', justifyContent: 'center' },
  coin: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  count: {
    fontFamily: fontFamilies.bold,
    fontSize: 12,
    color: colors.onVideo,
    textShadowColor: colors.textShadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
}));
