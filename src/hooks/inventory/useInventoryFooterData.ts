import { useMemo } from 'react';

interface UseInventoryFooterDataProps {
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
  currentTabCount: number;
  activeTab: string;
}

export const useInventoryFooterData = (props: UseInventoryFooterDataProps) => {
  const { itemsPerPage, setItemsPerPage, currentTabCount, activeTab } = props;

  // Memoized footer controls props
  const footerControlsProps = useMemo(
    () => ({
      itemsPerPage,
      setItemsPerPage,
      currentTabCount,
      activeTab,
    }),
    [itemsPerPage, setItemsPerPage, currentTabCount, activeTab]
  );

  return {
    footerControlsProps,
  };
};
