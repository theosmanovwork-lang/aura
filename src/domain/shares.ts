/**
 * Shares of a video on a bonding curve (SPEC §5 of the design): the more shares are sold, the higher
 * the price of the next one. All amounts are in Aura; nothing here touches the ledger.
 */
export const BASE_PRICE = 10;
export const PRICE_STEP = 0.05;
/** Part of the money from a sale that is kept back: 2% goes to the author, 3% is burned. */
export const SELL_FEE = 0.05;
export const AUTHOR_FEE = 0.02;
export const BURN_FEE = 0.03;
/** Most shares one purchase can be, so a screen never loops without end. */
export const MAX_SHARES_PER_TRADE = 2000;

const assertWhole = (name: string, value: number): void => {
  if (!Number.isInteger(value) || value < 0)
    throw new RangeError(`${name} must be a whole number >= 0`);
};

/** The price of the next share when `sold` shares are already sold. */
export function sharePrice(sold: number): number {
  assertWhole('sold', sold);
  return BASE_PRICE + PRICE_STEP * sold;
}

/** What `n` more shares cost, bought at once, when `sold` are already sold. */
export function buyCost(n: number, sold: number): number {
  assertWhole('n', n);
  assertWhole('sold', sold);
  return n * BASE_PRICE + PRICE_STEP * (n * sold + (n * (n - 1)) / 2);
}

/** What selling `n` shares brings after the fee, when `sold` are sold (the buyer side counted already). */
export function sellNet(n: number, sold: number): number {
  assertWhole('n', n);
  assertWhole('sold', sold);
  if (n > sold) throw new RangeError('cannot sell more shares than are sold');
  const gross = n * BASE_PRICE + PRICE_STEP * (n * (sold - 1) - (n * (n - 1)) / 2);
  return gross * (1 - SELL_FEE);
}

/** The most shares that can be bought with `balance`. */
export function maxBuyable(balance: number, sold: number): number {
  let n = 0;
  while (n < MAX_SHARES_PER_TRADE && buyCost(n + 1, sold) <= balance) n += 1;
  return n;
}
