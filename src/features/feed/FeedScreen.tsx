import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { Message } from '../../components/Message';
import { CURRENT_USER_ID } from '../../data/seed'; // temporary: a real profile arrives with onboarding
import { ru } from '../../i18n/ru';
import { colors, spacing, typography } from '../../theme';
import { FeedTopTabs } from './FeedTopTabs';
import { SoonAction } from './SoonAction';
import { pickActiveIndex, type ViewableItem } from './feedLogic';
import { VideoCard } from './VideoCard';
import { useFeed } from './useFeed';

const VIEWABILITY = { itemVisiblePercentThreshold: 60 } as const;

type FeedScreenProps = Readonly<{
  /** False while another tab is open: pauses the video and stops counting views. */
  focused?: boolean;
  /** Opens the page of a video (its price, "put in" and "take out"). */
  onOpenVideo?: (videoId: string) => void;
}>;

export function FeedScreen({ focused = true, onOpenVideo }: FeedScreenProps) {
  const { state, actionFailed, like, markViewed, reload } = useFeed(CURRENT_USER_ID);
  const [height, setHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // FlatList does not allow this callback to change between renders, so keep it stable.
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewableItem[] }) => {
      const index = pickActiveIndex(viewableItems);
      if (index !== null) setActiveIndex(index);
    },
    [],
  );

  const items = state.status === 'ready' ? state.items : [];
  const activeId = items[activeIndex]?.video.id;
  useEffect(() => {
    if (activeId && height > 0 && focused) void markViewed(activeId);
  }, [activeId, height, focused, markViewed]);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => setHeight(event.nativeEvent.layout.height),
    [],
  );

  const retry = () => {
    setActiveIndex(0);
    reload();
  };

  if (state.status === 'loading') return <Message text={ru.feed.loading} />;
  if (state.status === 'error') {
    return <Message text={ru.feed.error} action={{ label: ru.feed.retry, run: retry }} />;
  }
  if (items.length === 0) return <Message text={ru.feed.empty} />;

  return (
    <View testID="feed-container" style={styles.container} onLayout={onLayout}>
      {height > 0 ? (
        <FlatList
          testID="feed-list"
          data={items}
          keyExtractor={(item) => item.video.id}
          renderItem={({ item, index }) => (
            <VideoCard
              item={item}
              height={height}
              isActive={index === activeIndex}
              focused={focused}
              onToggleLike={like}
              onOpenMarket={onOpenVideo}
            />
          )}
          getItemLayout={(_data, index) => ({ length: height, offset: height * index, index })}
          pagingEnabled
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={VIEWABILITY}
          initialNumToRender={2}
          windowSize={3}
        />
      ) : null}
      <View testID="feed-top-bar" style={styles.topBar} pointerEvents="box-none">
        <SoonAction testID="soon-add" icon="add" label={ru.feed.soon.add} />
        <FeedTopTabs />
        <SoonAction testID="soon-search" icon="search" label={ru.feed.soon.search} />
      </View>
      {actionFailed ? (
        <Text style={styles.toast} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {ru.feed.actionError}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toast: {
    ...typography.caption,
    position: 'absolute',
    top: spacing.xl,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    color: colors.text,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
});
