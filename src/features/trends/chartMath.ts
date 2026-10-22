/** Bar heights for a simple chart: the biggest value fills `maxHeight`, none is thinner than `minHeight`. */
export function barHeights(
  values: readonly number[],
  maxHeight: number,
  minHeight: number,
): number[] {
  const biggest = Math.max(0, ...values);
  if (biggest === 0) return values.map(() => minHeight);
  return values.map((value) =>
    Math.max(minHeight, Math.round((Math.max(0, value) / biggest) * maxHeight)),
  );
}
