import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AuraCoin } from '../../components/AuraIcon';
import { Glyph } from '../../components/Glyph';
import { SilverView } from '../../components/SilverView';
import { useBottomInset } from '../../components/useBottomInset';
import { useTopInset } from '../../components/useTopInset';
import {
  DEFAULT_BIRTH,
  FIRST_YEAR,
  LAST_YEAR,
  MIN_AGE,
  MIN_INTERESTS,
  startInterests,
} from '../../data/seed/demoOnboarding';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';
import { ageOn, checkNickname, daysInMonth } from './nickname';

type Step = 'welcome' | 'nick' | 'age' | 'interests';
const ORDER: readonly Step[] = ['welcome', 'nick', 'age', 'interests'];

type OnboardingScreenProps = Readonly<{
  onFinish: () => void;
  /** Today's date, for the age check; tests give a fixed one. */
  today?: () => Date;
}>;

/**
 * The four steps of the welcome flow of the design. Nothing is saved or checked on a server:
 * the age and the nickname are only checked on the screen, and finishing just leaves the flow.
 */
export function OnboardingScreen({ onFinish, today = () => new Date() }: OnboardingScreenProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [nick, setNick] = useState('mira.wav');
  const [birth, setBirth] = useState<{ day: number; month: number; year: number }>(DEFAULT_BIRTH);
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set(startInterests));
  const index = ORDER.indexOf(step);
  const go = (delta: number) => setStep(ORDER[Math.max(0, index + delta)] ?? 'welcome');

  if (step === 'welcome') return <Welcome onStart={() => go(1)} onHaveAccount={onFinish} />;
  return (
    <Frame step={index} onBack={() => go(-1)}>
      {step === 'nick' ? <NickStep nick={nick} onNick={setNick} onNext={() => go(1)} /> : null}
      {step === 'age' ? (
        <AgeStep birth={birth} onBirth={setBirth} today={today} onNext={() => go(1)} />
      ) : null}
      {step === 'interests' ? (
        <InterestsStep
          picked={picked}
          onToggle={(tag) =>
            setPicked((set) => {
              const next = new Set(set);
              if (!next.delete(tag)) next.add(tag);
              return next;
            })
          }
          onFinish={onFinish}
        />
      ) : null}
    </Frame>
  );
}

function Welcome({
  onStart,
  onHaveAccount,
}: Readonly<{ onStart: () => void; onHaveAccount: () => void }>) {
  const styles = useStyles();
  const top = useTopInset(100);
  const bottom = useBottomInset();
  const t = ru.onboarding.welcome;
  return (
    <View testID="onboarding-welcome" style={styles.dark}>
      <View style={[styles.logo, { paddingTop: top }]}>
        <AuraCoin size={88} tone="light" />
        <Text style={styles.brand}>aura</Text>
      </View>
      <View style={styles.pitch}>
        <Text accessibilityRole="header" style={styles.pitchTitle}>
          {t.title}
        </Text>
        {t.props.map(([title, text], i) => (
          <View key={title} style={styles.prop}>
            <Text style={styles.propNo}>{i + 1}</Text>
            <View>
              <Text style={styles.propTitle}>{title}</Text>
              <Text style={styles.propText}>{text}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={[styles.bottom, { paddingBottom: 24 + bottom }]}>
        <Pressable
          testID="onboarding-start"
          accessibilityRole="button"
          onPress={onStart}
          style={styles.silverWrap}
        >
          <SilverView style={styles.cta}>
            <Text style={styles.ctaInk}>{t.start}</Text>
          </SilverView>
        </Pressable>
        <Pressable
          testID="onboarding-have-account"
          accessibilityRole="button"
          onPress={onHaveAccount}
          style={styles.link}
        >
          <Text style={styles.linkText}>{t.haveAccount}</Text>
        </Pressable>
      </View>
    </View>
  );
}

type FrameProps = Readonly<{ step: number; onBack: () => void; children: React.ReactNode }>;

function Frame({ step, onBack, children }: FrameProps) {
  const styles = useStyles();
  const colors = useColors();
  const top = useTopInset();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.page}
    >
      <View style={[styles.progressRow, { paddingTop: top }]}>
        <Pressable
          testID="screen-back"
          accessibilityRole="button"
          accessibilityLabel={ru.onboarding.back}
          onPress={onBack}
          style={styles.round}
        >
          <Glyph name="chevronLeft" size={20} color={colors.text} strokeWidth={2.4} />
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(step / 3) * 100}%` }]} />
        </View>
        <Text testID="onboarding-step" style={styles.stepText}>
          {ru.onboarding.step.replace('{n}', String(step))}
        </Text>
      </View>
      {children}
    </KeyboardAvoidingView>
  );
}

type NickProps = Readonly<{ nick: string; onNick: (v: string) => void; onNext: () => void }>;

function NickStep({ nick, onNick, onNext }: NickProps) {
  const styles = useStyles();
  const colors = useColors();
  const bottom = useBottomInset();
  const t = ru.onboarding.nick;
  const state = checkNickname(nick);
  const bad = state === 'taken' || state === 'invalid';
  return (
    <View style={styles.stepBody}>
      <Text accessibilityRole="header" style={styles.h1}>
        {t.title}
      </Text>
      <Text style={styles.lead}>{t.text}</Text>
      <View style={[styles.field, bad && styles.fieldBad]}>
        <Text style={styles.at}>@</Text>
        <TextInput
          testID="nick-input"
          accessibilityLabel={t.label}
          value={nick}
          onChangeText={(v) => onNick(v.trim())}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={20}
          style={styles.fieldInput}
        />
        {state === 'free' ? <Text style={[styles.badge, styles.badgeFree]}>{t.free}</Text> : null}
        {state === 'taken' ? (
          <Text style={[styles.badge, styles.badgeTaken]}>{t.taken}</Text>
        ) : null}
      </View>
      <Text style={[styles.hint, state === 'taken' && styles.hintBad]}>
        {state === 'taken' ? t.takenHint.replace('{name}', `${nick}.wav`) : t.rule}
      </Text>
      <View style={styles.or}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>{t.or}</Text>
        <View style={styles.orLine} />
      </View>
      <View
        accessibilityState={{ disabled: true }}
        accessibilityRole="button"
        style={[styles.social, styles.socialDark]}
      >
        <Text style={styles.socialDarkText}>{t.apple}</Text>
      </View>
      <View
        accessibilityState={{ disabled: true }}
        accessibilityRole="button"
        style={[styles.social, styles.socialLight]}
      >
        <Text style={styles.socialLightText}>{t.phone}</Text>
      </View>
      <View style={[styles.footer, { paddingBottom: 24 + bottom }]}>
        <Text style={styles.terms}>{t.terms}</Text>
        <Pressable
          testID="nick-next"
          accessibilityRole="button"
          accessibilityState={{ disabled: state !== 'free' }}
          disabled={state !== 'free'}
          onPress={onNext}
          style={[styles.cta, state === 'free' ? styles.ctaOn : styles.ctaOff]}
        >
          <Text style={[styles.ctaText, state !== 'free' && { color: colors.textMuted }]}>
            {t.next}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

type Birth = { day: number; month: number; year: number };
type AgeProps = Readonly<{
  birth: Birth;
  onBirth: (b: Birth) => void;
  today: () => Date;
  onNext: () => void;
}>;

function AgeStep({ birth, onBirth, today, onNext }: AgeProps) {
  const styles = useStyles();
  const colors = useColors();
  const bottom = useBottomInset();
  const t = ru.onboarding.age;
  const age = ageOn(today(), birth.day, birth.month, birth.year);
  const young = age < MIN_AGE;
  const set = (patch: Partial<Birth>) => {
    const next = { ...birth, ...patch };
    onBirth({ ...next, day: Math.min(next.day, daysInMonth(next.month, next.year)) });
  };
  const columns = [
    {
      id: 'day',
      label: t.day,
      text: String(birth.day),
      prev: () => set({ day: Math.max(1, birth.day - 1) }),
      next: () => set({ day: Math.min(daysInMonth(birth.month, birth.year), birth.day + 1) }),
    },
    {
      id: 'month',
      label: t.month,
      text: ru.months[birth.month] ?? '',
      prev: () => set({ month: Math.max(0, birth.month - 1) }),
      next: () => set({ month: Math.min(11, birth.month + 1) }),
    },
    {
      id: 'year',
      label: t.year,
      text: String(birth.year),
      prev: () => set({ year: Math.max(FIRST_YEAR, birth.year - 1) }),
      next: () => set({ year: Math.min(LAST_YEAR, birth.year + 1) }),
    },
  ];
  return (
    <View style={styles.stepBody}>
      <Text accessibilityRole="header" style={styles.h1}>
        {t.title}
      </Text>
      <Text style={styles.lead}>{t.text}</Text>
      <View style={styles.wheel}>
        {columns.map((c) => (
          <View key={c.id} style={styles.wheelCol}>
            <Pressable
              testID={`age-${c.id}-up`}
              accessibilityRole="button"
              accessibilityLabel={`${c.label}: ${t.up}`}
              onPress={c.prev}
              style={styles.wheelBtn}
            >
              <Glyph name="chevronDown" size={18} color={colors.textMuted} strokeWidth={2.4} />
            </Pressable>
            <Text
              testID={`age-${c.id}`}
              accessibilityLabel={`${c.label}: ${c.text}`}
              style={styles.wheelValue}
            >
              {c.text}
            </Text>
            <Pressable
              testID={`age-${c.id}-down`}
              accessibilityRole="button"
              accessibilityLabel={`${c.label}: ${t.down}`}
              onPress={c.next}
              style={styles.wheelBtn}
            >
              <Glyph name="chevronDown" size={18} color={colors.textMuted} strokeWidth={2.4} />
            </Pressable>
          </View>
        ))}
      </View>
      <View style={styles.note}>
        <Glyph name="shield" size={22} color={colors.textSecondary} />
        <Text testID="age-note" style={styles.noteText}>
          {young ? t.tooYoung : t.note}
        </Text>
      </View>
      <View style={[styles.footer, { paddingBottom: 24 + bottom }]}>
        <Pressable
          testID="age-next"
          accessibilityRole="button"
          accessibilityState={{ disabled: young }}
          disabled={young}
          onPress={onNext}
          style={[styles.cta, young ? styles.ctaOff : styles.ctaOn]}
        >
          <Text style={[styles.ctaText, young && { color: colors.textMuted }]}>{t.next}</Text>
        </Pressable>
      </View>
    </View>
  );
}

type InterestsProps = Readonly<{
  picked: ReadonlySet<string>;
  onToggle: (tag: string) => void;
  onFinish: () => void;
}>;

function InterestsStep({ picked, onToggle, onFinish }: InterestsProps) {
  const styles = useStyles();
  const colors = useColors();
  const bottom = useBottomInset();
  const t = ru.onboarding.interests;
  const missing = Math.max(0, MIN_INTERESTS - picked.size);
  return (
    <View style={styles.stepBody}>
      <Text accessibilityRole="header" style={styles.h1}>
        {t.title}
      </Text>
      <Text style={styles.lead}>{t.text}</Text>
      <ScrollView contentContainerStyle={styles.tags} style={styles.tagsScroll}>
        {t.tags.map((tag) => {
          const on = picked.has(tag);
          return (
            <Pressable
              key={tag}
              testID={`tag-${tag}`}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => onToggle(tag)}
              style={[styles.tag, on && styles.tagOn]}
            >
              <Text style={[styles.tagText, on && styles.tagTextOn]}>{tag}</Text>
              {on ? (
                <Glyph name="check" size={14} color={colors.onPrimary} strokeWidth={3} />
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.gift}>
        <Glyph name="chest" size={40} color="#E8B04B" strokeWidth={1.8} />
        <View style={styles.giftText}>
          <Text style={styles.giftTitle}>{t.gift}</Text>
          <Text style={styles.giftSub}>{t.giftText}</Text>
        </View>
      </View>
      <View style={[styles.footer, { paddingBottom: 24 + bottom }]}>
        <Pressable
          testID="interests-go"
          accessibilityRole="button"
          accessibilityState={{ disabled: missing > 0 }}
          disabled={missing > 0}
          onPress={onFinish}
          style={styles.silverWrap}
        >
          {missing > 0 ? (
            <View style={[styles.cta, styles.ctaOff]}>
              <Text style={[styles.ctaText, { color: colors.textMuted }]}>
                {t.more.replace('{n}', String(missing))}
              </Text>
            </View>
          ) : (
            <SilverView style={styles.cta}>
              <Text style={styles.ctaInk}>{t.go.replace('{n}', String(picked.size))}</Text>
            </SilverView>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  dark: { flex: 1, backgroundColor: '#1A1A1A' },
  logo: { alignItems: 'center', gap: 14 },
  brand: {
    fontFamily: fontFamilies.displayHeavy,
    fontSize: 36,
    letterSpacing: -1.2,
    color: '#FFFFFF',
  },
  pitch: { paddingHorizontal: 24, marginTop: 40, gap: 22 },
  pitchTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 32,
    letterSpacing: -1,
    lineHeight: 35,
    color: '#FFFFFF',
  },
  prop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  propNo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 40,
    fontFamily: fontFamilies.displayHeavy,
    fontSize: 15,
    color: '#D7DAE0',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  propTitle: { fontFamily: fontFamilies.bold, fontSize: 15, color: '#FFFFFF' },
  propText: { fontFamily: fontFamilies.medium, fontSize: 13, color: '#B5AC9D' },
  bottom: { position: 'absolute', left: 16, right: 16, bottom: 0, gap: 10 },
  silverWrap: { borderRadius: 16, overflow: 'hidden' },
  cta: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  ctaOn: { backgroundColor: colors.primary },
  ctaOff: { backgroundColor: colors.border },
  ctaText: { fontFamily: fontFamilies.bold, fontSize: 16, color: colors.onPrimary },
  ctaInk: { fontFamily: fontFamilies.bold, fontSize: 16, color: '#1A1A1A' },
  link: { height: 48, alignItems: 'center', justifyContent: 'center' },
  linkText: { fontFamily: fontFamilies.bold, fontSize: 15, color: '#D7DAE0' },
  page: { flex: 1, backgroundColor: colors.background },
  progressRow: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },
  stepText: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.textMuted },
  stepBody: { flex: 1, paddingHorizontal: 16, paddingTop: 40, gap: 10 },
  h1: {
    fontFamily: fontFamilies.bold,
    fontSize: 30,
    letterSpacing: -0.9,
    lineHeight: 33,
    color: colors.text,
  },
  lead: {
    fontFamily: fontFamilies.medium,
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 14,
  },
  field: {
    height: 60,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.text,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
  },
  fieldBad: { borderColor: colors.destructive },
  at: { fontFamily: fontFamilies.bold, fontSize: 20, color: colors.textMuted },
  fieldInput: {
    flex: 1,
    fontFamily: fontFamilies.bold,
    fontSize: 20,
    color: colors.text,
    padding: 0,
  },
  badge: {
    height: 24,
    paddingHorizontal: 9,
    borderRadius: 12,
    overflow: 'hidden',
    lineHeight: 24,
    fontFamily: fontFamilies.bold,
    fontSize: 12,
  },
  badgeFree: { color: colors.positive, backgroundColor: colors.positiveSoft },
  badgeTaken: { color: colors.destructive, backgroundColor: colors.negativeSoft },
  hint: {
    paddingHorizontal: 4,
    fontFamily: fontFamilies.semibold,
    fontSize: 12,
    color: colors.textMuted,
  },
  hintBad: { color: colors.destructive },
  or: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  orLine: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.textMuted },
  social: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  socialDark: { backgroundColor: colors.primary },
  socialLight: { backgroundColor: colors.surface },
  socialDarkText: { fontFamily: fontFamilies.bold, fontSize: 15, color: colors.onPrimary },
  socialLightText: { fontFamily: fontFamilies.bold, fontSize: 15, color: colors.text },
  footer: { position: 'absolute', left: 16, right: 16, bottom: 0, gap: 10 },
  terms: {
    textAlign: 'center',
    fontFamily: fontFamilies.medium,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  wheel: { height: 220, borderRadius: 20, flexDirection: 'row', backgroundColor: colors.surface },
  wheelCol: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flip: { transform: [{ rotate: '180deg' }] },
  wheelBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  wheelValue: {
    fontFamily: fontFamilies.bold,
    fontSize: 20,
    lineHeight: 44,
    color: colors.text,
  },
  note: {
    marginTop: 8,
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surfaceMuted,
  },
  noteText: {
    flex: 1,
    fontFamily: fontFamilies.semibold,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  tagsScroll: { flexGrow: 0 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
  },
  tagOn: { backgroundColor: colors.primary },
  tagText: { fontFamily: fontFamilies.bold, fontSize: 15, color: colors.text },
  tagTextOn: { color: colors.onPrimary },
  gift: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 124,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.heroCard,
  },
  giftText: { flex: 1, gap: 2 },
  giftTitle: { fontFamily: fontFamilies.bold, fontSize: 16, color: colors.onHeroCard },
  giftSub: { fontFamily: fontFamilies.semibold, fontSize: 13, color: '#D7DAE0' },
}));
