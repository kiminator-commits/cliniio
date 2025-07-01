import React from 'react';
import { HOME_UI_CONSTANTS } from '../../constants/homeUiConstants';
import { HOME_SECTION_TITLES } from '@/pages/Home/constants/homeConstants';

type EnvironmentalCleaningHeaderProps = {
  isDrawerOpen: boolean;
};

const EnvironmentalCleaningHeader: React.FC<EnvironmentalCleaningHeaderProps> = ({
  isDrawerOpen,
}) => {
  const marginLeft = isDrawerOpen
    ? HOME_UI_CONSTANTS.NAV_BAR_MARGIN_LEFT_DRAWER_OPEN
    : HOME_UI_CONSTANTS.NAV_BAR_MARGIN_LEFT_DRAWER_CLOSED;

  return (
    <div
      className="fixed top-0 left-0 w-full z-30 transition-all duration-300 bg-white shadow-md"
      style={{ marginLeft }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">{HOME_SECTION_TITLES.CLEANING}</h1>
      </div>
    </div>
  );
};

export default EnvironmentalCleaningHeader;
