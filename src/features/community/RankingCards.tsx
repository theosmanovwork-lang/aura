import { Pressable, Text, View } from 'react-native';

import { Avatar, type AvatarTone } from '../../components/Avatar';
import { demoClans } from '../../data/seed/demoCommunity';
import { formatCount, pluralRu } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, medals } from '../../theme';
import type { AuthorRatingRow } from '../hub/hubService';

const PLAYER_TONES: readonly AvatarTone[] = ['ink', 'green', 'red'];
const TOP = 3;

type RowProps = Readonly<{
  place: number;
  avatar: React.ReactNode;
  name: string;
  caption: string;
  testID: string;
}>;

function Row({ place, avatar, name, caption, testID }: RowProps) {
  const styles = useStyles();
  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel={`${place}. ${name}, ${caption}`}
      style={styles.row}
    >
      <View style={[styles.medal, { backgroundColor: medals[place - 1] }]}>
        <Text style={styles.medalText}>{place}</Text>
      </View>
      {avatar}
      <View style={styles.names}>
        <Text numberOfLines={1} style={styles.name}>
          {name}
        </Text>
        <Text style={styles.caption}>{caption}</Text>
      </View>
    </View>
  );
}

type PlayersCardProps = Readonly<{ authors: readonly AuthorRatingRow[] }>;

/** «Рейтинг»: the best authors by the price of their videos, from the real data. */
export function PlayersCard({ authors }: PlayersCardProps) {
  const styles = useStyles();
  return (
    <View testID="players-card" style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.headTitle}>{ru.community.rating}</Text>
      </View>
      {authors.slice(0, TOP).map((author, index) => (
        <Row
          key={author.authorId}
          testID={`player-${author.authorId}`}
          place={index + 1}
          avatar={
            <Avatar
              initial={author.name.slice(0, 1).toUpperCase()}
              tone={PLAYER_TONES[index] ?? 'ink'}
              size={30}
            />
          }
          name={author.name}
          caption={ru.community.points.replace('{n}', formatCount(author.total))}
        />
      ))}
    </View>
  );
}

/** «Топ кланов»: made-up clans until clans exist. */
export function ClansCard() {
  const styles = useStyles();
  return (
    <View testID="clans-card" style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.headTitle}>{ru.community.clans}</Text>
        <Pressable
          disabled
          accessibilityState={{ disabled: true }}
          accessibilityRole="button"
          accessibilityLabel={ru.community.all}
        >
          <Text style={styles.all}>{ru.community.all}</Text>
        </Pressable>
      </View>
      {demoClans.map((clan, index) => (
        <Row
          key={clan.id}
          testID={`clan-${clan.id}`}
          place={index + 1}
          avatar={
            <Avatar
              initial={clan.initial}
              tone={clan.tone === 'ink' ? 'ink' : clan.tone === 'brand' ? 'brand' : 'silver'}
              size={30}
              square
            />
          }
          name={clan.name}
          caption={`${clan.members} ${pluralRu(clan.members, ru.community.members)}`}
        />
      ))}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    backgroundColor: colors.surface,
  },
  head: {
    height: 20,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headTitle: { fontFamily: fontFamilies.extrabold, fontSize: 14, color: colors.text },
  all: { fontFamily: fontFamilies.extrabold, fontSize: 13, color: colors.text },
  row: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 7 },
  medal: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalText: { fontFamily: fontFamilies.extrabold, fontSize: 11, color: '#1A1A1A' },
  names: { flex: 1, minWidth: 0 },
  name: { fontFamily: fontFamilies.extrabold, fontSize: 13, color: colors.text },
  caption: { fontFamily: fontFamilies.bold, fontSize: 11, color: colors.textMuted },
}));
