import { Pressable, Text, View } from 'react-native';

import { Avatar } from '../../components/Avatar';
import { Glyph } from '../../components/Glyph';
import { SilverView } from '../../components/SilverView';
import { Wave, WAVE_FILL } from '../../components/Wave';
import { demoGlobalChat, demoMyClan } from '../../data/seed/demoCommunity';
import { formatPoints } from '../../i18n/format';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles } from '../../theme';

/** The dark card of the global chat with its latest message. */
export function GlobalChatCard() {
  const styles = useStyles();
  const t = ru.chats;
  return (
    <Pressable
      disabled
      accessibilityState={{ disabled: true }}
      testID="global-chat"
      accessibilityRole="button"
      accessibilityLabel={t.global}
      style={styles.global}
    >
      <Wave size={120} />
      <View style={styles.globalHead}>
        <View style={styles.globalTexts}>
          <View style={styles.globalTitle}>
            <Glyph name="globe" size={20} color="#FFFFFF" />
            <Text style={styles.globalName}>{t.global}</Text>
          </View>
          <View style={styles.online}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>
              {t.online.replace('{n}', formatPoints(demoGlobalChat.online))}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.last}>
        <Avatar initial={demoGlobalChat.initial} tone="brand" size={34} square />
        <View style={styles.lastTexts}>
          <Text style={styles.lastAuthor}>{demoGlobalChat.author}</Text>
          <Text numberOfLines={1} style={styles.lastMessage}>
            {demoGlobalChat.message}
          </Text>
        </View>
        <Text style={styles.lastTime}>{t.now}</Text>
      </View>
    </Pressable>
  );
}

type MyClanCardProps = Readonly<{ onOpen?: (clanId: string) => void }>;

/** The silver card of the clan you are in: its place and how far the weekly chest is. */
export function MyClanCard({ onOpen }: MyClanCardProps) {
  const styles = useStyles();
  const t = ru.chats.clan;
  const clan = demoMyClan;
  return (
    <Pressable
      testID="my-clan"
      accessibilityRole="button"
      accessibilityLabel={t.open.replace('{name}', clan.name)}
      onPress={() => onOpen?.(clan.id)}
    >
      <SilverView style={styles.clan}>
        <Wave fill={WAVE_FILL.onChrome} size={110} />
        <View style={styles.clanHead}>
          <View style={styles.clanMark}>
            <Text style={styles.clanInitial}>{clan.initial}</Text>
          </View>
          <View style={styles.clanNames}>
            <Text style={styles.clanSmall}>{t.yours}</Text>
            <Text style={styles.clanName}>{clan.name}</Text>
          </View>
          <View style={styles.clanRight}>
            <Text style={styles.clanPlace}>{t.place.replace('{n}', String(clan.place))}</Text>
            <Text style={styles.clanSmallEnd}>
              {t.members.replace('{n}', String(clan.members))}
            </Text>
          </View>
        </View>
        <View style={styles.progress}>
          <View style={styles.progressText}>
            <Text style={styles.clanSmall}>{t.chest}</Text>
            <Text style={styles.clanSmall}>
              {t.tasks
                .replace('{done}', String(clan.tasksDone))
                .replace('{total}', String(clan.tasksTotal))}
            </Text>
          </View>
          <View style={styles.track}>
            <View
              style={[styles.fill, { width: `${(clan.tasksDone / clan.tasksTotal) * 100}%` }]}
            />
          </View>
        </View>
      </SilverView>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  global: {
    overflow: 'hidden',
    padding: 16,
    borderRadius: 20,
    gap: 12,
    backgroundColor: colors.heroCard,
  },
  globalHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  globalTexts: { gap: 6 },
  globalTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  globalName: { fontFamily: fontFamilies.bold, fontSize: 16, color: colors.onHeroCard },
  online: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.online },
  onlineText: { fontFamily: fontFamilies.medium, fontSize: 12, color: '#CFC6B6' },
  last: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  lastTexts: { flex: 1, minWidth: 0, gap: 1 },
  lastAuthor: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.onHeroCard },
  lastMessage: { fontFamily: fontFamilies.medium, fontSize: 13, color: '#CFC6B6' },
  lastTime: { fontFamily: fontFamilies.semibold, fontSize: 11, color: '#CFC6B6' },
  clan: { overflow: 'hidden', padding: 16, borderRadius: 20, gap: 12 },
  clanHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  clanMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
  clanInitial: { fontFamily: fontFamilies.bold, fontSize: 18, color: '#FFFFFF' },
  clanNames: { flex: 1, gap: 1 },
  clanSmall: { fontFamily: fontFamilies.semibold, fontSize: 12, color: '#4A4F57' },
  clanSmallEnd: { fontFamily: fontFamilies.semibold, fontSize: 11, color: '#4A4F57' },
  clanName: { fontFamily: fontFamilies.bold, fontSize: 17, color: '#1A1A1A' },
  clanRight: { alignItems: 'flex-end', gap: 1 },
  clanPlace: { fontFamily: fontFamilies.bold, fontSize: 15, color: '#1A1A1A' },
  progress: { gap: 6 },
  progressText: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: 'rgba(26,26,26,0.12)' },
  fill: { height: 6, borderRadius: 3, backgroundColor: '#1A1A1A' },
}));
