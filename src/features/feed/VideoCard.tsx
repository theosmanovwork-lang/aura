import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { countLabel, formatCount } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { colors, spacing, typography } from '../../theme';
import type { FeedItem } from './feedService';
import { resolveVideoSource, type PlayableSource } from './videoSources';

/** Decorative symbols: screen readers use the button label instead. */
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
      {paused ? (
        <Text style={styles.pauseGlyph} {...HIDDEN_FROM_READERS}>
          ▶
        </Text>
      ) : null}

      <View style={styles.info} pointerEvents="none">
        <View style={styles.badges}>
          {video.isAiGenerated ? <Text style={styles.badge}>{ru.feed.aiBadge}</Text> : null}
          <Text style={styles.badge}>{video.ageRating}</Text>
        </View>
        <Text style={styles.title}>{video.title}</Text>
        <Text style={styles.stats}>{countLabel(video.viewCount, ru.feed.views)}</Text>
      </View>

      <Pressable
        testID="like-button"
        accessibilityRole="button"
        accessibilityLabel={liked ? ru.feed.unlike : ru.feed.like}
        accessibilityState={{ selected: liked }}
        accessibilityValue={{ text: formatCount(video.likeCount) }}
        onPress={() => onToggleLike(video.id)}
        style={styles.like}
      >
        <Text style={[styles.heart, liked && styles.heartActive]} {...HIDDEN_FROM_READERS}>
          {liked ? '♥' : '♡'}
        </Text>
        <Text style={styles.likeCount}>{formatCount(video.likeCount)}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.background, justifyContent: 'flex-end' },
  pauseGlyph: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
    fontSize: 56,
    color: colors.text,
    opacity: 0.85,
  },
  info: {
    padding: spacing.md,
    paddingRight: 88,
    gap: spacing.xs,
    backgroundColor: colors.overlay,
  },
  badges: { flexDirection: 'row', gap: spacing.sm },
  badge: {
    ...typography.caption,
    color: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  title: { ...typography.body, fontWeight: '700', color: colors.text },
  stats: { ...typography.caption, color: colors.textMuted },
  like: { position: 'absolute', right: spacing.md, bottom: spacing.xl, alignItems: 'center' },
  heart: { fontSize: 40, color: colors.text },
  heartActive: { color: colors.like },
  likeCount: { ...typography.caption, color: colors.text },
});
