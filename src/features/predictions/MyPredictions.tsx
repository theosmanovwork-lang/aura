import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useRepositories } from '../../data/RepositoriesProvider';
import { CURRENT_USER_ID } from '../../data/seed'; // temporary: a real profile arrives with onboarding
import { formatPoints, formatSignedPoints } from '../../i18n/format';
import { pluralRu } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { colors, radii, spacing, typography } from '../../theme';
import { useLatest } from '../useLatest';
import { useLoad } from '../useLoad';
import { loadMyPredictions, type PredictionView } from './predictionService';

const sparks = (n: number): string => `${formatPoints(n)} ${pluralRu(n, ru.wallet.sparks)}`;

function describe(view: PredictionView): string {
  const { prediction, trendName, payout } = view;
  const parts = [trendName, sparks(prediction.stake), ru.predictions.status[prediction.status]];
  if (payout > 0 && prediction.status === 'won') parts.push(`${ru.wallet.plus} ${sparks(payout)}`);
  return parts.join(', ');
}

function Row({ view }: Readonly<{ view: PredictionView }>) {
  const { prediction, trendName, payout } = view;
  return (
    <View
      testID={`prediction-row-${prediction.id}`}
      accessible
      accessibilityLabel={describe(view)}
      style={styles.row}
    >
      <View style={styles.text}>
        <Text style={styles.name}>{trendName}</Text>
        <Text style={styles.caption}>
          {`${sparks(prediction.stake)} · ${ru.predictions.status[prediction.status]}`}
        </Text>
      </View>
      {prediction.status === 'won' && payout > 0 ? (
        <Text style={styles.payout}>{formatSignedPoints(payout)}</Text>
      ) : null}
    </View>
  );
}

type MyPredictionsProps = Readonly<{ now?: () => number; refreshKey?: number }>;

/** The user's predictions with their results. Shows nothing until there is a first prediction. */
export function MyPredictions({ now = Date.now, refreshKey = 0 }: MyPredictionsProps) {
  const repos = useRepositories();
  const clock = useLatest(now);
  const load = useCallback(
    () => loadMyPredictions(repos, CURRENT_USER_ID, clock.current()),
    [repos, clock],
  );
  const { state } = useLoad(load, refreshKey);

  if (state.status === 'loading') return null;
  if (state.status === 'error') return <Text style={styles.caption}>{ru.predictions.error}</Text>;
  if (state.data.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title} accessibilityRole="header">
        {ru.predictions.myTitle}
      </Text>
      {state.data.map((view) => (
        <Row key={view.prediction.id} view={view} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  title: { ...typography.bodyStrong, color: colors.text },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: { flex: 1, gap: spacing.xxs },
  name: { ...typography.body, color: colors.text },
  caption: { ...typography.caption, color: colors.textMuted },
  payout: { ...typography.bodyStrong, color: colors.positive },
});
