import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { Glyph, type GlyphName } from '../../components/Glyph';
import { Message } from '../../components/Message';
import { SilverView } from '../../components/SilverView';
import { Wave, WAVE_FILL } from '../../components/Wave';
import { useTabScreenContent } from '../../components/useTabScreenContent';
import { useRepositories } from '../../data/RepositoriesProvider';
import { CURRENT_USER_ID } from '../../data/seed'; // temporary: a real profile arrives with onboarding
import { demoProfile } from '../../data/seed/demoCommunity';
import { formatPoints } from '../../i18n/format';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';
import { MyInvestments } from '../investments/MyInvestments';
import { useLatest } from '../useLatest';
import { useLoad } from '../useLoad';
import { loadProfile, type ProfileView } from './profileService';
import { ProfileTabs, type ProfileTabKey } from './ProfileTabs';
import { PressableScale } from '../../motion/PressableScale';

const TAB_GLYPHS: Record<ProfileTabKey, GlyphName> = {
  posts: 'video',
  investments: 'trend',
  reposts: 'repost',
};

const HEADER_HEIGHT = 190;
const SHEET_TOP = 158;

type ProfileScreenProps = Readonly<{
  now?: () => number;
  /** Change it to load the profile again (for example every time the tab comes into view). */
  refreshKey?: number;
  onOpenSettings?: () => void;
  onOpenVideo?: (videoId: string) => void;
  onOpenFeed?: () => void;
  onOpenTopUp?: () => void;
  onOpenEarn?: () => void;
}>;

export function ProfileScreen({
  now = Date.now,
  refreshKey = 0,
  onOpenSettings,
  onOpenVideo,
  onOpenFeed,
  onOpenTopUp,
  onOpenEarn,
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
      onOpenTopUp={onOpenTopUp}
      onOpenEarn={onOpenEarn}
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
  onOpenTopUp?: () => void;
  onOpenEarn?: () => void;
}>;

function ProfileBody({
  profile,
  tab,
  onTab,
  refreshKey,
  onOpenSettings,
  onOpenVideo,
  onOpenFeed,
  onOpenTopUp,
  onOpenEarn,
}: BodyProps) {
  const styles = useStyles();
  const colors = useColors();
  const content = useTabScreenContent(styles.content);
  const t = ru.screens.profile;
  return (
    <View style={styles.page}>
      <View pointerEvents="none" style={styles.header}>
        <SilverView style={styles.circle} />
        <View style={styles.goldDot} />
      </View>
      <View pointerEvents="none" style={styles.sheet} />
      <ScrollView testID="profile-scroll" style={styles.scroll} contentContainerStyle={content}>
        <View style={styles.topBar}>
          <View style={styles.side} />
          <Text accessibilityRole="header" style={styles.handle}>
            {`@${profile.nickname}`}
          </Text>
          <PressableScale
            testID="profile-settings"
            accessibilityRole="button"
            accessibilityLabel={t.settings}
            onPress={onOpenSettings}
            style={styles.settings}
          >
            <Glyph name="sliders" size={20} color="#FFFFFF" />
          </PressableScale>
        </View>

        <View style={styles.who}>
          <View style={styles.avatarRing}>
            <Avatar
              testID="profile-avatar"
              initial={profile.nickname.slice(0, 1).toUpperCase()}
              tone="brand"
              size={78}
            />
          </View>
          <Text style={styles.name}>{demoProfile.displayName}</Text>
          <Text style={styles.bio}>{demoProfile.bio}</Text>
        </View>

        <Tiles profile={profile} onOpenTopUp={onOpenTopUp} />

        <View style={styles.buttons}>
          <View
            accessible
            accessibilityRole="button"
            accessibilityLabel={t.edit}
            accessibilityState={{ disabled: true }}
            style={[styles.button, styles.buttonSoft]}
          >
            <Text style={styles.buttonSoftText}>{t.edit}</Text>
          </View>
          <PressableScale
            testID="profile-earn"
            accessibilityRole="button"
            onPress={onOpenEarn}
            style={[styles.button, styles.buttonDark]}
          >
            <Glyph name="trend" size={18} color={colors.onPrimary} strokeWidth={2.4} />
            <Text style={styles.buttonDarkText}>{t.tasks}</Text>
          </PressableScale>
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
    </View>
  );
}

function Tiles({
  profile,
  onOpenTopUp,
}: Readonly<{ profile: ProfileView; onOpenTopUp?: () => void }>) {
  const styles = useStyles();
  const t = ru.screens.profile.stats;
  const rank = profile.rank === null ? '—' : `#${profile.rank}`;
  const spoken = (label: string, value: string) =>
    ru.screens.profile.statsLabel.replace('{label}', label).replace('{value}', value);
  const available = formatPoints(profile.balance);
  const followers = formatPoints(demoProfile.followers);
  return (
    <View style={styles.tiles}>
      <PressableScale
        testID="profile-available"
        accessibilityRole="button"
        accessibilityLabel={spoken(t.available, available)}
        onPress={onOpenTopUp}
        style={[styles.tile, styles.tileDark]}
      >
        <Wave size={60} />
        <View style={[styles.tileIcon, styles.tileIconDark]}>
          <Glyph name="plus" size={16} color="#FFFFFF" strokeWidth={2.4} />
        </View>
        <View>
          <Text testID="profile-balance" style={[styles.tileValue, styles.onDark]}>
            {available}
          </Text>
          <Text style={[styles.tileLabel, styles.onDarkMuted]}>{t.available}</Text>
        </View>
      </PressableScale>
      <SilverView style={styles.tile}>
        <View
          accessible
          accessibilityLabel={spoken(t.followers, followers)}
          style={styles.tileFill}
        >
          <Wave size={60} fill={WAVE_FILL.onChrome} />
          <View style={[styles.tileIcon, styles.tileIconInk]}>
            <Glyph name="person" size={16} color="#1A1A1A" strokeWidth={2.2} />
          </View>
          <View>
            <Text testID="profile-followers" style={[styles.tileValue, styles.onSilver]}>
              {followers}
            </Text>
            <Text style={[styles.tileLabel, styles.onSilverMuted]}>{t.followers}</Text>
          </View>
        </View>
      </SilverView>
      <View
        accessible
        accessibilityLabel={spoken(t.rank, rank)}
        style={[styles.tile, styles.tileBrand]}
      >
        <Wave size={80} fill={WAVE_FILL.onUltramarine} />
        <View style={[styles.tileIcon, styles.tileIconBrand]}>
          <Glyph name="arrowUp" size={16} color="#FFFFFF" strokeWidth={2.6} />
        </View>
        <View>
          <Text testID="profile-rank" style={[styles.tileValue, styles.onDark]}>
            {rank}
          </Text>
          <Text style={[styles.tileLabel, styles.onBrandMuted]}>{t.rank}</Text>
        </View>
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
        <PressableScale
          testID="profile-empty-action"
          accessibilityRole="button"
          accessibilityState={{ disabled: shoot }}
          disabled={shoot}
          onPress={shoot ? undefined : onOpenFeed}
          style={styles.cta}
        >
          {shoot ? (
            <Glyph name="plus" size={16} color={colors.onPrimary} strokeWidth={2.6} />
          ) : null}
          <Text style={styles.ctaText}>
            {shoot ? ru.screens.profile.shoot : ru.screens.profile.watch}
          </Text>
        </PressableScale>
      }
    />
  );
}

const useStyles = makeStyles((colors) => ({
  page: { flex: 1, backgroundColor: colors.background },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: HEADER_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  circle: {
    position: 'absolute',
    left: -50,
    top: 80,
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.85,
  },
  goldDot: {
    position: 'absolute',
    left: 318,
    top: 118,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E8B04B',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: SHEET_TOP,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.background,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },
  topBar: { height: 44, flexDirection: 'row', alignItems: 'center' },
  side: { width: 44, height: 44 },
  handle: {
    flex: 1,
    fontFamily: fontFamilies.bold,
    fontSize: 17,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  settings: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  who: { alignItems: 'center', gap: 4 },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 5,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.brand,
  },
  name: {
    marginTop: 8,
    fontFamily: fontFamilies.bold,
    fontSize: 20,
    letterSpacing: -0.4,
    color: colors.text,
  },
  bio: { fontFamily: fontFamilies.semibold, fontSize: 13, color: colors.textMuted },
  tiles: { flexDirection: 'row', gap: 10 },
  tile: {
    flex: 1,
    height: 92,
    padding: 12,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  tileFill: { flex: 1, justifyContent: 'space-between' },
  tileDark: { backgroundColor: '#1A1A1A' },
  tileBrand: { backgroundColor: '#3A3FD4' },
  tileIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIconDark: { backgroundColor: 'rgba(255,255,255,0.12)' },
  tileIconInk: { backgroundColor: 'rgba(26,26,26,0.08)' },
  tileIconBrand: { backgroundColor: 'rgba(255,255,255,0.16)' },
  tileValue: { fontFamily: fontFamilies.bold, fontSize: 17, letterSpacing: -0.3 },
  tileLabel: { fontFamily: fontFamilies.medium, fontSize: 11 },
  onDark: { color: '#FFFFFF' },
  onDarkMuted: { color: '#B5AC9D' },
  onBrandMuted: { color: '#C9CBF5' },
  onSilver: { color: '#1A1A1A' },
  onSilverMuted: { color: '#4A4F57' },
  buttons: { flexDirection: 'row', gap: 8 },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buttonSoft: { backgroundColor: colors.surfaceMuted, opacity: 0.7 },
  buttonSoftText: { fontFamily: fontFamilies.bold, fontSize: 15, color: colors.text },
  buttonDark: { backgroundColor: colors.primary },
  buttonDarkText: { fontFamily: fontFamilies.bold, fontSize: 15, color: colors.onPrimary },
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
  ctaText: { fontFamily: fontFamilies.bold, fontSize: 14, color: colors.onPrimary },
}));
