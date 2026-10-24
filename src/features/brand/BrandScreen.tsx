import { ScrollView, Text, View } from 'react-native';

import { AuraCoin } from '../../components/AuraIcon';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SilverView } from '../../components/SilverView';
import { useTopInset } from '../../components/useTopInset';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles } from '../../theme';
import { SplashView } from './SplashView';

type BrandScreenProps = Readonly<{ onBack: () => void }>;

/** The brand sheet: the logo on light and dark, three app icon ideas (the second one is chosen) and the splash. */
export function BrandScreen({ onBack }: BrandScreenProps) {
  const styles = useStyles();
  const top = useTopInset();
  const t = ru.brand;
  return (
    <ScrollView
      testID="brand-scroll"
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingTop: top }]}
    >
      <ScreenHeader title={t.title} backLabel={ru.common.back} onBack={onBack} />

      <View style={[styles.logoCard, styles.logoLight]}>
        <Logo dark={false} />
        <Text style={[styles.cardLabel, styles.labelLight]}>{t.light}</Text>
      </View>
      <View style={[styles.logoCard, styles.logoDark]}>
        <Logo dark />
        <Text style={[styles.cardLabel, styles.labelDark]}>{t.dark}</Text>
      </View>

      <Text accessibilityRole="header" style={styles.section}>
        {t.icons}
      </Text>
      <View style={styles.icons}>
        {(['a', 'b', 'c'] as const).map((key) => (
          <View key={key} style={[styles.iconCard, key === 'b' && styles.iconChosen]}>
            {key === 'b' ? <Text style={styles.chosen}>{t.chosen}</Text> : null}
            <AppIcon kind={key} />
            <Text style={styles.iconName}>{t.iconNames[key]}</Text>
          </View>
        ))}
      </View>

      <Text accessibilityRole="header" style={styles.section}>
        {t.splash}
      </Text>
      <View style={styles.splash}>
        <SplashView />
      </View>
    </ScrollView>
  );
}

function Logo({ dark }: Readonly<{ dark: boolean }>) {
  const styles = useStyles();
  return (
    <View style={styles.logoRow}>
      <AuraCoin size={64} tone={dark ? 'light' : 'dark'} />
      <Text style={[styles.word, { color: dark ? '#FFFFFF' : '#1A1A1A' }]}>aura</Text>
    </View>
  );
}

function AppIcon({ kind }: Readonly<{ kind: 'a' | 'b' | 'c' }>) {
  const styles = useStyles();
  if (kind === 'b') {
    return (
      <SilverView style={styles.icon}>
        <AuraCoin size={52} tone="dark" />
      </SilverView>
    );
  }
  return (
    <View style={[styles.icon, kind === 'a' ? styles.iconGraphite : styles.iconPaper]}>
      <AuraCoin size={52} tone={kind === 'a' ? 'light' : 'dark'} />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 48, gap: 16 },
  logoCard: {
    height: 160,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLight: { backgroundColor: colors.surface },
  logoDark: { backgroundColor: '#1A1A1A' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  word: { fontFamily: fontFamilies.displayHeavy, fontSize: 48, letterSpacing: -2 },
  cardLabel: {
    position: 'absolute',
    left: 16,
    bottom: 12,
    fontFamily: fontFamilies.bold,
    fontSize: 12,
  },
  labelLight: { color: colors.textMuted },
  labelDark: { color: '#B5AC9D' },
  section: { fontFamily: fontFamilies.bold, fontSize: 20, letterSpacing: -0.3, color: colors.text },
  icons: { flexDirection: 'row', gap: 10 },
  iconCard: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
  },
  iconChosen: { borderWidth: 2, borderColor: colors.primary },
  chosen: {
    position: 'absolute',
    right: 6,
    top: 6,
    height: 20,
    paddingHorizontal: 8,
    borderRadius: 10,
    overflow: 'hidden',
    lineHeight: 20,
    fontFamily: fontFamilies.bold,
    fontSize: 10,
    color: colors.onPrimary,
    backgroundColor: colors.primary,
  },
  icon: { width: 84, height: 84, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  iconGraphite: { backgroundColor: '#2A2622' },
  iconPaper: { backgroundColor: '#F4F3F0', borderWidth: 1, borderColor: colors.border },
  iconName: {
    fontFamily: fontFamilies.bold,
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  splash: { height: 520, borderRadius: 32, overflow: 'hidden' },
}));
