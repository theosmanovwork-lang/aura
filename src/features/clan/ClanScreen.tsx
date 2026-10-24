import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

import { Avatar } from '../../components/Avatar';
import { Glyph } from '../../components/Glyph';
import { Message } from '../../components/Message';
import { SilverView } from '../../components/SilverView';
import { useTopInset } from '../../components/useTopInset';
import { demoClanProfile, type DemoClanMember } from '../../data/seed/demoPeople';
import { pluralRu } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles } from '../../theme';
import { PressableScale } from '../../motion/PressableScale';

type ClanScreenProps = Readonly<{
  clanId: string;
  onBack: () => void;
  onOpenChat?: () => void;
  onOpenUser?: (name: string) => void;
}>;

/** The page of a clan. Joining is only drawn: the button changes its text and nothing is sent. */
export function ClanScreen({ clanId, onBack, onOpenChat, onOpenUser }: ClanScreenProps) {
  const styles = useStyles();
  const t = ru.clan;
  const top = useTopInset();
  const clan = demoClanProfile;
  const [sent, setSent] = useState(false);

  if (clanId !== clan.id) {
    return <Message text={t.notFound} action={{ label: ru.common.back, run: onBack }} />;
  }
  return (
    <ScrollView testID="clan-scroll" style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={[styles.heroTop, { top }]}>
          <PressableScale
            testID="screen-back"
            accessibilityRole="button"
            accessibilityLabel={ru.common.back}
            onPress={onBack}
            style={styles.heroBtn}
          >
            <Glyph name="chevronLeft" size={20} color="#FFFFFF" strokeWidth={2.4} />
          </PressableScale>
          <View accessibilityLabel={t.share} style={styles.heroBtn}>
            <Glyph name="share" size={20} color="#FFFFFF" />
          </View>
        </View>
        <View style={[styles.heroBody, { paddingTop: top + 42 }]}>
          <Emblem initial={clan.initial} label={t.emblemAlt.replace('{name}', clan.name)} />
          <Text accessibilityRole="header" style={styles.clanName}>
            {clan.name}
          </Text>
          <View style={styles.heroLine}>
            <Text style={styles.rankTag}>{t.top.replace('{n}', String(clan.rank))}</Text>
            <Text style={styles.heroMeta}>
              {t.members
                .replace('{n}', String(clan.members))
                .replace('{max}', String(clan.capacity))
                .replace('{level}', String(clan.level))}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.actions}>
          <PressableScale
            testID="clan-join"
            accessibilityRole="button"
            accessibilityState={{ selected: sent }}
            onPress={() => setSent((value) => !value)}
            style={styles.joinWrap}
          >
            {sent ? (
              <View style={[styles.join, styles.joinSent]}>
                <Text style={styles.joinText}>{t.sent}</Text>
              </View>
            ) : (
              <SilverView style={styles.join}>
                <Text style={styles.joinText}>{t.join}</Text>
              </SilverView>
            )}
          </PressableScale>
          <PressableScale
            testID="clan-chat"
            accessibilityRole="button"
            accessibilityLabel={t.chat}
            onPress={onOpenChat}
            style={styles.chatBtn}
          >
            <Glyph name="chat" size={22} color="#1A1A1A" />
          </PressableScale>
        </View>

        <Stats />
        <WeeklyChest />
        <Members members={clan.list} onOpenUser={onOpenUser} />

        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.section}>
            {t.about}
          </Text>
          <Text style={styles.about}>{clan.about}</Text>
          <View style={styles.tags}>
            {clan.tags.map((tag) => (
              <Text key={tag} style={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function Emblem({ initial, label }: Readonly<{ initial: string; label: string }>) {
  return (
    <Svg accessibilityLabel={label} role="img" width={96} height={108} viewBox="0 0 96 108">
      <Defs>
        <LinearGradient id="clanChrome" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F7F8FA" />
          <Stop offset="0.4" stopColor="#C9CDD3" />
          <Stop offset="0.56" stopColor="#F1F2F4" />
          <Stop offset="1" stopColor="#A9AEB6" />
        </LinearGradient>
      </Defs>
      <Path
        d="M48 4 L88 18 V52 C88 78 70 96 48 104 C26 96 8 78 8 52 V18 Z"
        fill="url(#clanChrome)"
      />
      <Path d="M48 14 L79 25 V52 C79 72 66 86 48 93 C30 86 17 72 17 52 V25 Z" fill="#1A1A1A" />
      <SvgText
        x="48"
        y="68"
        textAnchor="middle"
        fontFamily="Unbounded_800ExtraBold"
        fontSize="34"
        fontWeight="800"
        fill="#FFFFFF"
      >
        {initial}
      </SvgText>
      <Path
        d="M30 30 L34 26 M66 30 L62 26"
        stroke="#C9CDD3"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function Stats() {
  const styles = useStyles();
  const t = ru.clan;
  const { stats } = demoClanProfile;
  const items = [
    [stats.points, t.points],
    [stats.cards, t.cards],
    [stats.week, t.week],
  ] as const;
  return (
    <View style={styles.stats}>
      {items.map(([value, label], index) => (
        <View key={label} style={[styles.stat, index === 1 && styles.statMiddle]}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

function WeeklyChest() {
  const styles = useStyles();
  const t = ru.clan;
  const { chest } = demoClanProfile;
  return (
    <View testID="clan-chest" style={styles.chest}>
      <View style={styles.chestHead}>
        <View style={styles.chestTexts}>
          <Text style={styles.chestTitle}>{t.chestTitle}</Text>
          <Text style={styles.chestSub}>
            {t.chestText
              .replace('{total}', String(chest.total))
              .replace('{days}', `${chest.days} ${pluralRu(chest.days, t.chestDays)}`)}
          </Text>
        </View>
        <Glyph name="chest" size={40} color="#E8B04B" strokeWidth={1.8} />
      </View>
      <View
        accessible
        accessibilityLabel={t.chestSpoken
          .replace('{done}', String(chest.done))
          .replace('{total}', String(chest.total))}
        style={styles.segments}
      >
        {Array.from({ length: chest.total }, (_, i) => (
          <View key={i} style={[styles.segment, i < chest.done && styles.segmentOn]} />
        ))}
      </View>
      <Text style={styles.chestNext}>
        {t.chestProgress
          .replace('{done}', String(chest.done))
          .replace('{total}', String(chest.total))
          .replace('{next}', chest.next)}
      </Text>
    </View>
  );
}

type MembersProps = Readonly<{
  members: readonly DemoClanMember[];
  onOpenUser?: (name: string) => void;
}>;

function Members({ members, onOpenUser }: MembersProps) {
  const styles = useStyles();
  const t = ru.clan;
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text accessibilityRole="header" style={styles.section}>
          {t.people}
        </Text>
        <Text style={styles.link}>{t.all.replace('{n}', String(demoClanProfile.members))}</Text>
      </View>
      {members.map((member) => (
        <PressableScale
          key={member.name}
          testID={`member-${member.name}`}
          accessibilityRole="button"
          accessibilityLabel={`${member.place}. ${member.name}, ${member.meta}`}
          onPress={() => onOpenUser?.(member.name)}
          style={styles.member}
        >
          <Text style={styles.place}>{member.place}</Text>
          <View style={member.ring ? [styles.ring, { borderColor: member.ring }] : styles.noRing}>
            <Avatar initial={member.initial} tone={member.tone} size={36} square />
          </View>
          <View style={styles.memberText}>
            <View style={styles.memberName}>
              <Text style={styles.name}>{member.name}</Text>
              {member.role ? (
                <Text
                  style={[
                    styles.role,
                    member.role === 'leader' ? styles.roleLeader : styles.roleOfficer,
                  ]}
                >
                  {t.role[member.role]}
                </Text>
              ) : null}
            </View>
            <Text style={styles.meta}>{member.meta}</Text>
          </View>
          <Text style={styles.points}>{member.points}</Text>
        </PressableScale>
      ))}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  hero: { height: 330, overflow: 'hidden', backgroundColor: '#1A1A1A' },
  heroTop: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroBody: { alignItems: 'center', gap: 10 },
  clanName: {
    fontFamily: fontFamilies.bold,
    fontSize: 28,
    letterSpacing: -0.8,
    color: '#FFFFFF',
  },
  heroLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rankTag: {
    height: 24,
    paddingHorizontal: 9,
    borderRadius: 12,
    overflow: 'hidden',
    lineHeight: 24,
    fontFamily: fontFamilies.bold,
    fontSize: 13,
    color: '#1A1A1A',
    backgroundColor: '#E8B04B',
  },
  heroMeta: { fontFamily: fontFamilies.bold, fontSize: 13, color: '#CFC6B6' },
  body: { marginTop: -24, paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  joinWrap: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  join: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  joinSent: { backgroundColor: colors.surface },
  joinText: { fontFamily: fontFamilies.bold, fontSize: 16, color: '#1A1A1A' },
  chatBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  stats: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statMiddle: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border },
  statValue: { fontFamily: fontFamilies.displayHeavy, fontSize: 16, color: colors.text },
  statLabel: { fontFamily: fontFamilies.semibold, fontSize: 12, color: colors.textMuted },
  chest: { padding: 16, borderRadius: 20, gap: 12, backgroundColor: colors.heroCard },
  chestHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chestTexts: { flex: 1, gap: 2 },
  chestTitle: { fontFamily: fontFamilies.bold, fontSize: 16, color: colors.onHeroCard },
  chestSub: { fontFamily: fontFamilies.semibold, fontSize: 12, color: colors.heroMuted },
  segments: { flexDirection: 'row', gap: 4 },
  segment: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.14)' },
  segmentOn: { backgroundColor: '#D7DAE0' },
  chestNext: { fontFamily: fontFamilies.bold, fontSize: 13, color: '#D7DAE0' },
  card: { padding: 16, borderRadius: 20, gap: 4, backgroundColor: colors.surface },
  cardHead: {
    height: 28,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: { fontFamily: fontFamilies.bold, fontSize: 18, color: colors.text },
  link: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.text },
  member: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  place: {
    width: 22,
    textAlign: 'center',
    fontFamily: fontFamilies.bold,
    fontSize: 13,
    color: colors.textMuted,
  },
  ring: { padding: 2, borderRadius: 20, borderWidth: 2 },
  noRing: { padding: 4 },
  memberText: { flex: 1, gap: 1 },
  memberName: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontFamily: fontFamilies.bold, fontSize: 15, color: colors.text },
  role: {
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    overflow: 'hidden',
    lineHeight: 18,
    fontFamily: fontFamilies.bold,
    fontSize: 10,
  },
  roleLeader: { color: '#1A1A1A', backgroundColor: '#E8B04B' },
  roleOfficer: { color: colors.onPrimary, backgroundColor: colors.primary },
  meta: { fontFamily: fontFamilies.medium, fontSize: 12, color: colors.textMuted },
  points: { fontFamily: fontFamilies.displayHeavy, fontSize: 13, color: colors.text },
  about: {
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    overflow: 'hidden',
    lineHeight: 26,
    fontFamily: fontFamilies.bold,
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: colors.surfaceMuted,
  },
}));
