import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { AuraCoin } from '../../components/AuraIcon';
import { AuraText } from '../../components/AuraText';
import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { Glyph, type GlyphName } from '../../components/Glyph';
import { Message } from '../../components/Message';
import { useTabScreenContent } from '../../components/useTabScreenContent';
import { useRepositories } from '../../data/RepositoriesProvider';
import { CURRENT_USER_ID } from '../../data/seed'; // temporary: a real profile arrives with onboarding
import { formatPoints } from '../../i18n/format';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';
import { MyInvestments } from '../investments/MyInvestments';
import { useLatest } from '../useLatest';
import { useLoad } from '../useLoad';
import { loadProfile, type ProfileView } from './profileService';
import { ProfileTabs, type ProfileTabKey } from './ProfileTabs';

const TAB_GLYPHS: Record<ProfileTabKey, GlyphName> = {
  posts: 'video',
  investments: 'trend',
  reposts: 'repost',
};

type ProfileScreenProps = Readonly<{
  now?: () => number;
  /** Change it to load the profile again (for example every time the tab comes into view). */
  refreshKey?: number;
  onOpenSettings?: () => void;
  onOpenVideo?: (videoId: string) => void;
  onOpenFeed?: () => void;
}>;

export function ProfileScreen({
  now = Date.now,
  refreshKey = 0,
  onOpenSettings,
  onOpenVideo,
  onOpenFeed,
}: ProfileScreenProps) {
  const repos = useRepositories();
  const clock = useLatest(now);
  const load = useCallback(
    () => loadProfile(repos, CURRENT_USER_ID, clock.current()),
    [repos, clock],
  );
  const { state, reload } = useLoad(load, refreshKey);
  const [tab, setTab] = useState<ProfileTabKey>('posts');

  if (state.status === 'loading') return <Message text={ru.screens.profile.loading} />;
  if (state.status === 'error') {
    return (
      <Message
        text={ru.screens.profile.error}
        action={{ label: ru.screens.profile.retry, run: reload }}
      />
    );
  }
  return (
    <ProfileBody
      profile={state.data}
      tab={tab}
      onTab={setTab}
      refreshKey={refreshKey}
      onOpenSettings={onOpenSettings}
      onOpenVideo={onOpenVideo}
      onOpenFeed={onOpenFeed}
    />
  );
}

type BodyProps = Readonly<{
  profile: ProfileView;
  tab: ProfileTabKey;
  onTab: (key: ProfileTabKey) => void;
  refreshKey: number;
  onOpenSettings?: () => void;
  onOpenVideo?: (videoId: string) => void;
  onOpenFeed?: () => void;
}>;

function ProfileBody({
  profile,
  tab,
  onTab,
  refreshKey,
  onOpenSettings,
  onOpenVideo,
  onOpenFeed,
}: BodyProps) {
  const styles = useStyles();
  const colors = useColors();
  const content = useTabScreenContent(styles.content);
  const t = ru.screens.profile;
  return (
    <ScrollView testID="profile-scroll" style={styles.page} contentContainerStyle={content}>
      <View style={styles.topBar}>
        <View style={styles.side} />
        <Text accessibilityRole="header" style={styles.handle}>
          {`@${profile.nickname}`}
        </Text>
        <Pressable
          testID="profile-settings"
          accessibilityRole="button"
          accessibilityLabel={t.settings}
          onPress={onOpenSettings}
          style={styles.side}
        >
          <View style={styles.round}>
            <Glyph name="sliders" size={20} color={colors.text} />
          </View>
        </Pressable>
      </View>

      <View style={styles.who}>
        <View style={styles.avatarRing}>
          <Avatar
            testID="profile-avatar"
            initial={profile.nickname.slice(0, 1).toUpperCase()}
            tone="brand"
            size={88}
          />
        </View>
        <Text style={styles.name}>{profile.nickname}</Text>
        <Text style={styles.bio}>{t.bio}</Text>
      </View>

      <Stats profile={profile} />

      <View testID="profile-available" style={styles.available}>
        <View style={styles.availableLeft}>
          <Text style={styles.availableLabel}>{t.available}</Text>
          <View style={styles.availableRow}>
            <AuraCoin size={22} />
            <Text testID="profile-balance" style={styles.availableValue}>
              {formatPoints(profile.balance)}
            </Text>
          </View>
        </View>
        <Text style={styles.invested}>
          {`${formatPoints(profile.inInvestments)}\n${t.invested}`}
        </Text>
      </View>

      <View style={styles.buttons}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          style={[styles.button, styles.buttonLine]}
        >
          <Text style={styles.buttonLineText}>{t.edit}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          style={[styles.button, styles.buttonDark]}
        >
          <Text style={styles.buttonDarkText}>{t.tasks}</Text>
        </Pressable>
      </View>

      <ProfileTabs selected={tab} onSelect={onTab} />

      {tab === 'investments' ? (
        <MyInvestments
          refreshKey={refreshKey}
          onOpenVideo={onOpenVideo}
          renderEmpty={() => <Empty tab="investments" onOpenFeed={onOpenFeed} />}
        />
      ) : (
        <Empty tab={tab} onOpenFeed={onOpenFeed} />
      )}
    </ScrollView>
  );
}

function Stats({ profile }: Readonly<{ profile: ProfileView }>) {
  const styles = useStyles();
  const t = ru.screens.profile.stats;
  return (
    <View style={styles.stats}>
      <View style={styles.stat}>
        <View style={styles.statRow}>
          <AuraCoin size={16} />
          <Text style={styles.statValue}>{formatPoints(profile.balance)}</Text>
        </View>
        <Text style={styles.statLabel}>{t.balance}</Text>
      </View>
      <View style={[styles.stat, styles.statMiddle]}>
        <Text style={styles.statValue}>0</Text>
        <Text style={styles.statLabel}>{t.followers}</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statValue}>{profile.rank === null ? '—' : `#${profile.rank}`}</Text>
        <Text style={styles.statLabel}>{t.rank}</Text>
      </View>
    </View>
  );
}

type EmptyProps = Readonly<{ tab: ProfileTabKey; onOpenFeed?: () => void }>;

function Empty({ tab, onOpenFeed }: EmptyProps) {
  const styles = useStyles();
  const colors = useColors();
  const [title, text] = ru.screens.profile.empty[tab];
  const shoot = tab === 'posts';
  return (
    <EmptyState
      testID={`profile-empty-${tab}`}
      icon={<Glyph name={TAB_GLYPHS[tab]} size={28} color={colors.textSecondary} />}
      title={title}
      text={text}
      action={
        <Pressable
          testID="profile-empty-action"
          accessibilityRole="button"
          onPress={shoot ? undefined : onOpenFeed}
          style={styles.cta}
        >
          {shoot ? (
            <Glyph name="plus" size={16} color={colors.onPrimary} strokeWidth={2.6} />
          ) : null}
          <AuraText style={styles.ctaText}>
            {shoot ? ru.screens.profile.shoot : ru.screens.profile.watch}
          </AuraText>
        </Pressable>
      }
    />
  );
}

const useStyles = makeStyles((colors) => ({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, gap: 12 },
  topBar: { height: 44, flexDirection: 'row', alignItems: 'center' },
  side: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  handle: {
    flex: 1,
    fontFamily: fontFamilies.extrabold,
    fontSize: 17,
    textAlign: 'center',
    color: colors.text,
  },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  who: { alignItems: 'center', gap: 4 },
  avatarRing: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 3,
    borderColor: '#C7CBD1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: 8,
    fontFamily: fontFamilies.extrabold,
    fontSize: 20,
    letterSpacing: -0.4,
    color: colors.text,
  },
  bio: { fontFamily: fontFamilies.semibold, fontSize: 13, color: colors.textMuted },
  stats: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statMiddle: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontFamily: fontFamilies.extrabold, fontSize: 17, color: colors.text },
  statLabel: { fontFamily: fontFamilies.bold, fontSize: 12, color: colors.textMuted },
  available: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
  },
  availableLeft: { gap: 2 },
  availableLabel: { fontFamily: fontFamilies.extrabold, fontSize: 12, color: colors.textSecondary },
  availableRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  availableValue: { fontFamily: fontFamilies.displayHeavy, fontSize: 22, color: colors.text },
  invested: {
    textAlign: 'right',
    fontFamily: fontFamilies.bold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  buttons: { flexDirection: 'row', gap: 8 },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  buttonLine: { borderWidth: 1.5, borderColor: colors.text, backgroundColor: colors.surface },
  buttonLineText: { fontFamily: fontFamilies.extrabold, fontSize: 15, color: colors.text },
  buttonDark: { backgroundColor: colors.primary },
  buttonDarkText: { fontFamily: fontFamilies.extrabold, fontSize: 15, color: colors.onPrimary },
  cta: {
    marginTop: 8,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  ctaText: { fontFamily: fontFamilies.extrabold, fontSize: 14, color: colors.onPrimary },
}));
