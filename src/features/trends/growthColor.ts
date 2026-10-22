import { colors } from '../../theme';

/** Green for growth, red for a fall, grey for no change or unknown. */
export function growthColor(percent: number | null): string {
  if (percent === null || percent === 0) return colors.textMuted;
  return percent > 0 ? colors.positive : colors.negative;
}
