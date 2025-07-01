import React from 'react';
import { Icon as MdiIcon } from '@mdi/react';

interface IconProps {
  path: string;
  size?: number;
  color?: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  path,
  size = 24,
  color = 'currentColor',
  className,
}) => <MdiIcon path={path} size={size} color={color} className={className} />;
