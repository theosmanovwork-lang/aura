import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { useTabBarInset } from '../../components/useTabBarInset';
import { ru } from '../../i18n/ru';
import {
  colors,
  iconSizes,
  MIN_TOUCH_TARGET,
  PAUSE_BUTTON_SIZE,
  radii,
  scrim,
  spacing,
  typography,
} from '../../theme';
import { ActionRail } from './ActionRail';
import { AuraPlate } from './AuraPlate';
import { AuthorAvatar } from './AuthorAvatar';
import { SoonRail } from './SoonAction';
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
  onToggleLike: (videoId: string) => void;
  /** Opens the page of the video (its price and the user's position). */
  onOpenMarket?: (videoId: string) => void;
}>;

/** One full-screen video. Only the video on screen plays and takes taps. */
export function VideoCard({ isActive, ...rest }: VideoCardProps) {
  if (!isActive) return <View style={[styles.card, { height: rest.height }]} />;
  return <ActiveCard {...rest} />;
}

type ActiveCardProps = Omit<VideoCardProps, 'isActive'>;

/** Leaving the screen unmounts this, so a paused video always starts playing when it returns. */
function ActiveCard({ item, height, focused, onToggleLike, onOpenMarket }: ActiveCardProps) {
  const { video, liked, authorName } = item;
  const [paused, setPaused] = useState(false);
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
          <Icon name="play" size={iconSizes.xl} color={colors.text} />
        </View>
      ) : null}

      <View
        testID="video-info"
        style={[styles.info, { paddingBottom: bottomInset + spacing.md }]}
        pointerEvents="box-none"
      >
        <AuraPlate
          amount={video.likeCount}
          onPress={onOpenMarket ? () => onOpenMarket(video.id) : undefined}
        />
        <View pointerEvents="none" style={styles.caption}>
          {authorName ? <Text style={styles.author}>{authorName}</Text> : null}
          <Text style={styles.title} numberOfLines={2}>
            {video.title}
          </Text>
        </View>
      </View>

      <View style={[styles.rail, { bottom: bottomInset + spacing.md }]}>
        <AuthorAvatar name={authorName} />
        <ActionRail
          liked={liked}
          likeCount={video.likeCount}
          onToggleLike={() => onToggleLike(video.id)}
        />
        <SoonRail />
      </View>
    </View>
  );
}

const PAUSE_TOP = '42%';
/** The info text stays clear of the action rail on the right. */
const INFO_RIGHT_SPACE = MIN_TOUCH_TARGET + spacing.gutter * 2;

const styles = StyleSheet.create({
  card: { backgroundColor: colors.background, justifyContent: 'flex-end' },
  scrimTop: { position: 'absolute', top: 0, left: 0, right: 0, height: scrim.topHeight },
  scrimBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: scrim.bottomHeight },
  pause: {
    position: 'absolute',
    alignSelf: 'center',
    top: PAUSE_TOP,
    width: PAUSE_BUTTON_SIZE,
    height: PAUSE_BUTTON_SIZE,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
  },
  info: {
    paddingLeft: spacing.gutter,
    paddingRight: INFO_RIGHT_SPACE,
    paddingBottom: spacing.lg,
    gap: spacing.xxs,
  },
  caption: { gap: spacing.xxs },
  author: { ...typography.titleSmall, color: colors.text },
  title: { ...typography.bodySmall, lineHeight: 18, color: colors.text },
  rail: {
    position: 'absolute',
    right: spacing.gutter,
    bottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
});
