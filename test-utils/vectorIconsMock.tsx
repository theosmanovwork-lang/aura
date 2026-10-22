import { Text, type TextProps } from 'react-native';

type IconProps = TextProps & { name: string; size?: number; color?: string };

/**
 * Stand-in for the icon font in tests: the real font needs the native asset loader, which
 * does not exist under Jest. It draws the icon name as text and keeps size and color.
 */
export default function Ionicons({ name, size, color, style, ...rest }: IconProps) {
  return (
    <Text {...rest} style={[{ fontSize: size, color }, style]}>
      {name}
    </Text>
  );
}
