import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Glyph } from '../../components/Glyph';
import { useTabBarInset } from '../../components/useTabBarInset';
import { videoPrice } from '../../domain/videoPrice';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, PAUSE_BUTTON_SIZE, scrim, useColors } from '../../theme';
import { ActionRail } from './ActionRail';
import { AuraPlate } from './AuraPlate';
import { AuthorAvatar } from './AuthorAvatar';
import type { FeedItem } from './feedService';
import { resolveVideoSource, type PlayableSource } from './videoSources';

/** Decorative layers: screen readers use the button label instead. */
const HIDDEN_FROM_READERS = {
  accessibilityElementsHidden: true,
  importantForAccessibility: 'no-hide-descendants',
} as const;

type ActivePlayerProps = Readonly<{ source: NonNullable<PlayableSource>; paused: boolean }>;

function ActivePlayer({ source, paused }: ActivePlayerProps) {
  const player = useVideoPlayer(source, (created) => {
    created.loop = true;
  });

  useEffect(() => {
    if (paused) player.pause();
    else player.play();
  }, [paused, player]);

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

type VideoCardProps = Readonly<{
  item: FeedItem;
  height: number;
  isActive: boolean;
  /** False while another tab is open: the video must not keep playing behind it. */
  focused: boolean;
  /** Opens the page of the video (its price and the user's position). */
  onOpenMarket?: (videoId: string) => void;
  /** Opens the comments sheet of the video. */
  onOpenComments?: (videoId: string) => void;
}>;

/** One full-screen video. Only the video on screen plays and takes taps. */
export function VideoCard({ isActive, ...rest }: VideoCardProps) {
  const styles = useStyles();
  if (!isActive) return <View style={[styles.card, { height: rest.height }]} />;
  return <ActiveCard {...rest} />;
}

type ActiveCardProps = Omit<VideoCardProps, 'isActive'>;

/** Leaving the screen unmounts this, so a paused video always starts playing when it returns. */
function ActiveCard({ item, height, focused, onOpenMarket, onOpenComments }: ActiveCardProps) {
  const styles = useStyles();
  const colors = useColors();
  const { video, authorName, commentCount } = item;
  const [paused, setPaused] = useState(false);
  const [following, setFollowing] = useState(false);
  const bottomInset = useTabBarInset();
  const source = useMemo(() => resolveVideoSource(video.videoUri), [video.videoUri]);

  return (
    <View style={[styles.card, { height }]}>
      {source === null ? null : <ActivePlayer source={source} paused={paused || !focused} />}
      <Pressable
        testID="video-surface"
        accessibilityRole="button"
        accessibilityLabel={paused ? ru.feed.resume : ru.feed.pause}
        onPress={() => setPaused((current) => !current)}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        testID="scrim-top"
        pointerEvents="none"
        colors={[colors.scrimTop, colors.scrimClear]}
        style={styles.scrimTop}
      />
      <LinearGradient
        testID="scrim-bottom"
        pointerEvents="none"
        colors={[colors.scrimClear, colors.scrimMid, colors.scrimBottom]}
        locations={[...scrim.locations]}
        style={styles.scrimBottom}
      />

      {paused ? (
        <View
          testID="pause-indicator"
          style={styles.pause}
          pointerEvents="none"
          {...HIDDEN_FROM_READERS}
        >
          <Glyph name="video" size={36} color={colors.onVideo} filled />
        </View>
      ) : null}

      <View
        testID="video-info"
        style={[styles.info, { paddingBottom: bottomInset + 16 }]}
        pointerEvents="box-none"
      >
        <AuraPlate
          amount={videoPrice(video)}
          onPress={onOpenMarket ? () => onOpenMarket(video.id) : undefined}
        />
        <View pointerEvents="none" style={styles.caption}>
          {authorName ? <Text style={styles.author}>{authorName}</Text> : null}
          <Text style={styles.title} numberOfLines={3}>
            {video.title}
          </Text>
        </View>
      </View>

      <View style={[styles.rail, { bottom: bottomInset + 16 }]}>
        <AuthorAvatar
          name={authorName}
          following={following}
          onToggleFollow={() => setFollowing((on) => !on)}
        />
        <ActionRail
          holders={video.likeCount}
          commentCount={commentCount}
          repostCount={Math.round(video.likeCount / 25)}
          shareCount={Math.round(video.likeCount / 60)}
          onOpenMarket={onOpenMarket ? () => onOpenMarket(video.id) : undefined}
          onOpenComments={() => onOpenComments?.(video.id)}
        />
      </View>
    </View>
  );
}

/** The info text stays clear of the action rail on the right. */
const INFO_RIGHT_SPACE = 90;

const useStyles = makeStyles((colors) => ({
  card: { backgroundColor: '#1A1A1A', justifyContent: 'flex-end' },
  scrimTop: { position: 'absolute', top: 0, left: 0, right: 0, height: scrim.topHeight },
  scrimBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: scrim.bottomHeight },
  pause: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    width: PAUSE_BUTTON_SIZE,
    height: PAUSE_BUTTON_SIZE,
    borderRadius: PAUSE_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
  },
  info: { paddingLeft: 16, paddingRight: INFO_RIGHT_SPACE, gap: 8 },
  caption: { gap: 8 },
  author: { fontFamily: fontFamilies.bold, fontSize: 16, color: colors.onVideo },
  title: { fontFamily: fontFamilies.medium, fontSize: 14, lineHeight: 20, color: colors.onVideo },
  rail: { position: 'absolute', right: 8, alignItems: 'center', gap: 16 },
}));
