import Svg, { Circle, Path, Rect } from 'react-native-svg';

type ChestArtProps = Readonly<{
  /** Lit from inside, for the moment of the flash. */
  open?: boolean;
  size?: number;
}>;

/** The treasure chest of the design: a dark box with a silver band and a golden lock. Decorative. */
export function ChestArt({ open = false, size = 180 }: ChestArtProps) {
  return (
    <Svg
      width={size}
      height={(size * 170) / 200}
      viewBox="0 0 200 170"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {open ? <Circle cx="100" cy="70" r="70" fill="#FFE38A" opacity={0.28} /> : null}
      <Rect x="20" y="70" width="160" height="86" rx="10" fill="#3A342D" />
      <Path d="M20 70 V52 Q20 20 100 20 Q180 20 180 52 V70 Z" fill="#4A433A" />
      <Rect x="20" y="64" width="160" height="12" fill="#C7CBD1" />
      <Rect x="84" y="58" width="32" height="36" rx="6" fill="#E8B04B" />
      <Circle cx="100" cy="74" r="4.5" fill="#1A1A1A" />
      <Rect x="98" y="76" width="4" height="9" rx="2" fill="#1A1A1A" />
    </Svg>
  );
}
