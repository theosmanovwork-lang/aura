import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { ru } from '../../i18n/ru';
import { colors, radii, typography } from '../../theme';

const SIZE = 48;
const BADGE = 20;

type AuthorAvatarProps = Readonly<{ name: string }>;

/** The author's round avatar with a plus under it (follow); drawn, switched off until follows exist. */
export function AuthorAvatar({ name }: AuthorAvatarProps) {
  return (
    <Pressable
      testID="author-avatar"
      accessibilityRole="button"
      accessibilityLabel={ru.feed.soon.follow}
      accessibilityState={{ disabled: true }}
      disabled
      style={styles.wrap}
    >
      <View style={styles.circle}>
        <Text style={styles.letter}>{name.slice(0, 1).toUpperCase()}</Text>
      </View>
      <View style={styles.badge}>
        <Icon name="add" size={14} color={colors.onAccent} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE + BADGE / 2, alignItems: 'center' },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  letter: { ...typography.heading, color: colors.text },
  badge: {
    position: 'absolute',
    bottom: 0,
    width: BADGE,
    height: BADGE,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
});
