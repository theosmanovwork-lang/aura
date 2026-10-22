import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Message } from '../../components/Message';
import { NotFoundError } from '../../data/repositories';
import { useRepositories } from '../../data/RepositoriesProvider';
import { countLabel, formatCount } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { colors, spacing, typography } from '../../theme';
import { useLatest } from '../useLatest';
import { useLoad } from '../useLoad';
import { BarChart } from './BarChart';
import { describeGrowth, formatGrowth } from './format';
import { growthColor } from './growthColor';
import { loadTrendDetail } from './trendService';

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
      <Text style={styles.name}>{summary.trend.name}</Text>
      <View style={styles.figures}>
        <View>
          <Text style={styles.label}>{ru.trends.index}</Text>
          <Text style={styles.score}>{formatCount(summary.score)}</Text>
        </View>
        <Text
          style={[styles.growth, { color: growthColor(summary.growthPercent) }]}
          accessibilityLabel={describeGrowth(summary.growthPercent)}
        >
          {formatGrowth(summary.growthPercent)}
        </Text>
      </View>

      <Text style={styles.section}>{ru.trends.historyTitle}</Text>
      <BarChart values={summary.history} height={140} />

      <Text style={styles.section}>{ru.trends.videosTitle}</Text>
      <Text style={styles.label}>{countLabel(summary.videoCount, ru.trends.videos)}</Text>
      {videos.length === 0 ? <Text style={styles.label}>{ru.trends.noVideos}</Text> : null}
      {videos.map((video) => (
        <View key={video.id} style={styles.video}>
          <Text style={styles.videoTitle}>{video.title}</Text>
        </View>
      ))}

      <Text style={styles.disclaimer}>{ru.trends.disclaimer}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  name: { ...typography.title, color: colors.text },
  figures: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  label: { ...typography.caption, color: colors.textMuted },
  score: { ...typography.title, color: colors.text },
  growth: { ...typography.title },
  section: { ...typography.body, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  video: { padding: spacing.md, borderRadius: spacing.sm, backgroundColor: colors.surface },
  videoTitle: { ...typography.body, color: colors.text },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
