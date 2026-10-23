import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Message } from '../../components/Message';
import { useTabBarInset } from '../../components/useTabBarInset';
import { useRepositories } from '../../data/RepositoriesProvider';
import { formatCount, countLabel } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { colors, radii, spacing, typography } from '../../theme';
import { useLoad } from '../useLoad';
import { RankBadge } from '../trends/RankBadge';
import { loadRatings } from './hubService';

type HubScreenProps = Readonly<{
  onOpenVideo: (videoId: string) => void;
  /** Change it to load the ratings again (for example every time the tab comes into view). */
  refreshKey?: number;
}>;

type Section = 'videos' | 'authors';

export function HubScreen({ onOpenVideo, refreshKey = 0 }: HubScreenProps) {
  const repos = useRepositories();
  const load = useCallback(() => loadRatings(repos), [repos]);
  const { state, reload } = useLoad(load, refreshKey);
  const [section, setSection] = useState<Section>('videos');
  const bottomInset = useTabBarInset();

  if (state.status === 'loading') return <Message text={ru.hub.loading} />;
  if (state.status === 'error') {
    return <Message text={ru.hub.error} action={{ label: ru.hub.retry, run: reload }} />;
  }
  const { videos, authors } = state.data;
  if (videos.length === 0) return <Message text={ru.hub.empty} />;

  const header = (
    <View style={styles.header}>
      <Text style={styles.title} accessibilityRole="header">
        {ru.hub.title}
      </Text>
      <Text style={styles.subtitle}>{ru.hub.subtitle}</Text>
      <View style={styles.chips}>
        <Button
          testID="hub-chip-videos"
          variant="chip"
          label={ru.hub.sections.videos}
          selected={section === 'videos'}
          onPress={() => setSection('videos')}
        />
        <Button
          testID="hub-chip-authors"
          variant="chip"
          label={ru.hub.sections.authors}
          selected={section === 'authors'}
          onPress={() => setSection('authors')}
        />
      </View>
    </View>
  );
  const footer = <Text style={styles.disclaimer}>{ru.hub.disclaimer}</Text>;
  const common = {
    style: styles.list,
    contentContainerStyle: [styles.content, { paddingBottom: bottomInset }],
    ListHeaderComponent: header,
    ListFooterComponent: footer,
    ItemSeparatorComponent: Separator,
  };

  if (section === 'authors') {
    return (
      <FlatList
        {...common}
        data={authors}
        keyExtractor={(row) => row.authorId}
        renderItem={({ item, index }) => (
          <View
            testID={`hub-author-${item.authorId}`}
            accessible
            accessibilityLabel={`${index + 1}. ${item.name}, ${ru.hub.price} ${formatCount(item.total)}, ${countLabel(item.videoCount, ru.hub.videoForms)}`}
            style={styles.row}
          >
            <RankBadge rank={index + 1} trendId={item.authorId} />
            <View style={styles.main}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{countLabel(item.videoCount, ru.hub.videoForms)}</Text>
            </View>
            <Text style={styles.price}>{formatCount(item.total)}</Text>
          </View>
        )}
      />
    );
  }
  return (
    <FlatList
      {...common}
      data={videos}
      keyExtractor={(row) => row.video.id}
      renderItem={({ item, index }) => (
        <Pressable
          testID={`hub-video-${item.video.id}`}
          accessibilityRole="button"
          accessibilityLabel={`${index + 1}. ${item.video.title}, ${item.authorName}, ${ru.hub.price} ${formatCount(item.price)}`}
          onPress={() => onOpenVideo(item.video.id)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <RankBadge rank={index + 1} trendId={item.video.id} />
          <View style={styles.main}>
            <Text style={styles.name} numberOfLines={2}>
              {item.video.title}
            </Text>
            {item.authorName ? <Text style={styles.meta}>{item.authorName}</Text> : null}
          </View>
          <Text style={styles.price}>{formatCount(item.price)}</Text>
        </Pressable>
      )}
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.gutter, paddingTop: spacing.xl },
  header: { gap: spacing.xs, marginBottom: spacing.md },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted },
  chips: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85 },
  main: { flex: 1, gap: spacing.xxs },
  name: { ...typography.titleSmall, color: colors.text },
  meta: { ...typography.caption, color: colors.textMuted },
  price: { ...typography.figure, color: colors.text },
  separator: { height: spacing.sm },
  disclaimer: { ...typography.caption, color: colors.textMuted, marginTop: spacing.md },
});
