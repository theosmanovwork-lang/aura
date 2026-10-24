import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { AuraText } from '../../components/AuraText';
import { Glyph } from '../../components/Glyph';
import { OfflineBanner } from '../../components/OfflineBanner';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Skeleton } from '../../components/Skeleton';
import { SilverView } from '../../components/SilverView';
import { Toast } from '../../components/Toast';
import { useTopInset } from '../../components/useTopInset';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';
import { PressableScale } from '../../motion/PressableScale';

type StatesScreenProps = Readonly<{ onBack: () => void }>;

function Section({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

/** The sheet of interface states from the design: loading, empty, errors, offline, toasts, busy buttons. */
export function StatesScreen({ onBack }: StatesScreenProps) {
  const styles = useStyles();
  const colors = useColors();
  const top = useTopInset();
  const t = ru.states;
  return (
    <ScrollView
      testID="states-scroll"
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingTop: top }]}
    >
      <ScreenHeader title={t.title} backLabel={ru.common.back} onBack={onBack} />

      <Section title={t.loading}>
        <View testID="states-skeleton" style={styles.card}>
          {[
            ['60%', '85%'],
            ['45%', '70%'],
            ['55%', '60%'],
          ].map(([w1, w2]) => (
            <View key={w1} style={styles.skRow}>
              <Skeleton width={44} height={44} radius={22} />
              <View style={styles.skText}>
                <Skeleton width={w1 as `${number}%`} height={12} />
                <Skeleton width={w2 as `${number}%`} height={10} />
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.note}>{t.loadingNote}</Text>
      </Section>

      <Section title={t.emptySearch}>
        <View testID="states-empty" style={[styles.card, styles.center]}>
          <View style={styles.iconBox}>
            <Glyph name="searchOff" size={26} color={colors.textSecondary} />
          </View>
          <AuraText style={styles.title}>{t.emptyTitle.replace('{query}', t.emptyQuery)}</AuraText>
          <Text style={styles.sub}>{t.emptyHint}</Text>
          <View style={styles.chips}>
            {t.emptyChips.map((chip) => (
              <Text key={chip} style={styles.chip}>
                {chip}
              </Text>
            ))}
          </View>
        </View>
      </Section>

      <Section title={t.offlineTitle}>
        <OfflineBanner />
        <Text style={styles.note}>{t.offlineNote}</Text>
      </Section>

      <Section title={t.errors}>
        <View testID="states-error" style={[styles.card, styles.center]}>
          <View style={[styles.iconBox, styles.iconBoxRed]}>
            <Glyph name="alert" size={26} color={colors.destructive} strokeWidth={2.2} />
          </View>
          <Text style={styles.title}>{t.errorTitle}</Text>
          <Text style={styles.sub}>{t.errorText}</Text>
          <View style={styles.retry}>
            <Text style={styles.retryText}>{t.retry}</Text>
          </View>
        </View>
        <View style={styles.fieldBlock}>
          <View style={styles.field}>
            <Text style={styles.at}>@</Text>
            <Text style={styles.fieldText}>kira</Text>
            <Text style={styles.badge}>{t.taken}</Text>
          </View>
          <Text style={styles.fieldError}>{t.takenHint.replace('{name}', 'kira.wav')}</Text>
        </View>
        <View style={styles.funds}>
          <View style={styles.fundsText}>
            <Text style={styles.fundsTitle}>{t.notEnough.replace('{n}', '140')}</Text>
            <Text style={styles.fundsSub}>{t.notEnoughFor.replace('{bid}', '12 600')}</Text>
          </View>
          <SilverView style={styles.fundsBtn}>
            <Text style={styles.fundsBtnText}>{t.topUp}</Text>
          </SilverView>
        </View>
      </Section>

      <Section title={t.toasts}>
        <Toast
          testID="toast-outbid"
          title={t.toast.outbid[0]}
          sub={t.toast.outbid[1]}
          icon="gavel"
          iconBg="rgba(255,255,255,0.1)"
          iconInk="#FF8A80"
          action={{ label: t.toast.outbid[2], run: () => undefined, silver: true }}
        />
        <Toast
          title={t.toast.card[0]}
          sub={t.toast.card[1]}
          icon="star"
          iconBg="#E8B04B"
          iconInk="#1A1A1A"
        />
        <Toast
          tone="light"
          title={t.toast.bought[0]}
          sub={t.toast.bought[1]}
          icon="check"
          iconBg={colors.positiveSoft}
          iconInk={colors.positive}
        />
        <Toast
          tone="light"
          title={t.toast.failed[0]}
          sub={t.toast.failed[1]}
          icon="alert"
          iconBg={colors.negativeSoft}
          iconInk={colors.destructive}
          action={{ label: t.toast.failed[2], run: () => undefined }}
        />
      </Section>

      <Section title={t.buttons}>
        <View style={[styles.busy, styles.busyDark]}>
          <Skeleton width={18} height={18} radius={9} />
          <Text style={styles.busyText}>{t.sending}</Text>
        </View>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={t.ended}
          disabled
          accessibilityState={{ disabled: true }}
          style={[styles.busy, styles.busyOff]}
        >
          <Text style={styles.busyOffText}>{t.ended}</Text>
        </PressableScale>
        <View style={[styles.busy, styles.busyDark]}>
          <Glyph name="check" size={18} color="#FFFFFF" strokeWidth={2.6} />
          <Text style={styles.busyText}>{t.accepted}</Text>
        </View>
      </Section>
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 48, gap: 20 },
  section: { gap: 10 },
  sectionTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  card: { padding: 14, borderRadius: 16, gap: 10, backgroundColor: colors.surface },
  center: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  skRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  skText: { flex: 1, gap: 6 },
  note: { fontFamily: fontFamilies.medium, fontSize: 12, lineHeight: 17, color: colors.textMuted },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  iconBoxRed: { backgroundColor: colors.negativeSoft },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fontFamilies.medium,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  chip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    overflow: 'hidden',
    lineHeight: 32,
    fontFamily: fontFamilies.bold,
    fontSize: 13,
    color: colors.text,
    backgroundColor: colors.surfaceMuted,
  },
  retry: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  retryText: { fontFamily: fontFamilies.bold, fontSize: 14, color: colors.onPrimary },
  fieldBlock: { gap: 6 },
  field: {
    height: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.destructive,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  at: { fontFamily: fontFamilies.bold, fontSize: 16, color: colors.textMuted },
  fieldText: { flex: 1, fontFamily: fontFamilies.bold, fontSize: 16, color: colors.text },
  badge: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    overflow: 'hidden',
    lineHeight: 22,
    fontFamily: fontFamilies.bold,
    fontSize: 11,
    color: colors.destructive,
    backgroundColor: colors.negativeSoft,
  },
  fieldError: {
    paddingHorizontal: 4,
    fontFamily: fontFamilies.semibold,
    fontSize: 12,
    color: colors.destructive,
  },
  funds: {
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1A1A1A',
  },
  fundsText: { flex: 1, gap: 2 },
  fundsTitle: { fontFamily: fontFamilies.bold, fontSize: 14, color: '#FFFFFF' },
  fundsSub: { fontFamily: fontFamilies.semibold, fontSize: 12, color: '#B5AC9D' },
  fundsBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fundsBtnText: { fontFamily: fontFamilies.bold, fontSize: 13, color: '#1A1A1A' },
  busy: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  busyDark: { backgroundColor: '#1A1A1A' },
  busyOff: { backgroundColor: colors.border },
  busyText: { fontFamily: fontFamilies.bold, fontSize: 15, color: '#FFFFFF' },
  busyOffText: { fontFamily: fontFamilies.bold, fontSize: 15, color: colors.textMuted },
}));
