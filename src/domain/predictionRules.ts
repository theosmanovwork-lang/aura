import type { PredictionStatus } from './prediction';

/** The least sparks you can put on one prediction. */
export const MIN_STAKE = 10;

/** When a prediction comes true you get back your stake and the same amount on top. */
export const PAYOUT_MULTIPLIER = 2;

/** Throws unless the stake is a whole number of at least MIN_STAKE. */
export function assertValidStake(stake: number): void {
  if (!Number.isSafeInteger(stake) || stake < MIN_STAKE) {
    throw new Error(`stake must be a whole number of at least ${MIN_STAKE}`);
  }
}

/** Compares the wave's score now with its score when the prediction was made. */
export function decidePrediction(
  baselineScore: number,
  currentScore: number,
): 'won' | 'lost' | 'void' {
  if (currentScore > baselineScore) return 'won';
  if (currentScore < baselineScore) return 'lost';
  return 'void';
}

/** Sparks paid out at the end: double when it came true, the stake back on a draw, else nothing. */
export function payoutFor(status: PredictionStatus, stake: number): number {
  if (status === 'won') return stake * PAYOUT_MULTIPLIER;
  if (status === 'void') return stake;
  return 0;
}
