import { Pressable, Text, View } from 'react-native';

import { AuraCoin } from '../../components/AuraIcon';
import { Avatar } from '../../components/Avatar';
import { Glyph } from '../../components/Glyph';
import { SilverView } from '../../components/SilverView';
import { demoGlobalChat } from '../../data/seed/demoCommunity';
import { formatPoints } from '../../i18n/format';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles } from '../../theme';

/** The dark card of the global chat with its latest message. */
export function GlobalChatCard() {
  const styles = useStyles();
  const t = ru.chats;
  return (
    <Pressable
      testID="global-chat"
      accessibilityRole="button"
      accessibilityLabel={t.global}
      style={styles.global}
    >
      <View style={styles.globalHead}>
        <View style={styles.globalTitle}>
          <Glyph name="globe" size={20} color="#FFFFFF" />
          <Text style={styles.globalName}>{t.global}</Text>
        </View>
        <View style={styles.online}>
          <SilverView style={styles.onlineDot} />
          <Text style={styles.onlineText}>
            {t.online.replace('{n}', formatPoints(demoGlobalChat.online))}
          </Text>
        </View>
      </View>
      <View style={styles.last}>
        <Avatar initial={demoGlobalChat.initial} tone="brand" size={34} />
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

/** The silver card that invites to make a clan. */
export function ClanCard() {
  const styles = useStyles();
  const t = ru.chats.clan;
  return (
    <SilverView style={styles.clan}>
      <View style={styles.shield}>
        <Glyph name="shield" size={120} color="#1A1A1A" strokeWidth={1.2} />
      </View>
      <View style={styles.tag}>
        <Text style={styles.tagText}>{t.eyebrow}</Text>
      </View>
      <Text style={styles.clanTitle}>{t.title}</Text>
      <Text style={styles.clanText}>{t.text}</Text>
      <View style={styles.bonus}>
        <AuraCoin size={18} tone="dark" />
        <Text style={styles.bonusText}>{t.bonus}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          testID="clan-create"
          accessibilityRole="button"
          style={[styles.action, styles.actionDark]}
        >
          <Glyph name="plus" size={18} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={[styles.actionText, styles.actionTextLight]}>{t.create}</Text>
        </Pressable>
        <Pressable
          testID="clan-find"
          accessibilityRole="button"
          style={[styles.action, styles.actionLight]}
        >
          <Text style={styles.actionText}>{t.find}</Text>
        </Pressable>
      </View>
    </SilverView>
  );
}

const useStyles = makeStyles((colors) => ({
  global: { padding: 16, borderRadius: 20, gap: 12, backgroundColor: colors.heroCard },
  globalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  globalTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  globalName: { fontFamily: fontFamilies.extrabold, fontSize: 16, color: colors.onHeroCard },
  online: {
    height: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
  onlineText: { fontFamily: fontFamilies.extrabold, fontSize: 12, color: colors.onHeroCard },
  last: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  lastTexts: { flex: 1, minWidth: 0, gap: 1 },
  lastAuthor: { fontFamily: fontFamilies.extrabold, fontSize: 13, color: colors.onHeroCard },
  lastMessage: { fontFamily: fontFamilies.semibold, fontSize: 13, color: '#CFC6B6' },
  lastTime: { fontFamily: fontFamilies.bold, fontSize: 11, color: '#CFC6B6' },
  clan: { overflow: 'hidden', padding: 20, borderRadius: 20, gap: 8 },
  shield: { position: 'absolute', right: -22, top: -16, opacity: 0.18 },
  tag: {
    alignSelf: 'flex-start',
    height: 22,
    paddingHorizontal: 9,
    borderRadius: 11,
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
  tagText: {
    fontFamily: fontFamilies.extrabold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
  clanTitle: {
    fontFamily: fontFamilies.extrabold,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.4,
    color: '#1A1A1A',
  },
  clanText: {
    maxWidth: 280,
    fontFamily: fontFamilies.semibold,
    fontSize: 13,
    lineHeight: 17,
    color: '#1A1A1A',
  },
  bonus: {
    alignSelf: 'flex-start',
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    paddingLeft: 8,
    paddingRight: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  bonusText: { fontFamily: fontFamilies.extrabold, fontSize: 13, color: '#1A1A1A' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 6 },
  action: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 14,
  },
  actionDark: { backgroundColor: '#1A1A1A' },
  actionLight: { backgroundColor: '#FFFFFF' },
  actionText: { fontFamily: fontFamilies.extrabold, fontSize: 14, color: '#1A1A1A' },
  actionTextLight: { color: '#FFFFFF' },
}));
