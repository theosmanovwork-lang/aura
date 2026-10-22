// Import the one icon set directly: the package root would bundle the fonts of every set.
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { colors, iconSizes } from '../theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

type IconProps = Readonly<{
  name: IconName;
  size?: number;
  color?: string;
  testID?: string;
}>;

/** A decorative icon: screen readers skip it, the button or tab around it carries the name. */
export function Icon({ name, size = iconSizes.md, color = colors.text, testID }: IconProps) {
  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
