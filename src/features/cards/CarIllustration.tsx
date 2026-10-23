import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import type { RarityStyle } from './rarity';

type CarIllustrationProps = Readonly<{
  car: RarityStyle['car'];
  label: string;
  style?: object;
}>;

/** The classic sedan on the cards (drawn by the owner's designer); only the colours change with the rarity. */
export function CarIllustration({ car: c, label, style }: CarIllustrationProps) {
  return (
    <Svg viewBox="0 0 220 120" accessibilityRole="image" accessibilityLabel={label} style={style}>
      <Ellipse cx="114" cy="104" rx="104" ry="7" fill="rgba(0,0,0,0.26)" />
      <Ellipse cx="24" cy="95" rx="7" ry="9" fill="#141218" />
      <Path
        d="M36 49 L52 30 L122 25.5 L172 27 L187 45.2 L100 50 Z"
        fill={c.body}
        stroke={c.edge}
        strokeWidth="0.8"
      />
      <Path d="M52 30 L106 31 L172 27 L122 25.5 Z" fill={c.top} stroke={c.edge} strokeWidth="0.8" />
      <Path d="M106 31 L172 27" stroke={c.chrome} strokeWidth="1" />
      <Path d="M40.5 48 L54 32.5 L103.5 33.3 L98.5 48.6 Z" fill={c.glass} />
      <Path d="M57 46.5 L63.5 46.5 L77 34 L70.5 34 Z" fill={c.glare} />
      <Path d="M68 46.8 L71 46.8 L84 34.2 L81 34.2 Z" fill={c.glare} />
      <Path d="M106.5 48.6 L110.5 34 L138.5 32.3 L140.5 47.4 Z" fill={c.glass} />
      <Path d="M144.5 47.1 L142.5 32.1 L168.5 30.6 L178.5 45.6 Z" fill={c.glass} />
      <Path d="M114 48 L118 48 L122 33.6 L119 33.7 Z" fill={c.glare} />
      <Path d="M150 46.6 L153 46.5 L150.5 31.8 L148 31.9 Z" fill={c.glare} />
      <Path d="M48 47.2 L62 44.6" stroke="#141218" strokeWidth="1.2" strokeLinecap="round" />
      <Path d="M70 47.6 L84 45.1" stroke="#141218" strokeWidth="1.2" strokeLinecap="round" />
      <Path d="M16 60 L36 49 L100 50 L86 62 Z" fill={c.top} stroke={c.edge} strokeWidth="0.8" />
      <Path d="M43.5 59.6 L51 59.8 L64.5 49.5 L58 49.4 Z" fill={c.stripe} />
      <Path d="M55 59.9 L62.5 60.1 L75.5 49.7 L69 49.6 Z" fill={c.stripe} />
      <Path
        d="M86 62 L100 50 L204 44 L206 82 L88 95 Z"
        fill={c.body}
        stroke={c.edge}
        strokeWidth="0.8"
      />
      <Path d="M88 91 L206 78.6 L206 82 L88 95 Z" fill={c.shade} />
      <Path d="M88 78.5 L205 71 L205 74 L88 81.5 Z" fill={c.stripe} />
      <Path d="M88 73.8 L205 66.4 L205 68 L88 75.4 Z" fill={c.chrome} />
      <Path d="M106 50.6 L106 93" stroke={c.shade} strokeWidth="1.4" />
      <Path d="M142 48.2 L142 89.4" stroke={c.shade} strokeWidth="1.4" />
      <Path d="M176.5 46.2 L176.5 85.6" stroke={c.shade} strokeWidth="1.4" />
      <Rect x="127" y="55.4" width="8.5" height="2.2" rx="1.1" fill={c.chrome} />
      <Rect x="162.5" y="53.2" width="8.5" height="2.2" rx="1.1" fill={c.chrome} />
      <Path d="M97 44 L103.5 43 L103.5 47.2 L98 48.2 Z" fill={c.shade} />
      <Path d="M199 47.2 L205 46.8 L205.3 57 L199.3 57.4 Z" fill={c.tail} />
      <Path d="M194 79.6 L207 78.2 L207 81.6 L194 83 Z" fill={c.chrome} />
      <Path d="M97 94.5 A15 16 0 0 1 127 91.6 Z" fill={c.shade} />
      <Path d="M171 87.6 A13 14.5 0 0 1 197 85.4 Z" fill={c.shade} />
      <Path d="M16 60 L86 62 L88 95 L18 93 Z" fill={c.front} stroke={c.edge} strokeWidth="0.8" />
      <Path d="M86 62 L88 95" stroke={c.shade} strokeWidth="1" />
      <Path
        d="M21 65.6 L83 67.2 L83.4 80.2 L21.2 78.6 Z"
        fill="#1A1820"
        stroke={c.chrome}
        strokeWidth="1.4"
      />
      <Path d="M24 69.6 L80.6 71" stroke={c.chrome} strokeWidth="0.7" />
      <Path d="M24 74.2 L80.8 75.6" stroke={c.chrome} strokeWidth="0.7" />
      <Path d="M44.5 67 L44.5 79.4" stroke={c.chrome} strokeWidth="0.7" />
      <Path d="M59.5 67.4 L59.6 79.8" stroke={c.chrome} strokeWidth="0.7" />
      <Circle cx="28.4" cy="72.2" r="4.7" fill={c.light} stroke={c.chrome} strokeWidth="1.3" />
      <Circle cx="38.6" cy="72.5" r="4.7" fill={c.light} stroke={c.chrome} strokeWidth="1.3" />
      <Circle cx="66" cy="73.2" r="4.7" fill={c.light} stroke={c.chrome} strokeWidth="1.3" />
      <Circle cx="76.2" cy="73.5" r="4.7" fill={c.light} stroke={c.chrome} strokeWidth="1.3" />
      <Circle cx="27.4" cy="71.2" r="1.4" fill="rgba(255,255,255,0.85)" />
      <Circle cx="37.6" cy="71.5" r="1.4" fill="rgba(255,255,255,0.85)" />
      <Circle cx="65" cy="72.2" r="1.4" fill="rgba(255,255,255,0.85)" />
      <Circle cx="75.2" cy="72.5" r="1.4" fill="rgba(255,255,255,0.85)" />
      <Rect x="22" y="81" width="7" height="2.8" rx="1" fill="#FFB020" />
      <Rect x="76.5" y="82.4" width="6.5" height="2.8" rx="1" fill="#FFB020" />
      <Path d="M16.5 88.6 L88 90.6 L88 95 L18 93 Z" fill={c.shade} />
      <Path d="M13 84 L88 86 L88 90.6 L13 88.6 Z" fill={c.chrome} />
      <Path d="M88 86 L100.5 84.8 L100.5 89.2 L88 90.6 Z" fill={c.chrome} />
      <Rect
        x="42.5"
        y="84.6"
        width="19"
        height="6.4"
        rx="1"
        fill="#F4F3F7"
        stroke="#8E8578"
        strokeWidth="0.6"
      />
      <Ellipse cx="112" cy="94" rx="10" ry="13" fill="#141218" />
      <Ellipse cx="112.6" cy="94" rx="6.2" ry="8.2" fill={c.chrome} />
      <Ellipse
        cx="112.6"
        cy="94"
        rx="3.6"
        ry="4.8"
        fill="none"
        stroke="#141218"
        strokeWidth="0.8"
        strokeOpacity="0.4"
      />
      <Ellipse cx="112.6" cy="94" rx="1.9" ry="2.6" fill="#141218" />
      <Ellipse cx="184" cy="87" rx="9" ry="12" fill="#141218" />
      <Ellipse cx="184.5" cy="87" rx="5.6" ry="7.6" fill={c.chrome} />
      <Ellipse
        cx="184.5"
        cy="87"
        rx="3.2"
        ry="4.4"
        fill="none"
        stroke="#141218"
        strokeWidth="0.8"
        strokeOpacity="0.4"
      />
      <Ellipse cx="184.5" cy="87" rx="1.7" ry="2.4" fill="#141218" />
    </Svg>
  );
}
