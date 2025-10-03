import React from 'react';
import { useInventoryPageSetup } from './hooks/useInventoryPageSetup';

export default function InventoryPage() {
  const { ProviderTree, PageContent } = useInventoryPageSetup();
  return (
    <ProviderTree>
      <PageContent />
    </ProviderTree>
  );
}
