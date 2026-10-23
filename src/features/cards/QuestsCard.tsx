import { Pressable, Text, View } from 'react-native';

import { AuraCoin } from '../../components/AuraIcon';
import { Glyph } from '../../components/Glyph';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';

type Day = Readonly<{ n: number; reward: string; chest: boolean }>;

/** A week of the monthly calendar: the days around today (day 12), with the chest on day 14. */
const WEEK: readonly Day[] = [
  { n: 9, reward: '50', chest: false },
  { n: 10, reward: '50', chest: false },
  { n: 11, reward: '75', chest: false },
  { n: 12, reward: '100', chest: false },
  { n: 13, reward: '100', chest: false },
  { n: 14, reward: ru.cards.quests.chestReward, chest: true },
  { n: 15, reward: '150', chest: false },
];
const TODAY = 12;
const DAYS_IN_MONTH = 31;

type QuestsCardProps = Readonly<{ claimed: boolean; onClaim: () => void }>;

/** «Ежедневные квесты»: the calendar of rewards and the «Забрать» button for today (the claim is only drawn). */
export function QuestsCard({ claimed, onClaim }: QuestsCardProps) {
  const styles = useStyles();
  const t = ru.cards.quests;
  const done = TODAY - 1 + (claimed ? 1 : 0);
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headTexts}>
          <Text accessibilityRole="header" style={styles.title}>
            {t.title}
          </Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>
        <View style={styles.month}>
          <Text style={styles.monthText}>{t.month}</Text>
        </View>
      </View>
      <View style={styles.progress}>
        <View style={styles.progressLabels}>
          <Text style={styles.small}>{t.progress.replace('{n}', String(done))}</Text>
          <Text style={styles.small}>{t.chestDay}</Text>
        </View>
        <View style={styles.track}>
          <View
            testID="quest-progress"
            style={[styles.fill, { width: `${(done / DAYS_IN_MONTH) * 100}%` }]}
          />
        </View>
      </View>
      <View style={styles.week}>
        {WEEK.map((day) => (
          <DayCell key={day.n} day={day} claimed={claimed} />
        ))}
      </View>
      <Pressable
        testID="quest-claim"
        accessibilityRole="button"
        accessibilityState={{ disabled: claimed }}
        disabled={claimed}
        onPress={onClaim}
        style={[styles.claim, claimed && styles.claimDone]}
      >
        <Text style={[styles.claimText, claimed && styles.claimTextDone]}>
          {claimed ? t.claimed : t.claim}
        </Text>
      </Pressable>
    </View>
  );
}

function DayCell({ day, claimed }: Readonly<{ day: Day; claimed: boolean }>) {
  const styles = useStyles();
  const colors = useColors();
  const finished = day.n < TODAY || (day.n === TODAY && claimed);
  const today = day.n === TODAY && !claimed;
  return (
    <View
      testID={`quest-day-${day.n}`}
      style={[styles.day, finished && styles.dayDone, today && styles.dayToday]}
    >
      <Text style={styles.dayLabel}>{ru.cards.quests.day.replace('{n}', String(day.n))}</Text>
      {finished ? (
        <Glyph name="check" size={20} color={colors.textSecondary} strokeWidth={2.8} />
      ) : day.chest ? (
        <Glyph name="chest" size={20} color={colors.text} strokeWidth={2.2} />
      ) : (
        <AuraCoin size={20} />
      )}
      <Text style={styles.dayLabel}>{day.reward}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: { padding: 16, borderRadius: 20, gap: 12, backgroundColor: colors.surface },
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  headTexts: { flex: 1, gap: 2 },
  title: { fontFamily: fontFamilies.extrabold, fontSize: 16, color: colors.text },
  subtitle: { fontFamily: fontFamilies.medium, fontSize: 13, color: colors.textMuted },
  month: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  monthText: { fontFamily: fontFamilies.extrabold, fontSize: 12, color: colors.textSecondary },
  progress: { gap: 6 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  small: { fontFamily: fontFamilies.bold, fontSize: 12, color: colors.textMuted },
  track: { height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: colors.border },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  week: { flexDirection: 'row', gap: 6 },
  day: {
    flex: 1,
    height: 74,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.background,
  },
  dayDone: { backgroundColor: colors.surfaceMuted },
  dayToday: { backgroundColor: colors.surface, borderColor: colors.text },
  dayLabel: { fontFamily: fontFamilies.extrabold, fontSize: 11, color: colors.text },
  claim: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  claimDone: { backgroundColor: colors.border },
  claimText: { fontFamily: fontFamilies.extrabold, fontSize: 15, color: colors.onPrimary },
  claimTextDone: { color: colors.textMuted },
}));
