import React from 'react';
import { SharedLayout } from '../../Layout/SharedLayout';
import InventoryInsightsCard from '../analytics/InventoryInsightsCard';
import CategoriesCard from '../analytics/CategoriesCard';
import { TabType } from '../../../pages/Inventory/types';
import { useCentralizedInventoryData } from '@/hooks/useCentralizedInventoryData';
import { useUser } from '@/contexts/UserContext'; // Update import to use useUser

interface InventoryLayoutProps {
  children: React.ReactNode;
  onCategoryChange?: (tab: TabType) => void;
}

const InventoryLayout: React.FC<InventoryLayoutProps> = ({
  children,
  onCategoryChange = () => {},
}) => {
  const { currentUser } = useUser(); // Get authentication state from useUser
  const centralizedData = useCentralizedInventoryData();
  const { inventoryData, suppliesData, equipmentData, officeHardwareData } =
    centralizedData;

  // Don't render inventory-specific content if user is not authenticated
  if (!currentUser) {
    return <>{children}</>;
  }

  return (
    <SharedLayout>
      <div className="inventory-page">
        <div className="inventory-content">
          {/* Left Sidebar */}
          <div className="inventory-sidebar">
            <InventoryInsightsCard
              data={{
                tools: inventoryData,
                supplies: suppliesData,
                equipment: equipmentData,
                officeHardware: officeHardwareData,
              }}
            />
            <CategoriesCard onCategoryChange={onCategoryChange} />
          </div>

          {/* Main Content Area */}
          <div className="inventory-main">{children}</div>
        </div>
      </div>
    </SharedLayout>
  );
};

export default InventoryLayout;
