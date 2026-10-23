/** The least Aura you can put into a video in one go. */
export const MIN_INVESTMENT = 10;

/** The most Aura one user can have put into one video. */
export const MAX_INVESTMENT_PER_VIDEO = 500;

/**
 * What a user holds in one video. Shares are the invested Aura divided by the price at the time;
 * the worth is shares times the price now, so it moves with the video, up or down.
 */
export type Investment = Readonly<{
  id: string;
  userId: string;
  videoId: string;
  /** Aura put in and not yet taken back, a whole number. */
  invested: number;
  units: number;
  createdAt: number;
  updatedAt: number;
}>;

const isWhole = (value: number): boolean => Number.isSafeInteger(value);

/** Throws unless the amount is whole, at least the minimum, and keeps the video within the cap. */
export function assertValidInvestAmount(amount: number, alreadyInvested: number): void {
  if (!isWhole(amount) || amount < MIN_INVESTMENT) {
    throw new Error(`amount must be a whole number of at least ${MIN_INVESTMENT}`);
  }
  if (alreadyInvested + amount > MAX_INVESTMENT_PER_VIDEO) {
    throw new Error(`amount takes the video over the cap of ${MAX_INVESTMENT_PER_VIDEO}`);
  }
}

type OpenInput = Readonly<{
  id: string;
  userId: string;
  videoId: string;
  amount: number;
  price: number;
  now: number;
}>;

function assertPrice(price: number): void {
  if (!Number.isFinite(price) || price <= 0) throw new Error('price must be positive');
}

export function openPosition(input: OpenInput): Investment {
  assertValidInvestAmount(input.amount, 0);
  assertPrice(input.price);
  return {
    id: input.id,
    userId: input.userId,
    videoId: input.videoId,
    invested: input.amount,
    units: input.amount / input.price,
    createdAt: input.now,
    updatedAt: input.now,
  };
}

type MoveInput = Readonly<{ amount: number; price: number; now: number }>;

/** Puts more Aura in at the current price. */
export function addToPosition(position: Investment, input: MoveInput): Investment {
  assertValidInvestAmount(input.amount, position.invested);
  assertPrice(input.price);
  return {
    ...position,
    invested: position.invested + input.amount,
    units: position.units + input.amount / input.price,
    updatedAt: input.now,
  };
}

/** What the position is worth at this price (a fraction is possible). */
export function positionValue(position: Investment, price: number): number {
  return position.units * price;
}

/** The most Aura that can be taken out now: the worth rounded down to a whole number. */
export function takableAmount(position: Investment, price: number): number {
  return Math.floor(positionValue(position, price) + 1e-9);
}

/**
 * Takes a whole amount of Aura out at the current price. Taking the most that is possible closes
 * the position; taking less leaves the shares and the invested total in proportion.
 */
export function takeFromPosition(
  position: Investment,
  input: MoveInput,
): Readonly<{ position: Investment; payout: number }> {
  assertPrice(input.price);
  if (!isWhole(input.amount) || input.amount <= 0) {
    throw new Error('amount must be a positive whole number');
  }
  const takable = takableAmount(position, input.price);
  if (input.amount > takable)
    throw new Error(`amount is more than the position is worth (${takable})`);

  if (input.amount === takable) {
    return {
      position: { ...position, units: 0, invested: 0, updatedAt: input.now },
      payout: input.amount,
    };
  }
  const units = position.units - input.amount / input.price;
  const invested = Math.round((position.invested * units) / position.units);
  return { position: { ...position, units, invested, updatedAt: input.now }, payout: input.amount };
}
