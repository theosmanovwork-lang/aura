import { colors } from '../../theme';

/** Growth is light, a fall is muted, no change or unknown is muted too; the arrow carries the meaning. */
export function growthColor(percent: number | null): string {
  if (percent === null || percent === 0) return colors.textMuted;
  return percent > 0 ? colors.positive : colors.negative;
}
