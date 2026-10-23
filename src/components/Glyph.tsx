import Svg, { Circle, Path, Rect } from 'react-native-svg';

/** The line icons of the design. Each is a 24 × 24 drawing; the colour comes from the caller. */
const DRAWINGS = {
  video: (
    <>
      <Rect x="3" y="3" width="18" height="18" rx="6" />
      <Path d="M10 8.5v7l6-3.5z" />
    </>
  ),
  community: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  chat: (
    <Path d="M20 11.5c0 4.1-3.6 7.5-8 7.5-1.2 0-2.3-.2-3.3-.6L4 20l1.3-3.7C4.5 15 4 13.3 4 11.5 4 7.4 7.6 4 12 4s8 3.4 8 7.5z" />
  ),
  cards: (
    <>
      <Rect x="7" y="3" width="13" height="16" rx="2.5" />
      <Path d="M4 7v11.5A2.5 2.5 0 0 0 6.5 21H15" />
    </>
  ),
  person: (
    <>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>
  ),
  plus: <Path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <Circle cx="11" cy="11" r="6.5" />
      <Path d="M20 20l-4.2-4.2" />
    </>
  ),
  bell: (
    <>
      <Path d="M6 9a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9z" />
      <Path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  repost: (
    <>
      <Path d="M17 3l3 3-3 3" />
      <Path d="M4 11V9a3 3 0 0 1 3-3h13" />
      <Path d="M7 21l-3-3 3-3" />
      <Path d="M20 13v2a3 3 0 0 1-3 3H4" />
    </>
  ),
  share: (
    <>
      <Path d="M21 3L10 14" />
      <Path d="M21 3l-7 18-4-7-7-4z" />
    </>
  ),
  check: <Path d="M5 12.5l4.5 4.5L19 7.5" />,
  chevronLeft: <Path d="M15 6l-6 6 6 6" />,
  chevronRight: <Path d="M9 6l6 6-6 6" />,
  minus: <Path d="M5 12h14" />,
  close: <Path d="M6 6l12 12M18 6L6 18" />,
  chevronDown: <Path d="M6 9l6 6 6-6" />,
  copy: (
    <>
      <Rect x="8" y="8" width="12" height="12" rx="3" />
      <Path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </>
  ),
  globe: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </>
  ),
  shield: <Path d="M12 2l8 3v6c0 5-3.4 9-8 11-4.6-2-8-6-8-11V5z" />,
  pen: (
    <>
      <Path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
      <Path d="M13.5 6.5l4 4" />
    </>
  ),
  lock: (
    <>
      <Rect x="5" y="11" width="14" height="10" rx="2.5" />
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  chest: (
    <>
      <Path d="M3 10a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v9H3z" />
      <Path d="M3 12h18" />
      <Rect x="10" y="10" width="4" height="5" rx="1" />
    </>
  ),
  clock: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 7v5l3 2" />
    </>
  ),
  sliders: (
    <>
      <Path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <Circle cx="16" cy="7" r="2.5" />
      <Circle cx="8" cy="17" r="2.5" />
    </>
  ),
  trend: (
    <>
      <Path d="M3 17l6-6 4 4 8-8" />
      <Path d="M15 7h6v6" />
    </>
  ),
  arrowUp: <Path d="M12 19V5M6 11l6-6 6 6" />,
  swap: (
    <>
      <Path d="M7 4L3 8l4 4" />
      <Path d="M3 8h14" />
      <Path d="M17 20l4-4-4-4" />
      <Path d="M21 16H7" />
    </>
  ),
  stats: <Path d="M5 20V10M12 20V4M19 20v-7" />,
} as const;

export type GlyphName = keyof typeof DRAWINGS;

type GlyphProps = Readonly<{
  name: GlyphName;
  size?: number;
  color: string;
  strokeWidth?: number;
  /** Fill the shape (the open tab, a done check). */
  filled?: boolean;
  testID?: string;
}>;

/** A decorative icon: screen readers skip it, the button around it carries the name. */
export function Glyph({
  name,
  size = 24,
  color,
  strokeWidth = 2,
  filled = false,
  testID,
}: GlyphProps) {
  return (
    <Svg
      testID={testID}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {DRAWINGS[name]}
    </Svg>
  );
}
