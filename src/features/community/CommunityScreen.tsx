import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { Glyph } from '../../components/Glyph';
import { Message } from '../../components/Message';
import { useTabScreenContent } from '../../components/useTabScreenContent';
import { useRepositories } from '../../data/RepositoriesProvider';
import { demoLots, demoReferralCode } from '../../data/seed/demoCommunity';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';
import { loadRatings } from '../hub/hubService';
import { useLoad } from '../useLoad';
import { useBalance } from '../wallet/useBalance';
import { BalanceChip } from './BalanceChip';
import { LotCard } from './LotCard';
import { NoticeCard } from './NoticeCard';
import { ClansCard, PlayersCard } from './RankingCards';
import { ReferralCard } from './ReferralCard';
import { TradeTabs, type TradeMode } from './TradeTabs';
import { TradeBar } from './TradeBar';
import { useCopyCode } from './useCopyCode';

type CommunityScreenProps = Readonly<{
  /** Change it to load the data again (for example every time the tab comes into view). */
  refreshKey?: number;
}>;

const matches = (text: string, query: string) =>
  text.toLowerCase().includes(query.trim().toLowerCase());

export function CommunityScreen({ refreshKey = 0 }: CommunityScreenProps) {
  const styles = useStyles();
  const colors = useColors();
  const content = useTabScreenContent(styles.content);
  const repos = useRepositories();
  const balance = useBalance(refreshKey);
  const load = useCallback(() => loadRatings(repos), [repos]);
  const { state, reload } = useLoad(load, refreshKey);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<TradeMode>('auctions');
  const [noticeOn, setNoticeOn] = useState(false);
  const referral = useCopyCode(demoReferralCode);

  const lots = useMemo(
    () => demoLots.filter((lot) => !query.trim() || matches(`${lot.name} ${lot.seller}`, query)),
    [query],
  );

  if (state.status === 'error') {
    return (
      <Message text={ru.community.error} action={{ label: ru.community.retry, run: reload }} />
    );
  }
  const authors = state.status === 'ready' ? state.data.authors : [];

  return (
    <View style={styles.page}>
      <ScrollView testID="community-scroll" contentContainerStyle={content}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            {ru.community.title}
          </Text>
          <BalanceChip balance={balance} />
        </View>

        <View style={styles.search}>
          <Glyph name="search" size={20} color={colors.textMuted} strokeWidth={2.2} />
          <TextInput
            testID="community-search"
            accessibilityLabel={ru.community.searchLabel}
            placeholder={ru.community.search}
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            style={styles.input}
          />
        </View>

        <NoticeCard on={noticeOn} onToggle={() => setNoticeOn((on) => !on)} />
        <ReferralCard copied={referral.copied} onCopy={() => void referral.copy()} />

        <View style={styles.columns}>
          <PlayersCard authors={authors} />
          <ClansCard />
        </View>

        <TradeTabs mode={mode} onChange={setMode} lotCount={lots.length} />

        <View style={styles.grid}>
          {lots.map((lot) => (
            <View key={lot.id} style={styles.cell}>
              <LotCard lot={lot} mode={mode} />
            </View>
          ))}
        </View>
      </ScrollView>
      <TradeBar />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, gap: 12 },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fontFamilies.extrabold,
    fontSize: 30,
    letterSpacing: -0.9,
    color: colors.text,
  },
  search: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, fontFamily: fontFamilies.semibold, fontSize: 15, color: colors.text },
  columns: { flexDirection: 'row', gap: 12, marginTop: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { width: '47.5%' },
}));
