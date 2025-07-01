import React from 'react';

interface InventoryLayoutProps {
  children: React.ReactNode;
}

const InventoryLayout: React.FC<InventoryLayoutProps> = ({ children }) => {
  return <div className="space-y-6">{children}</div>;
};

export default InventoryLayout;
