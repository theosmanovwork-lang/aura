// Import the one icon set directly: the package root would bundle the fonts of every set.
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { iconSizes, useColors } from '../theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

type IconProps = Readonly<{
  name: IconName;
  size?: number;
  color?: string;
  testID?: string;
}>;

/** A decorative icon: screen readers skip it, the button or tab around it carries the name. */
export function Icon({ name, size = iconSizes.md, color, testID }: IconProps) {
  const colors = useColors();
  return (
    <Ionicons
      name={name}
      size={size}
      color={color ?? colors.text}
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
