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
  onPress?: () => void;
  place: number;
  avatar: React.ReactNode;
  name: string;
  caption: string;
  testID: string;
}>;

function Row({ onPress, place, avatar, name, caption, testID }: RowProps) {
  const styles = useStyles();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${place}. ${name}, ${caption}`}
      onPress={onPress}
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
    </Pressable>
  );
}

type PlayersCardProps = Readonly<{
  authors: readonly AuthorRatingRow[];
  onOpenUser?: (name: string) => void;
}>;

/** «Рейтинг»: the best authors by the price of their videos, from the real data. */
export function PlayersCard({ authors, onOpenUser }: PlayersCardProps) {
  const styles = useStyles();
  return (
    <View testID="players-card" style={styles.card}>
      <View style={styles.head}>
        <View>
          <Text style={styles.headTitle}>{ru.community.rating}</Text>
          <Text style={styles.headSub}>{ru.community.ratingSub}</Text>
        </View>
      </View>
      {authors.slice(0, TOP).map((author, index) => (
        <Row
          key={author.authorId}
          testID={`player-${author.authorId}`}
          onPress={() => onOpenUser?.(author.name)}
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
type ClansCardProps = Readonly<{ onOpenClan?: (clanId: string) => void }>;

export function ClansCard({ onOpenClan }: ClansCardProps) {
  const styles = useStyles();
  return (
    <View testID="clans-card" style={styles.card}>
      <View style={styles.head}>
        <View>
          <Text style={styles.headTitle}>{ru.community.clans}</Text>
          <Text style={styles.headSub}>{ru.community.clansSub}</Text>
        </View>
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
          onPress={() => onOpenClan?.(clan.id)}
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
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headTitle: { fontFamily: fontFamilies.bold, fontSize: 15, color: colors.text },
  headSub: { fontFamily: fontFamilies.medium, fontSize: 11, color: colors.textMuted },
  all: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.text },
  row: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 7 },
  medal: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalText: { fontFamily: fontFamilies.bold, fontSize: 11, color: '#1A1A1A' },
  names: { flex: 1, minWidth: 0 },
  name: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.text },
  caption: { fontFamily: fontFamilies.bold, fontSize: 11, color: colors.textMuted },
}));
