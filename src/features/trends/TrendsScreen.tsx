import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { useTabBarInset } from '../../components/useTabBarInset';
import { Message } from '../../components/Message';
import { useRepositories } from '../../data/RepositoriesProvider';
import { ru } from '../../i18n/ru';
import { iconSizes, colors, MIN_TOUCH_TARGET, radii, spacing, typography } from '../../theme';
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
  const bottomInset = useTabBarInset();

  if (state.status === 'loading') return <Message text={ru.trends.loading} />;
  if (state.status === 'error') {
    return <Message text={ru.trends.error} action={{ label: ru.trends.retry, run: reload }} />;
  }
  if (state.data.length === 0) return <Message text={ru.trends.empty} />;

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
      data={state.data}
      keyExtractor={(row) => row.trend.id}
      renderItem={({ item, index }) => (
        <TrendRow summary={item} rank={index + 1} onPress={onOpenTrend} />
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            {ru.trends.title}
          </Text>
          <Text style={styles.subtitle}>{ru.trends.subtitle}</Text>
          <Pressable
            accessibilityRole="search"
            accessibilityLabel={ru.trends.search}
            accessibilityState={{ disabled: true }}
            disabled
            style={styles.search}
          >
            <Icon name="search" size={iconSizes.md} color={colors.iconInactive} />
            <Text style={styles.searchText}>{ru.trends.search}</Text>
          </Pressable>
        </View>
      }
      ListFooterComponent={<Text style={styles.disclaimer}>{ru.trends.disclaimer}</Text>}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.gutter, paddingTop: spacing.xl },
  header: { gap: spacing.xs, marginBottom: spacing.md },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted },
  search: {
    minHeight: MIN_TOUCH_TARGET,
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  searchText: { ...typography.body, color: colors.textMuted },
  separator: { height: spacing.sm },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
