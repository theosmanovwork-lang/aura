import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { Message } from '../../components/Message';
import { NotFoundError } from '../../data/repositories';
import { useRepositories } from '../../data/RepositoriesProvider';
import { countLabel, formatCount } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { colors, iconSizes, radii, spacing, typography } from '../../theme';
import { PredictionPanel } from '../predictions/PredictionPanel';
import { useLatest } from '../useLatest';
import { useLoad } from '../useLoad';
import { BarChart } from './BarChart';
import { GrowthPill } from './GrowthPill';
import { loadTrendDetail } from './trendService';

const CHART_HEIGHT = 140;

type TrendDetailScreenProps = Readonly<{ trendId: string; now?: () => number }>;

export function TrendDetailScreen({ trendId, now = Date.now }: TrendDetailScreenProps) {
  const repos = useRepositories();
  const clock = useLatest(now);
  const load = useCallback(
    () => loadTrendDetail(repos, trendId, clock.current()),
    [repos, trendId, clock],
  );
  const { state, reload } = useLoad(load);

  if (state.status === 'loading') return <Message text={ru.trends.loading} />;
  if (state.status === 'error') {
    if (state.error instanceof NotFoundError) return <Message text={ru.trends.notFound} />;
    return <Message text={ru.trends.error} action={{ label: ru.trends.retry, run: reload }} />;
  }

  const { summary, videos } = state.data;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View testID="trend-hero" style={styles.hero}>
        <Text style={styles.name} accessibilityRole="header">
          {summary.trend.name}
        </Text>
        <View style={styles.figures}>
          <View>
            <Text style={styles.label}>{ru.trends.index}</Text>
            <Text style={styles.score}>{formatCount(summary.score)}</Text>
          </View>
          <GrowthPill percent={summary.growthPercent} trendId={summary.trend.id} large />
        </View>
      </View>

      <View testID="trend-chart-card" style={styles.card}>
        <Text style={styles.section} accessibilityRole="header">
          {ru.trends.historyTitle}
        </Text>
        <BarChart values={summary.history} height={CHART_HEIGHT} />
      </View>

      <PredictionPanel trendId={summary.trend.id} now={now} />

      <View style={styles.videosHeader}>
        <Text style={styles.section} accessibilityRole="header">
          {ru.trends.videosTitle}
        </Text>
        <Text style={styles.label}>{countLabel(summary.videoCount, ru.trends.videos)}</Text>
      </View>
      {videos.length === 0 ? <Text style={styles.label}>{ru.trends.noVideos}</Text> : null}
      {videos.map((video) => (
        <View key={video.id} testID={`trend-video-${video.id}`} style={styles.video}>
          <Icon
            testID={`trend-video-icon-${video.id}`}
            name="videocam-outline"
            size={iconSizes.lg}
            color={colors.primaryText}
          />
          <Text style={styles.videoTitle}>{video.title}</Text>
        </View>
      ))}

      <Text style={styles.disclaimer}>{ru.trends.disclaimer}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.gutter, gap: spacing.md },
  hero: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
  },
  name: { ...typography.title, color: colors.text },
  figures: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  label: { ...typography.caption, color: colors.textMuted },
  score: { ...typography.display, color: colors.text },
  card: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  section: { ...typography.heading, color: colors.text },
  videosHeader: { gap: spacing.xxs, marginTop: spacing.sm },
  video: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  videoTitle: { ...typography.body, flex: 1, color: colors.text },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
