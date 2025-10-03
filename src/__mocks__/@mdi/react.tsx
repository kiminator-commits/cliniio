import React from 'react';
import { createIconMock } from '../../tests/__mocks__/mockRegistry';

// Use centralized mock for consistency
const iconMock = createIconMock();

const Icon: React.FC<{
  path: string;
  size?: number;
  color?: string;
  className?: string;
}> = ({ path, size = 1, color, className }) => {
  return iconMock.Icon({ path, size, color, className });
};

export { Icon };
export default Icon;
