import { Text, View } from 'react-native';

import { Glyph } from '../../components/Glyph';
import { SilverView } from '../../components/SilverView';
import { Wave } from '../../components/Wave';
import { demoReferralCode } from '../../data/seed/demoCommunity';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles } from '../../theme';
import { PressableScale } from '../../motion/PressableScale';

type ReferralCardProps = Readonly<{ copied: boolean; onCopy: () => void }>;

/** The dark invitation card: a wave in the corner, a code to copy and the «Позвать» button. */
export function ReferralCard({ copied, onCopy }: ReferralCardProps) {
  const styles = useStyles();
  const t = ru.community.referral;
  return (
    <View style={styles.card}>
      <Wave />
      <SilverView style={styles.dot} />
      <Text style={styles.eyebrow}>{t.eyebrow}</Text>
      <Text accessibilityRole="header" style={styles.title}>
        {t.title}
      </Text>
      <Text style={styles.text}>{t.text}</Text>
      <View style={styles.row}>
        <PressableScale
          testID="referral-copy"
          accessibilityRole="button"
          accessibilityLabel={t.copyLabel.replace('{code}', demoReferralCode)}
          onPress={onCopy}
          style={styles.code}
        >
          <Text style={styles.codeText}>{demoReferralCode}</Text>
          <Text accessibilityLiveRegion="polite" style={[styles.hint, copied && styles.hintDone]}>
            {copied ? t.copied : t.copyHint}
          </Text>
        </PressableScale>
        <PressableScale
          disabled
          accessibilityState={{ disabled: true }}
          accessibilityRole="button"
          accessibilityLabel={t.invite}
        >
          <SilverView style={styles.invite}>
            <Glyph name="plus" size={16} color="#1A1A1A" strokeWidth={2.6} />
            <Text style={styles.inviteText}>{t.invite}</Text>
          </SilverView>
        </PressableScale>
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
  dot: { position: 'absolute', right: 22, top: 20, width: 18, height: 18, borderRadius: 9 },
  eyebrow: {
    fontFamily: fontFamilies.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.heroMuted,
  },
  title: {
    maxWidth: 230,
    fontFamily: fontFamilies.bold,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.4,
    color: colors.onHeroCard,
  },
  text: { fontFamily: fontFamilies.medium, fontSize: 13, color: colors.heroMuted },
  row: { flexDirection: 'row', gap: 8, marginTop: 10 },
  code: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 14,
    paddingRight: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.heroLine,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  codeText: { fontFamily: fontFamilies.bold, fontSize: 15, letterSpacing: 1, color: '#FFFFFF' },
  hint: { fontFamily: fontFamilies.semibold, fontSize: 12, color: colors.heroMuted },
  hintDone: { color: '#7FE0B8' },
  invite: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inviteText: { fontFamily: fontFamilies.bold, fontSize: 15, color: '#1A1A1A' },
}));
