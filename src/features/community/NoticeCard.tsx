import { Pressable, Text, View } from 'react-native';

import { Glyph } from '../../components/Glyph';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, spacing } from '../../theme';

type NoticeCardProps = Readonly<{ onOpen?: () => void }>;

/** «Не пропусти аукцион»: the card with the bell and the button that turns the reminder on. */
export function NoticeCard({ onOpen }: NoticeCardProps) {
  const styles = useStyles();
  const t = ru.community.notice;
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Glyph name="bell" size={22} color="#C2540A" />
      </View>
      <View style={styles.texts}>
        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.text}>{t.text}</Text>
      </View>
      <Pressable
        testID="notice-button"
        accessibilityRole="button"
        onPress={onOpen}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{t.action}</Text>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEEE2',
  },
  texts: { flex: 1, gap: 2 },
  title: { fontFamily: fontFamilies.extrabold, fontSize: 15, color: colors.text },
  text: { fontFamily: fontFamilies.medium, fontSize: 13, lineHeight: 17, color: colors.textMuted },
  button: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  buttonText: { fontFamily: fontFamilies.extrabold, fontSize: 13, color: colors.onPrimary },
}));
