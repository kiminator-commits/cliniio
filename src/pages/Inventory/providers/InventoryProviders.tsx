import React from 'react';

interface InventoryProvidersProps {
  children: React.ReactNode;
}

/**
 * Collapsed provider - components now access store directly
 */
export const InventoryProviders: React.FC<InventoryProvidersProps> = ({
  children,
}) => {
  return <>{children}</>;
};

export default InventoryProviders;
