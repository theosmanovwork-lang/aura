export type PredictionStatus = 'open' | 'won' | 'lost' | 'void';

export type Prediction = Readonly<{
  id: string;
  userId: string;
  trendId: string;
  /** Whole number of points put on the prediction. */
  stake: number;
  baselineScore: number;
  createdAt: number;
  closesAt: number;
  status: PredictionStatus;
}>;

export type PredictionInput = Omit<Prediction, 'status'>;

export function createPrediction(input: PredictionInput): Prediction {
  if (!Number.isSafeInteger(input.stake) || input.stake <= 0) {
    throw new Error('stake must be a positive whole number');
  }
  if (!(input.closesAt > input.createdAt)) {
    throw new Error('closesAt must be later than createdAt');
  }
  return { ...input, status: 'open' };
}
