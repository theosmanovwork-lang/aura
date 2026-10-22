import type { Repositories } from '../../data/repositories';
import { DuplicateKeyError } from '../../data/repositories';
import { createLedgerEntry } from '../../domain/ledger';
import type { Prediction } from '../../domain/prediction';
import { decidePrediction, PAYOUT_MULTIPLIER, payoutFor } from '../../domain/predictionRules';
import { calcTrendScore } from '../../domain/trendScore';
import { runInOrder } from '../runInOrder';

/** The popularity index of a wave right now. */
export async function currentWaveScore(repos: Repositories, trendId: string): Promise<number> {
  const published = await repos.videos.listPublished();
  return calcTrendScore(published.filter((video) => video.trendId === trendId));
}

async function settleOne(
  repos: Repositories,
  userId: string,
  predictionId: string,
  now: number,
): Promise<Prediction | null> {
  // Read again inside the queue: another call may have just closed it.
  const prediction = await repos.predictions.getById(predictionId);
  if (!prediction || prediction.status !== 'open' || prediction.closesAt > now) return null;

  const payoutId = `payout-${prediction.id}`;
  const paid = (await repos.wallet.listByUser(userId)).find((entry) => entry.id === payoutId);

  // If the payout was already made (the app was closed before the result was saved), the
  // payout itself tells the result. Otherwise it is decided by the wave's score now.
  const status = paid
    ? paid.amount === prediction.stake * PAYOUT_MULTIPLIER
      ? 'won'
      : 'void'
    : decidePrediction(prediction.baselineScore, await currentWaveScore(repos, prediction.trendId));

  const payout = payoutFor(status, prediction.stake);
  if (!paid && payout > 0) {
    try {
      await repos.wallet.append(
        createLedgerEntry({
          id: payoutId,
          userId,
          amount: payout,
          kind: 'prediction_payout',
          refId: prediction.id,
          createdAt: now,
        }),
      );
    } catch (error) {
      if (!(error instanceof DuplicateKeyError)) throw error;
    }
  }
  return repos.predictions.updateStatus(prediction.id, status);
}

/**
 * Closes the user's predictions whose time is up, pays them out and returns the ones closed now.
 * Each prediction is closed exactly once, however many screens ask at the same time.
 */
export async function settleDuePredictions(
  repos: Repositories,
  userId: string,
  now: number,
): Promise<Prediction[]> {
  const due = (await repos.predictions.listByUser(userId)).filter(
    (prediction) => prediction.status === 'open' && prediction.closesAt <= now,
  );
  // One prediction that cannot be closed must not stop the others; the first error is reported
  // once all of them have been tried, and the failed one is simply tried again next time.
  const results = await Promise.allSettled(
    due.map((prediction) =>
      runInOrder(`settle:${prediction.id}`, () => settleOne(repos, userId, prediction.id, now)),
    ),
  );
  const failed = results.find(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  );
  if (failed) throw failed.reason;
  return results.flatMap((result) =>
    result.status === 'fulfilled' && result.value !== null ? [result.value] : [],
  );
}
