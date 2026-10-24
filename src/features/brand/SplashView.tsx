import { Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { AuraCoin } from '../../components/AuraIcon';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles } from '../../theme';

type SplashViewProps = Readonly<{
  /** How far the thin loading bar is filled, 0 to 1. */
  progress?: number;
}>;

/** The launch screen of the design: the coin in a soft glow, the word «aura», the tagline and a thin loader. */
export function SplashView({ progress = 0.4 }: SplashViewProps) {
  const styles = useStyles();
  return (
    <View testID="splash" style={styles.page}>
      <View pointerEvents="none" style={styles.glow}>
        <Svg width={460} height={460} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="splashGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#D7DAE0" stopOpacity={0.16} />
              <Stop offset="1" stopColor="#D7DAE0" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100" height="100" fill="url(#splashGlow)" />
        </Svg>
      </View>
      <AuraCoin size={96} tone="light" />
      <Text style={styles.word}>aura</Text>
      <Text style={styles.tagline}>{ru.brand.tagline}</Text>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={ru.brand.loading}
        style={styles.track}
      >
        <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    backgroundColor: '#1A1A1A',
  },
  glow: { position: 'absolute', alignSelf: 'center', top: '50%', marginTop: -253 },
  word: {
    fontFamily: fontFamilies.displayHeavy,
    fontSize: 44,
    letterSpacing: -1.5,
    color: '#FFFFFF',
  },
  tagline: {
    fontFamily: fontFamilies.semibold,
    fontSize: 14,
    letterSpacing: 0.4,
    color: '#B5AC9D',
  },
  track: {
    position: 'absolute',
    bottom: 60,
    width: 44,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  fill: { height: 4, borderRadius: 2, backgroundColor: '#D7DAE0' },
}));
