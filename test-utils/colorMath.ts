/** WCAG 2.x helpers shared by the colour tests. */
export type Rgb = readonly [number, number, number];

export const rgb = (hex: string): Rgb => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

export const parseRgba = (value: string): [number, number, number, number] => {
  const [r, g, b, a] = value.match(/[\d.]+/g)!.map(Number);
  return [r!, g!, b!, a!];
};

/** An `rgba(...)` colour laid over a #RRGGBB base. */
export const blend = (overlay: string, base: string): Rgb => {
  const [r, g, b, a] = parseRgba(overlay);
  const [br, bg, bb] = rgb(base);
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a)];
};

const luminance = ([r, g, b]: Rgb): number => {
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

export const contrast = (a: Rgb, b: Rgb): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

export const TEXT_MIN = 4.5; // WCAG AA for normal text
export const GRAPHIC_MIN = 3; // WCAG AA for icons and large graphics
