import { Text, View } from 'react-native';

import { AuraCoin } from '../../components/AuraIcon';
import { formatPoints } from '../../i18n/format';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, spacing } from '../../theme';

type BalanceChipProps = Readonly<{ balance: number | null }>;

/** The small white pill with the coin and the balance in the corner of a screen. */
export function BalanceChip({ balance }: BalanceChipProps) {
  const styles = useStyles();
  const spoken =
    balance === null ? ru.wallet.title : `${ru.wallet.title}: ${formatPoints(balance)}`;
  return (
    <View testID="balance-chip" accessible accessibilityLabel={spoken} style={styles.chip}>
      <AuraCoin size={20} />
      <Text style={styles.text}>{balance === null ? '—' : formatPoints(balance)}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  chip: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm + 4,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  text: { fontFamily: fontFamilies.extrabold, fontSize: 14, color: colors.text },
}));
