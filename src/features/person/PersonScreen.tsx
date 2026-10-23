import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Glyph } from '../../components/Glyph';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SilverView } from '../../components/SilverView';
import { useTopInset } from '../../components/useTopInset';
import { demoPerson } from '../../data/seed/demoPeople';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';

/** 12 400 → «12,4 тыс.»: one decimal, so one hundred more followers can be seen. */
const formatFollowers = (n: number): string =>
  `${(Math.floor(n / 100) / 10).toFixed(1).replace('.', ',')} ${ru.counts.thousand}`;

const TABS = ['posts', 'cards', 'invests'] as const;
type Tab = (typeof TABS)[number];

type PersonScreenProps = Readonly<{
  handle: string;
  onBack: () => void;
  onWrite?: () => void;
  onOpenClan?: () => void;
  onOpenVideo?: () => void;
}>;

/**
 * Another person's profile in the design. The person is made up (the handle on top is the one that was
 * opened); following only changes the button and the counter on the screen.
 */
export function PersonScreen({
  handle,
  onBack,
  onWrite,
  onOpenClan,
  onOpenVideo,
}: PersonScreenProps) {
  const styles = useStyles();
  const colors = useColors();
  const t = ru.person;
  const top = useTopInset();
  const person = demoPerson;
  const [following, setFollowing] = useState(false);
  const [tab, setTab] = useState<Tab>('posts');
  const followers = person.followers + (following ? 100 : 0);

  return (
    <ScrollView
      testID="person-scroll"
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingTop: top }]}
    >
      <ScreenHeader
        title={`@${handle}`}
        backLabel={ru.common.back}
        onBack={onBack}
        right={
          <View accessibilityLabel={t.more} style={styles.round}>
            <Glyph name="sliders" size={20} color={colors.text} />
          </View>
        }
      />

      <View style={styles.who}>
        <View style={styles.avatarWrap}>
          <View pointerEvents="none" style={styles.goldRing} />
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{handle.slice(0, 1).toUpperCase()}</Text>
          </View>
          <Text style={styles.rankTag}>{t.rankTag.replace('{n}', String(person.rank))}</Text>
        </View>
        <View style={styles.whoText}>
          <Text accessibilityRole="header" style={styles.name}>
            {person.name}
          </Text>
          <Text style={styles.bio}>{person.bio}</Text>
          <Pressable
            testID="person-clan"
            accessibilityRole="button"
            onPress={onOpenClan}
            style={styles.clan}
          >
            <SilverView style={styles.clanMark}>
              <Text style={styles.clanInitial}>{person.clan.initial}</Text>
            </SilverView>
            <Text style={styles.clanText}>
              {t.clanLine
                .replace('{name}', person.clan.name)
                .replace('{role}', ru.clan.role[person.clan.role])}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.stats}>
        {[
          [formatFollowers(followers), t.followers, 'person-followers'],
          [String(person.following), t.following, 'person-following'],
          [String(person.cards), t.cards, 'person-cards'],
          [`${person.accuracy}%`, t.accuracy, 'person-accuracy'],
        ].map(([value, label, id], index) => (
          <View key={label} style={[styles.stat, index > 0 && styles.statLine]}>
            <Text testID={id} style={styles.statValue}>
              {value}
            </Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttons}>
        <Pressable
          testID="person-follow"
          accessibilityRole="button"
          accessibilityState={{ selected: following }}
          onPress={() => setFollowing((value) => !value)}
          style={[styles.btn, following ? styles.followOn : styles.follow]}
        >
          <Text style={[styles.btnText, !following && styles.followText]}>
            {following ? t.subscribed : t.follow}
          </Text>
        </Pressable>
        <Pressable
          testID="person-write"
          accessibilityRole="button"
          onPress={onWrite}
          style={[styles.btn, styles.write]}
        >
          <Text style={styles.btnText}>{t.write}</Text>
        </Pressable>
        <View
          accessibilityRole="button"
          accessibilityLabel={t.gift}
          accessibilityState={{ disabled: true }}
          style={styles.giftWrap}
        >
          <SilverView style={styles.gift}>
            <Glyph name="chest" size={20} color="#1A1A1A" strokeWidth={2.2} />
          </SilverView>
        </View>
      </View>

      <View accessibilityRole="tablist" accessibilityLabel={t.tabsLabel} style={styles.tabs}>
        {TABS.map((key) => (
          <Pressable
            key={key}
            testID={`person-tab-${key}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: key === tab }}
            onPress={() => setTab(key)}
            style={styles.tab}
          >
            <Text style={[styles.tabLabel, key === tab && styles.tabLabelOn]}>{t.tabs[key]}</Text>
            <View style={[styles.bar, key === tab && styles.barOn]} />
          </Pressable>
        ))}
      </View>

      {tab === 'posts' ? (
        <View style={styles.grid}>
          {person.tiles.map((tile, index) => (
            <Pressable
              key={index}
              testID={`person-tile-${index}`}
              accessibilityRole="button"
              accessibilityLabel={t.views.replace('{n}', tile.views)}
              onPress={onOpenVideo}
              style={[styles.tile, { backgroundColor: tile.bg }]}
            >
              <View style={styles.tileCircle} />
              {tile.pinned ? <Text style={styles.pinned}>{t.pinned}</Text> : null}
              <View style={styles.views}>
                <Glyph name="video" size={12} color="#FFFFFF" filled strokeWidth={1} />
                <Text style={styles.viewsText}>{tile.views}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text testID="person-empty" style={styles.empty}>
          {t.emptyTab}
        </Text>
      )}
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  who: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarWrap: { width: 88, height: 88 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
  },
  goldRing: {
    position: 'absolute',
    left: -3,
    top: -3,
    right: -3,
    bottom: -3,
    borderRadius: 47,
    borderWidth: 3,
    borderColor: '#E8B04B',
  },
  avatarLetter: { fontFamily: fontFamilies.extrabold, fontSize: 38, color: colors.onBrand },
  rankTag: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: -8,
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.background,
    overflow: 'hidden',
    lineHeight: 18,
    fontFamily: fontFamilies.extrabold,
    fontSize: 11,
    color: '#1A1A1A',
    backgroundColor: '#E8B04B',
  },
  whoText: { flex: 1, gap: 4 },
  name: {
    fontFamily: fontFamilies.extrabold,
    fontSize: 22,
    letterSpacing: -0.5,
    color: colors.text,
  },
  bio: { fontFamily: fontFamilies.medium, fontSize: 13, lineHeight: 18, color: colors.textMuted },
  clan: {
    alignSelf: 'flex-start',
    height: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 4,
    paddingRight: 10,
    borderRadius: 13,
    backgroundColor: colors.surface,
  },
  clanMark: {
    width: 18,
    height: 18,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clanInitial: { fontFamily: fontFamilies.extrabold, fontSize: 10, color: '#1A1A1A' },
  clanText: { fontFamily: fontFamilies.extrabold, fontSize: 12, color: colors.text },
  stats: {
    marginTop: 4,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statLine: { borderLeftWidth: 1, borderLeftColor: colors.border },
  statValue: { fontFamily: fontFamilies.extrabold, fontSize: 17, color: colors.text },
  statLabel: { fontFamily: fontFamilies.semibold, fontSize: 12, color: colors.textMuted },
  buttons: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: fontFamilies.extrabold, fontSize: 15, color: colors.text },
  follow: { backgroundColor: colors.primary },
  followText: { color: colors.onPrimary },
  followOn: { borderWidth: 1.5, borderColor: colors.fieldBorder, backgroundColor: colors.surface },
  write: { borderWidth: 1.5, borderColor: colors.text, backgroundColor: colors.surface },
  giftWrap: { width: 48, height: 48, borderRadius: 14, overflow: 'hidden', opacity: 0.6 },
  gift: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, height: 44, alignItems: 'center', justifyContent: 'flex-end', gap: 9 },
  tabLabel: { fontFamily: fontFamilies.extrabold, fontSize: 14, color: colors.textMuted },
  tabLabelOn: { color: colors.text },
  bar: { width: 40, height: 3, borderRadius: 2, backgroundColor: 'transparent' },
  barOn: { backgroundColor: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginHorizontal: -12 },
  tile: { width: '32.6%', height: 158, borderRadius: 6, overflow: 'hidden' },
  tileCircle: {
    position: 'absolute',
    right: '-20%',
    top: '-16%',
    width: '70%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  pinned: {
    position: 'absolute',
    left: 6,
    top: 6,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    overflow: 'hidden',
    lineHeight: 18,
    fontFamily: fontFamilies.extrabold,
    fontSize: 10,
    color: '#1A1A1A',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  views: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: { fontFamily: fontFamilies.extrabold, fontSize: 12, color: '#FFFFFF' },
  empty: {
    paddingVertical: 32,
    textAlign: 'center',
    fontFamily: fontFamilies.semibold,
    fontSize: 14,
    color: colors.textMuted,
  },
}));
