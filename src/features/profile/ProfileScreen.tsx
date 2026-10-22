import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { Message } from '../../components/Message';
import { useRepositories } from '../../data/RepositoriesProvider';
import { CURRENT_USER_ID } from '../../data/seed'; // temporary: a real profile arrives with onboarding
import { formatPoints } from '../../i18n/format';
import { pluralRu } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import {
  iconSizes,
  lightColors as c,
  MIN_TOUCH_TARGET,
  radii,
  spacing,
  typography,
} from '../../theme';
import { useLatest } from '../useLatest';
import { useLoad } from '../useLoad';
import { loadProfile } from './profileService';

const AVATAR_SIZE = 72;
const TAB_KEYS = ['videos', 'predictions', 'likes'] as const;
type TabKey = (typeof TAB_KEYS)[number];

type ProfileScreenProps = Readonly<{ now?: () => number; refreshKey?: number }>;

/** A control that is drawn like the reference but does nothing yet. */
function SoonButton({ name, label }: Readonly<{ name: 'add' | 'menu'; label: string }>) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: true }}
      disabled
      style={styles.iconButton}
    >
      <Icon name={name === 'add' ? 'add' : 'menu'} size={iconSizes.lg} color={c.text} />
    </Pressable>
  );
}

export function ProfileScreen({ now = Date.now, refreshKey = 0 }: ProfileScreenProps) {
  const repos = useRepositories();
  const clock = useLatest(now);
  const load = useCallback(
    () => loadProfile(repos, CURRENT_USER_ID, clock.current()),
    [repos, clock],
  );
  const { state, reload } = useLoad(load, refreshKey);
  const [tab, setTab] = useState<TabKey>('predictions');

  if (state.status === 'loading') return <Message light text={ru.screens.profile.loading} />;
  if (state.status === 'error') {
    return (
      <Message
        light
        text={ru.screens.profile.error}
        action={{ label: ru.screens.profile.retry, run: reload }}
      />
    );
  }

  const { nickname, balance } = state.data;
  const texts = ru.screens.profile;
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <SoonButton name="add" label={texts.add} />
        <Text style={styles.handle} accessibilityRole="header">
          @{nickname}
        </Text>
        <SoonButton name="menu" label={texts.menu} />
      </View>

      <View style={styles.head}>
        <View testID="profile-avatar" style={styles.avatar}>
          <Text style={styles.avatarLetter}>{nickname.slice(0, 1).toUpperCase()}</Text>
        </View>
        <View
          accessible
          accessibilityLabel={`${formatPoints(balance)} ${pluralRu(balance, ru.wallet.sparks)}`}
          style={styles.stat}
        >
          <Text testID="profile-balance" style={styles.statValue}>
            {formatPoints(balance)}
          </Text>
          <Text style={styles.statLabel}>{texts.sparksLabel}</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={texts.edit}
        accessibilityState={{ disabled: true }}
        disabled
        style={styles.edit}
      >
        <Text style={styles.editText}>{texts.edit}</Text>
      </Pressable>

      <View accessibilityRole="tablist" style={styles.tabs}>
        {TAB_KEYS.map((key) => {
          const selected = key === tab;
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={texts.tabs[key]}
              accessibilityState={{ selected }}
              onPress={() => setTab(key)}
              style={[styles.tab, selected && styles.tabSelected]}
            >
              <Text style={[styles.tabText, selected && styles.tabTextSelected]}>
                {texts.tabs[key]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{texts.tabs[tab]}</Text>
        <Text style={styles.emptyText}>{texts.subtitle}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: c.background },
  content: { paddingHorizontal: spacing.gutter, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: { ...typography.heading, color: c.text },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.md },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primary,
  },
  avatarLetter: { ...typography.title, color: c.onPrimary },
  stat: { gap: spacing.xxs },
  statValue: { ...typography.title, color: c.text },
  statLabel: { ...typography.caption, color: c.textMuted },
  edit: {
    marginTop: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: c.surfaceMuted,
  },
  editText: { ...typography.bodyStrong, color: c.textMuted },
  tabs: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  tab: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabSelected: { borderBottomColor: c.text },
  tabText: { ...typography.bodyStrong, color: c.textMuted },
  tabTextSelected: { color: c.text },
  empty: { alignItems: 'center', gap: spacing.xs, paddingTop: spacing.xl },
  emptyTitle: { ...typography.heading, color: c.text },
  emptyText: { ...typography.body, color: c.textMuted, textAlign: 'center' },
});
