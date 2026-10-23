import type { Palette } from '../../theme';

/** Growth is green, a fall is red, no change or unknown is muted; the arrow carries the meaning too. */
export function growthColor(percent: number | null, colors: Palette): string {
  if (percent === null || percent === 0) return colors.textMuted;
  return percent > 0 ? colors.positive : colors.negative;
}
