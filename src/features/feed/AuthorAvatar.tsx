import { View } from 'react-native';

import { Avatar } from '../../components/Avatar';
import { Glyph } from '../../components/Glyph';
import { SilverView } from '../../components/SilverView';
import { ru } from '../../i18n/ru';
import { knock } from '../../motion/haptics';
import { Pop } from '../../motion/Pop';
import { makeStyles } from '../../theme';
import { PressableScale } from '../../motion/PressableScale';

const SIZE = 48;
const BADGE = 28;

type AuthorAvatarProps = Readonly<{
  name: string;
  following: boolean;
  onToggleFollow: () => void;
}>;

/** The author's round avatar with a badge under it: «+» to follow, a check once followed. */
export function AuthorAvatar({ name, following, onToggleFollow }: AuthorAvatarProps) {
  const styles = useStyles();
  const label = (following ? ru.feed.unfollow : ru.feed.follow).replace('{name}', name);
  const badge = (
    <Glyph name={following ? 'check' : 'plus'} size={12} color="#1A1A1A" strokeWidth={3.4} />
  );
  return (
    <View testID="author-avatar" style={styles.wrap}>
      <View style={styles.ring}>
        <Avatar initial={name.slice(0, 1).toUpperCase()} tone="brand" size={SIZE - 4} />
      </View>
      <PressableScale
        testID="follow-button"
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: following }}
        onPress={() => {
          knock();
          onToggleFollow();
        }}
        style={styles.badgeHit}
      >
        <Pop trigger={following} peak={1.5}>
          {following ? (
            <View style={[styles.badge, styles.badgeDone]}>{badge}</View>
          ) : (
            <SilverView style={styles.badge}>{badge}</SilverView>
          )}
        </Pop>
      </PressableScale>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  wrap: { width: 52, height: 60, alignItems: 'center' },
  ring: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  badgeHit: { position: 'absolute', left: 12, top: 34, width: BADGE, height: BADGE },
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDone: { backgroundColor: '#FFFFFF' },
}));
