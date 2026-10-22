import { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Message } from '../../components/Message';
import { useRepositories } from '../../data/RepositoriesProvider';
import { ru } from '../../i18n/ru';
import { colors, spacing, typography } from '../../theme';
import { useLatest } from '../useLatest';
import { useLoad } from '../useLoad';
import { TrendRow } from './TrendRow';
import { loadTrendBoard } from './trendService';

type TrendsScreenProps = Readonly<{
  onOpenTrend: (trendId: string) => void;
  now?: () => number;
  /** Change it to load the waves again (for example every time the tab comes into view). */
  refreshKey?: number;
}>;

export function TrendsScreen({ onOpenTrend, now = Date.now, refreshKey = 0 }: TrendsScreenProps) {
  const repos = useRepositories();
  const clock = useLatest(now);
  const load = useCallback(() => loadTrendBoard(repos, clock.current()), [repos, clock]);
  const { state, reload } = useLoad(load, refreshKey);

  if (state.status === 'loading') return <Message text={ru.trends.loading} />;
  if (state.status === 'error') {
    return <Message text={ru.trends.error} action={{ label: ru.trends.retry, run: reload }} />;
  }
  if (state.data.length === 0) return <Message text={ru.trends.empty} />;

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={state.data}
      keyExtractor={(row) => row.trend.id}
      renderItem={({ item }) => <TrendRow summary={item} onPress={onOpenTrend} />}
      ListHeaderComponent={<Text style={styles.title}>{ru.trends.title}</Text>}
      ListFooterComponent={<Text style={styles.disclaimer}>{ru.trends.disclaimer}</Text>}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingTop: spacing.xl },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.md },
  separator: { height: spacing.sm },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
