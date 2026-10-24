import { Pressable, Text, View } from 'react-native';

import { Glyph } from '../../components/Glyph';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';

type NoticeCardProps = Readonly<{ onOpen?: () => void; onHide: () => void }>;

/** «Не пропусти перебив»: a thin strip with the bell, the button that turns reminders on and a cross to hide it. */
export function NoticeCard({ onOpen, onHide }: NoticeCardProps) {
  const styles = useStyles();
  const colors = useColors();
  const t = ru.community.notice;
  return (
    <View testID="notice-card" style={styles.card}>
      <View style={styles.icon}>
        <Glyph name="bell" size={18} color={colors.onPrimary} strokeWidth={2.2} />
      </View>
      <Text numberOfLines={1} style={styles.title}>
        {t.title}
      </Text>
      <Pressable
        testID="notice-button"
        accessibilityRole="button"
        onPress={onOpen}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{t.action}</Text>
      </Pressable>
      <Pressable
        testID="notice-hide"
        accessibilityRole="button"
        accessibilityLabel={t.hide}
        onPress={onHide}
        style={styles.hide}
      >
        <Glyph name="close" size={16} color={colors.textMuted} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 4,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  title: { flex: 1, fontFamily: fontFamilies.semibold, fontSize: 13, color: colors.text },
  button: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  buttonText: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.onPrimary },
  hide: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
}));
