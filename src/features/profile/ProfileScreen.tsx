import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuraText } from '../../components/AuraText';
import { Icon } from '../../components/Icon';
import { useTabBarInset } from '../../components/useTabBarInset';
import { Message } from '../../components/Message';
import { useRepositories } from '../../data/RepositoriesProvider';
import { CURRENT_USER_ID } from '../../data/seed'; // temporary: a real profile arrives with onboarding
import { formatPoints } from '../../i18n/format';
import { pluralRu } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { iconSizes, colors as c, MIN_TOUCH_TARGET, radii, spacing, typography } from '../../theme';
import { MyPredictions } from '../predictions/MyPredictions';
import { useLatest } from '../useLatest';
import { useLoad } from '../useLoad';
import { loadProfile } from './profileService';
import { ProfileTabs, type ProfileTabKey } from './ProfileTabs';

const AVATAR_SIZE = 72;

type TabContentProps = Readonly<{ tab: ProfileTabKey; now: () => number; refreshKey: number }>;

/** What lies under the icon tabs: the predictions list, or an invitation where there is nothing yet. */
function TabContent({ tab, now, refreshKey }: TabContentProps) {
  const texts = ru.screens.profile;
  if (tab === 'predictions') {
    return (
      <View style={styles.list}>
        <MyPredictions now={now} refreshKey={refreshKey} emptyText={texts.predictionsEmpty} />
      </View>
    );
  }
  const reposts = tab === 'reposts';
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>
        {reposts ? texts.repostsEmptyTitle : texts.videosEmptyTitle}
      </Text>
      <Text style={styles.emptyText}>{reposts ? texts.repostsEmptyText : texts.subtitle}</Text>
    </View>
  );
}

type ProfileScreenProps = Readonly<{
  now?: () => number;
  refreshKey?: number;
  onOpenSettings?: () => void;
}>;

/** A control that is drawn like the reference but does nothing yet. */
function SoonButton({
  name,
  label,
  onPress,
}: Readonly<{ name: 'add' | 'menu'; label: string; onPress?: () => void }>) {
  const disabled = onPress === undefined;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={styles.iconButton}
    >
      <Icon name={name === 'add' ? 'add' : 'menu'} size={iconSizes.lg} color={c.text} />
    </Pressable>
  );
}

export function ProfileScreen({
  now = Date.now,
  refreshKey = 0,
  onOpenSettings,
}: ProfileScreenProps) {
  const repos = useRepositories();
  const clock = useLatest(now);
  const load = useCallback(
    () => loadProfile(repos, CURRENT_USER_ID, clock.current()),
    [repos, clock],
  );
  const { state, reload } = useLoad(load, refreshKey);
  const bottomInset = useTabBarInset();
  const [tab, setTab] = useState<ProfileTabKey>('videos');

  if (state.status === 'loading') return <Message text={ru.screens.profile.loading} />;
  if (state.status === 'error') {
    return (
      <Message
        text={ru.screens.profile.error}
        action={{ label: ru.screens.profile.retry, run: reload }}
      />
    );
  }

  const { nickname, balance } = state.data;
  const texts = ru.screens.profile;
  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
    >
      <View style={styles.topBar}>
        <SoonButton name="add" label={texts.add} />
        <Text style={styles.handle} accessibilityRole="header">
          @{nickname}
        </Text>
        <SoonButton name="menu" label={texts.menu} onPress={onOpenSettings} />
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
          <AuraText style={styles.statLabel}>{pluralRu(balance, ru.wallet.sparks)}</AuraText>
        </View>
      </View>

      <View testID="profile-available" style={styles.available}>
        <AuraText style={styles.availableText}>
          {`${texts.available}: ${formatPoints(balance)} ${pluralRu(balance, ru.wallet.sparks)}`}
        </AuraText>
        <View accessible accessibilityLabel={texts.availableInfo}>
          <Icon name="information-circle-outline" size={iconSizes.sm} color={c.iconInactive} />
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

      <ProfileTabs selected={tab} onSelect={setTab} />

      <TabContent tab={tab} now={now} refreshKey={refreshKey} />
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
  statValue: { ...typography.figureXL, color: c.text },
  statLabel: { ...typography.caption, color: c.textMuted },
  edit: {
    marginTop: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.control,
    backgroundColor: c.surfaceMuted,
  },
  editText: { ...typography.bodyStrong, color: c.textMuted },
  available: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  availableText: { ...typography.bodySmall, color: c.textMuted },
  list: { paddingTop: spacing.md },
  empty: { alignItems: 'center', gap: spacing.xs, paddingTop: spacing.xl },
  emptyTitle: { ...typography.heading, color: c.text },
  emptyText: { ...typography.body, color: c.textMuted, textAlign: 'center' },
});
