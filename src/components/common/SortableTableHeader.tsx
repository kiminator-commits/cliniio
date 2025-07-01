import React from 'react';

interface SortableTableHeaderProps {
  label: string;
  field: string;
  activeField: string | null;
  direction: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
  label,
  field,
  activeField,
  direction,
  onSort,
}) => {
  const handleSort = () => {
    onSort(field);
  };

  const renderIndicator = () => {
    if (activeField !== field) return null;
    return direction === 'asc' ? ' 🔼' : ' 🔽';
  };

  return (
    <th style={{ cursor: 'pointer' }} onClick={handleSort}>
      {label}
      {renderIndicator()}
    </th>
  );
};

export default SortableTableHeader;
