import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { InsufficientPointsError } from '../../data/repositories';
import { useRepositories } from '../../data/RepositoriesProvider';
import { CURRENT_USER_ID } from '../../data/seed'; // temporary: a real profile arrives with onboarding
import type { Prediction } from '../../domain/prediction';
import { formatPoints } from '../../i18n/format';
import { pluralRu } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { colors, radii, spacing, typography } from '../../theme';
import { useLatest } from '../useLatest';
import { useLoad } from '../useLoad';
import {
  AlreadyPredictedError,
  loadPredictionPanel,
  placePrediction,
  PREDICTION_DURATION_MS,
} from './predictionService';

const STAKE_PRESETS = [10, 50, 100, 250] as const;
const MINUTE_MS = 60_000;

type Failure = 'notEnough' | 'already' | 'error';

const failureOf = (error: unknown): Failure => {
  if (error instanceof InsufficientPointsError) return 'notEnough';
  if (error instanceof AlreadyPredictedError) return 'already';
  return 'error';
};

const sparks = (n: number): string => `${formatPoints(n)} ${pluralRu(n, ru.wallet.sparks)}`;
const minutes = (n: number): string => `${n} ${pluralRu(n, ru.predictions.minutes)}`;

function timeLeftLabel(prediction: Prediction, now: number): string {
  const left = prediction.closesAt - now;
  return left < MINUTE_MS ? ru.predictions.lessThanMinute : minutes(Math.ceil(left / MINUTE_MS));
}

type PredictionPanelProps = Readonly<{
  trendId: string;
  now?: () => number;
  /** Change it to load the block again. */
  refreshKey?: number;
}>;

/** "Support this wave": put sparks on the wave growing, or see the prediction that is waiting. */
export function PredictionPanel({ trendId, now = Date.now, refreshKey = 0 }: PredictionPanelProps) {
  const repos = useRepositories();
  const clock = useLatest(now);
  const load = useCallback(
    () => loadPredictionPanel(repos, CURRENT_USER_ID, trendId, clock.current()),
    [repos, trendId, clock],
  );
  const { state, reload } = useLoad(load, refreshKey);
  const [stake, setStake] = useState<number>(STAKE_PRESETS[0]);
  const [failure, setFailure] = useState<Failure | null>(null);
  const placing = useRef(false);

  const place = async () => {
    if (placing.current) return;
    placing.current = true;
    setFailure(null);
    try {
      await placePrediction(repos, {
        userId: CURRENT_USER_ID,
        trendId,
        stake,
        now: clock.current(),
      });
      reload();
    } catch (error) {
      const kind = failureOf(error);
      setFailure(kind);
      if (kind === 'already') reload();
    } finally {
      placing.current = false;
    }
  };

  if (state.status === 'loading') return <Text style={styles.hint}>{ru.predictions.loading}</Text>;
  if (state.status === 'error') {
    return (
      <View style={styles.card}>
        <Text style={styles.hint}>{ru.predictions.error}</Text>
        <Button label={ru.predictions.retry} onPress={reload} />
      </View>
    );
  }

  const { balance, open } = state.data;
  if (open) {
    return (
      <View testID="prediction-open" style={styles.card}>
        <Text style={styles.title} accessibilityRole="header">
          {ru.predictions.accepted}
        </Text>
        <Text style={styles.body}>{sparks(open.stake)}</Text>
        <Text style={styles.hint}>
          {`${ru.predictions.resultIn} ${timeLeftLabel(open, clock.current())}`}
        </Text>
      </View>
    );
  }

  const tooLittle = stake > balance;
  const duration = minutes(PREDICTION_DURATION_MS / MINUTE_MS);
  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        {ru.predictions.title}
      </Text>
      <Text style={styles.hint}>{ru.predictions.rules.replace('{duration}', duration)}</Text>

      <Text style={styles.label}>{ru.predictions.amountLabel}</Text>
      <View style={styles.options}>
        {STAKE_PRESETS.map((preset) => (
          <Button
            key={preset}
            testID={`stake-option-${preset}`}
            variant="chip"
            label={sparks(preset)}
            selected={preset === stake}
            disabled={preset > balance}
            onPress={() => setStake(preset)}
          />
        ))}
      </View>

      <Button
        testID="place-prediction"
        label={`${ru.predictions.place} ${sparks(stake)}`}
        disabled={tooLittle}
        onPress={() => void place()}
      />
      {tooLittle ? <Text style={styles.warning}>{ru.predictions.notEnough}</Text> : null}
      {failure ? (
        <Text style={styles.warning} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {ru.predictions[failure]}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.panel,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { ...typography.heading, color: colors.text },
  label: { ...typography.caption, color: colors.textMuted },
  body: { ...typography.bodyStrong, color: colors.text },
  hint: { ...typography.caption, color: colors.textMuted },
  warning: { ...typography.caption, color: colors.destructive },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
