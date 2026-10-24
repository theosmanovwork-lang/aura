import { Pressable, Text, View } from 'react-native';

import { AuraCoin } from '../../components/AuraIcon';
import { Glyph } from '../../components/Glyph';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';

type Day = Readonly<{ n: number; weekday: string; reward: string; chest: boolean }>;

/** A week of the monthly calendar: the days around today (the 12th), with the chest on the 14th. */
const WEEK: readonly Day[] = [
  { n: 9, weekday: ru.cards.quests.weekdays[0], reward: '+50', chest: false },
  { n: 10, weekday: ru.cards.quests.weekdays[1], reward: '+50', chest: false },
  { n: 11, weekday: ru.cards.quests.weekdays[2], reward: '+75', chest: false },
  { n: 12, weekday: ru.cards.quests.weekdays[3], reward: '+100', chest: false },
  { n: 13, weekday: ru.cards.quests.weekdays[4], reward: '+100', chest: false },
  { n: 14, weekday: ru.cards.quests.weekdays[5], reward: ru.cards.quests.chestReward, chest: true },
  { n: 15, weekday: ru.cards.quests.weekdays[6], reward: '+150', chest: false },
];
const TODAY = 12;
const STREAK_BEFORE_TODAY = 11;

type QuestsCardProps = Readonly<{ claimed: boolean; onClaim: () => void }>;

/** «Ежедневные квесты»: the week of rewards and the «Забрать» button for today (the claim is only drawn). */
export function QuestsCard({ claimed, onClaim }: QuestsCardProps) {
  const styles = useStyles();
  const t = ru.cards.quests;
  const streak = STREAK_BEFORE_TODAY + (claimed ? 1 : 0);
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headTexts}>
          <Text accessibilityRole="header" style={styles.title}>
            {t.title}
          </Text>
          <Text testID="quest-streak" style={styles.subtitle}>
            {t.streak.replace('{n}', String(streak))}
          </Text>
        </View>
        <View style={styles.month}>
          <Text style={styles.monthText}>{t.month}</Text>
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
  const ink = today ? colors.onPrimary : finished ? colors.textMuted : colors.text;
  const sub = today ? '#CFC6B6' : colors.textMuted;
  return (
    <View
      testID={`quest-day-${day.n}`}
      style={[styles.day, finished && styles.dayDone, today && styles.dayToday]}
    >
      <Text style={[styles.weekday, { color: sub }]}>{day.weekday}</Text>
      <Text style={[styles.dayNumber, { color: ink }]}>{day.n}</Text>
      {finished ? (
        <Glyph name="check" size={20} color={colors.textMuted} strokeWidth={2.8} />
      ) : day.chest ? (
        <Glyph name="chest" size={20} color={ink} strokeWidth={2.2} />
      ) : (
        <AuraCoin size={20} tone={today ? 'light' : 'dark'} />
      )}
      <Text style={[styles.reward, { color: sub }]}>{day.reward}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: { padding: 16, borderRadius: 20, gap: 12, backgroundColor: colors.surface },
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  headTexts: { flex: 1, gap: 2 },
  title: { fontFamily: fontFamilies.bold, fontSize: 16, color: colors.text },
  subtitle: { fontFamily: fontFamilies.medium, fontSize: 13, color: colors.textMuted },
  month: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  monthText: { fontFamily: fontFamilies.bold, fontSize: 12, color: colors.textSecondary },
  week: { flexDirection: 'row', gap: 6 },
  day: {
    flex: 1,
    height: 88,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: colors.background,
  },
  dayDone: { backgroundColor: 'transparent' },
  dayToday: { backgroundColor: colors.primary },
  weekday: { fontFamily: fontFamilies.medium, fontSize: 10 },
  dayNumber: { fontFamily: fontFamilies.bold, fontSize: 15, lineHeight: 17 },
  reward: { fontFamily: fontFamilies.bold, fontSize: 10 },
  claim: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  claimDone: { backgroundColor: colors.surfaceMuted },
  claimText: { fontFamily: fontFamilies.bold, fontSize: 15, color: colors.onPrimary },
  claimTextDone: { color: colors.textMuted },
}));
