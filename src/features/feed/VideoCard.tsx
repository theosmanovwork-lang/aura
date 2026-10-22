import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
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
}>;

/** One full-screen video. Only the video on screen plays and takes taps. */
export function VideoCard({ isActive, ...rest }: VideoCardProps) {
  if (!isActive) return <View style={[styles.card, { height: rest.height }]} />;
  return <ActiveCard {...rest} />;
}

type ActiveCardProps = Omit<VideoCardProps, 'isActive'>;

/** Leaving the screen unmounts this, so a paused video always starts playing when it returns. */
function ActiveCard({ item, height, focused, onToggleLike }: ActiveCardProps) {
  const { video, liked } = item;
  const [paused, setPaused] = useState(false);
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

      <View testID="video-info" style={styles.info} pointerEvents="none">
        <View style={styles.chips}>
          {video.isAiGenerated ? (
            <View
              testID="chip-ai"
              accessible
              accessibilityLabel={ru.feed.aiBadge}
              style={[styles.chip, styles.chipAi]}
            >
              <Text style={styles.chipText}>{ru.feed.aiBadge}</Text>
            </View>
          ) : null}
          <View
            testID="chip-age"
            accessible
            accessibilityLabel={`${ru.feed.age} ${video.ageRating}`}
            style={[styles.chip, styles.chipAge]}
          >
            <Text style={styles.chipText}>{video.ageRating}</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>
      </View>

      <View style={styles.rail}>
        <ActionRail
          liked={liked}
          likeCount={video.likeCount}
          viewCount={video.viewCount}
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
    gap: spacing.sm,
  },
  chips: { flexDirection: 'row', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: radii.sm },
  chipAi: { backgroundColor: colors.primary },
  chipAge: { borderWidth: 1, borderColor: colors.textMuted },
  chipText: { ...typography.caption, color: colors.text },
  title: { ...typography.bodyStrong, color: colors.text },
  rail: {
    position: 'absolute',
    right: spacing.gutter,
    bottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
});
