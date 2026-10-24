import { Pressable, Text, View } from 'react-native';

import { fontFamilies, makeStyles } from '../theme';
import { Glyph, type GlyphName } from './Glyph';
import { SilverView } from './SilverView';

export type ToastTone = 'dark' | 'light';

type ToastProps = Readonly<{
  title: string;
  sub: string;
  icon: GlyphName;
  /** The icon box: a colour for the background and one for the picture. */
  iconBg: string;
  iconInk: string;
  /** `dark` is the usual black toast; `light` is a white one (a plain success or error). */
  tone?: ToastTone;
  action?: Readonly<{ label: string; run: () => void; silver?: boolean }>;
  testID?: string;
}>;

/** A short message that drops from the top for three seconds: an icon, two lines, maybe one button. */
export function Toast({
  title,
  sub,
  icon,
  iconBg,
  iconInk,
  tone = 'dark',
  action,
  testID,
}: ToastProps) {
  const styles = useStyles();
  const dark = tone === 'dark';
  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.toast, dark ? styles.dark : styles.light]}
    >
      <View style={[styles.icon, { backgroundColor: iconBg }]}>
        <Glyph name={icon} size={20} color={iconInk} strokeWidth={2.2} />
      </View>
      <View style={styles.texts}>
        <Text numberOfLines={1} style={[styles.title, dark ? styles.onDark : styles.onLight]}>
          {title}
        </Text>
        <Text numberOfLines={1} style={[styles.sub, dark ? styles.onDark : styles.onLight]}>
          {sub}
        </Text>
      </View>
      {action ? (
        <Pressable accessibilityRole="button" onPress={action.run} style={styles.actionWrap}>
          {action.silver ? (
            <SilverView style={styles.action}>
              <Text style={[styles.actionText, styles.actionInk]}>{action.label}</Text>
            </SilverView>
          ) : (
            <View style={[styles.action, styles.actionDark]}>
              <Text style={[styles.actionText, styles.actionLight]}>{action.label}</Text>
            </View>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  toast: {
    minHeight: 60,
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 12,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#1A1A1A',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  dark: { backgroundColor: '#1A1A1A' },
  light: { backgroundColor: colors.surface },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, minWidth: 0, gap: 1 },
  title: { fontFamily: fontFamilies.bold, fontSize: 14 },
  sub: { fontFamily: fontFamilies.semibold, fontSize: 12, opacity: 0.75 },
  onDark: { color: '#FFFFFF' },
  onLight: { color: colors.text },
  actionWrap: { borderRadius: 10, overflow: 'hidden' },
  action: { height: 32, paddingHorizontal: 12, justifyContent: 'center' },
  actionDark: { backgroundColor: '#1A1A1A' },
  actionText: { fontFamily: fontFamilies.bold, fontSize: 12 },
  actionInk: { color: '#1A1A1A' },
  actionLight: { color: '#FFFFFF' },
}));
