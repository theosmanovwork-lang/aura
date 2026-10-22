import type { Repositories } from '../../data/repositories';
import { NotFoundError } from '../../data/repositories';
import { createLedgerEntry } from '../../domain/ledger';
import { createPrediction, type Prediction } from '../../domain/prediction';
import { assertValidStake, payoutFor } from '../../domain/predictionRules';
import { runInOrder } from '../runInOrder';
import { ensureWelcomeBonus } from '../wallet/walletService';
import { currentWaveScore, settleDuePredictions } from './settlement';

export { settleDuePredictions } from './settlement';

/** "Accelerated day": a prediction is decided after this long. */
export const PREDICTION_DURATION_MS = 10 * 60 * 1000;

export class AlreadyPredictedError extends Error {
  constructor(trendId: string) {
    super(`predictions: a prediction on "${trendId}" is already waiting for its result`);
    this.name = 'AlreadyPredictedError';
  }
}

export type PlacePredictionInput = Readonly<{
  userId: string;
  trendId: string;
  stake: number;
  now: number;
}>;

async function placeNow(repos: Repositories, input: PlacePredictionInput): Promise<Prediction> {
  const { userId, trendId, stake, now } = input;
  assertValidStake(stake);
  if (!(await repos.trends.getById(trendId))) throw new NotFoundError('trends', trendId);

  // A prediction whose time is up must not keep blocking a new one.
  await settleDuePredictions(repos, userId, now);
  const waiting = (await repos.predictions.listByUser(userId)).some(
    (prediction) => prediction.trendId === trendId && prediction.status === 'open',
  );
  if (waiting) throw new AlreadyPredictedError(trendId);

  const prediction = createPrediction({
    id: `prediction-${userId}-${trendId}-${now}`,
    userId,
    trendId,
    stake,
    baselineScore: await currentWaveScore(repos, trendId),
    createdAt: now,
    closesAt: now + PREDICTION_DURATION_MS,
  });

  // Take the stake first: the ledger refuses it if the balance is too small.
  await repos.wallet.append(
    createLedgerEntry({
      id: `stake-${prediction.id}`,
      userId,
      amount: -stake,
      kind: 'prediction_stake',
      refId: prediction.id,
      createdAt: now,
    }),
  );
  try {
    return await repos.predictions.add(prediction);
  } catch (error) {
    // Give the stake back so the ledger and the predictions never disagree. If even that fails,
    // the original error is still the useful one to report.
    try {
      await repos.wallet.append(
        createLedgerEntry({
          id: `refund-${prediction.id}`,
          userId,
          amount: stake,
          kind: 'prediction_payout',
          refId: prediction.id,
          createdAt: now,
        }),
      );
    } catch {
      // Nothing more can be done here; see the note on atomicity in docs/PLAN.md.
    }
    throw error;
  }
}

/** Puts sparks on "this wave will grow". Taps on the same wave are handled one at a time. */
export function placePrediction(
  repos: Repositories,
  input: PlacePredictionInput,
): Promise<Prediction> {
  return runInOrder(`predict:${input.userId}:${input.trendId}`, () => placeNow(repos, input));
}

export type PredictionView = Readonly<{
  prediction: Prediction;
  trendName: string;
  /** Sparks paid out at the end; 0 while waiting or when it did not come true. */
  payout: number;
}>;

/** The user's predictions, newest first. Closes the ones whose time is up before answering. */
export async function loadMyPredictions(
  repos: Repositories,
  userId: string,
  now: number,
): Promise<PredictionView[]> {
  await settleDuePredictions(repos, userId, now);
  const predictions = await repos.predictions.listByUser(userId);
  const names = new Map<string, string>();
  for (const { trendId } of predictions) {
    if (!names.has(trendId)) names.set(trendId, (await repos.trends.getById(trendId))?.name ?? '');
  }
  return [...predictions]
    .reverse()
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((prediction) => ({
      prediction,
      trendName: names.get(prediction.trendId) ?? '',
      payout: payoutFor(prediction.status, prediction.stake),
    }));
}

export type PredictionPanel = Readonly<{ balance: number; open: Prediction | null }>;

/** What the "support this wave" block needs: the balance and the waiting prediction, if any. */
export async function loadPredictionPanel(
  repos: Repositories,
  userId: string,
  trendId: string,
  now: number,
): Promise<PredictionPanel> {
  await ensureWelcomeBonus(repos, userId, now);
  await settleDuePredictions(repos, userId, now);
  const [balance, predictions] = await Promise.all([
    repos.wallet.getBalance(userId),
    repos.predictions.listByUser(userId),
  ]);
  const open = predictions.find((p) => p.trendId === trendId && p.status === 'open') ?? null;
  return { balance, open };
}
