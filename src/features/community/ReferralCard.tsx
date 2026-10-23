import { Pressable, Text, View } from 'react-native';

import { AuraGlyph } from '../../components/AuraIcon';
import { Glyph } from '../../components/Glyph';
import { SilverView } from '../../components/SilverView';
import { AuraText } from '../../components/AuraText';
import { demoReferralCode } from '../../data/seed/demoCommunity';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, silver } from '../../theme';

type ReferralCardProps = Readonly<{ copied: boolean; onCopy: () => void }>;

/** The dark card that invites friends: a code to copy and the «Пригласить» button. */
export function ReferralCard({ copied, onCopy }: ReferralCardProps) {
  const styles = useStyles();
  const t = ru.community.referral;
  return (
    <View style={styles.card}>
      <View style={styles.bigGlyph}>
        <AuraGlyph size={150} color={silver.coin} />
      </View>
      <Text style={styles.eyebrow}>{t.eyebrow}</Text>
      <AuraText style={styles.title}>{t.title}</AuraText>
      <View style={styles.row}>
        <Pressable
          testID="referral-copy"
          accessibilityRole="button"
          accessibilityLabel={t.copyLabel.replace('{code}', demoReferralCode)}
          onPress={onCopy}
          style={styles.code}
        >
          <Text accessibilityLiveRegion="polite" style={styles.codeText}>
            {copied ? t.copied : demoReferralCode}
          </Text>
          <Glyph name="copy" size={18} color="#FFFFFF" />
        </Pressable>
        <Pressable
          disabled
          accessibilityState={{ disabled: true }}
          accessibilityRole="button"
          accessibilityLabel={t.invite}
        >
          <SilverView style={styles.invite}>
            <Text style={styles.inviteText}>{t.invite}</Text>
          </SilverView>
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    overflow: 'hidden',
    padding: 20,
    borderRadius: 20,
    gap: 6,
    backgroundColor: colors.heroCard,
  },
  bigGlyph: { position: 'absolute', right: -34, top: -30 },
  eyebrow: {
    fontFamily: fontFamilies.extrabold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.heroMuted,
  },
  title: {
    maxWidth: 230,
    fontFamily: fontFamilies.extrabold,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.4,
    color: colors.onHeroCard,
  },
  row: { flexDirection: 'row', gap: 8, marginTop: 10 },
  code: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.heroLine,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  codeText: {
    fontFamily: fontFamilies.extrabold,
    fontSize: 14,
    letterSpacing: 1,
    color: '#FFFFFF',
  },
  invite: { height: 44, paddingHorizontal: 18, borderRadius: 14, justifyContent: 'center' },
  inviteText: { fontFamily: fontFamilies.extrabold, fontSize: 14, color: '#1A1A1A' },
}));
