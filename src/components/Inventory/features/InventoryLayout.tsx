import React from 'react';
import { PageLayout } from '../../Layout/PageLayout';
import InventoryInsightsCard from '../analytics/InventoryInsightsCard';
import CategoriesCard from '../analytics/CategoriesCard';
import { TabType } from '../../../pages/Inventory/types';

interface InventoryLayoutProps {
  children: React.ReactNode;
  onCategoryChange?: (tab: TabType) => void;
}

const InventoryLayout: React.FC<InventoryLayoutProps> = ({
  children,
  onCategoryChange = () => {},
}) => {
  return (
    <PageLayout>
      <div className="inventory-page">
        <div className="inventory-content">
          {/* Left Sidebar */}
          <div className="inventory-sidebar">
            <InventoryInsightsCard
              data={{
                tools: [],
                supplies: [],
                equipment: [],
                officeHardware: [],
              }}
            />
            <CategoriesCard onCategoryChange={onCategoryChange} />
          </div>

          {/* Main Content Area */}
          <div className="inventory-main">{children}</div>
        </div>
      </div>
    </PageLayout>
  );
};

export default InventoryLayout;
