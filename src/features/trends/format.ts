import { ru } from '../../i18n/ru';

const withComma = (value: number): string => String(value).replace('.', ',');

/** Growth in percent for the screen: ▲ 16,3%, ▼ 4,1%, 0% or — when it is unknown. */
export function formatGrowth(percent: number | null): string {
  if (percent === null) return ru.trends.growth.unknown;
  if (percent === 0) return '0%';
  const arrow = percent > 0 ? ru.trends.growth.up : ru.trends.growth.down;
  return `${arrow} ${withComma(Math.abs(percent))}%`;
}

/** The same in words for screen readers: "рост 16,3% за сутки". */
export function describeGrowth(percent: number | null): string {
  const { rise, fall, flat, unknownSpoken, perDay } = ru.trends.growth;
  if (percent === null) return unknownSpoken;
  if (percent === 0) return flat;
  return `${percent > 0 ? rise : fall} ${withComma(Math.abs(percent))}% ${perDay}`;
}
