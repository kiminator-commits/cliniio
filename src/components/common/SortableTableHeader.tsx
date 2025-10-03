import React from 'react';

interface SortableTableHeaderProps {
  label: string;
  field: string;
  activeField: string | null;
  direction: 'asc' | 'desc';
  onSort: (field: string) => void;
  scope?: string;
}

const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
  label,
  field,
  activeField,
  direction,
  onSort,
  scope,
}) => {
  const handleSort = () => {
    onSort(field);
  };

  const renderIndicator = () => {
    if (activeField !== field) return null;
    return direction === 'asc' ? ' 🔼' : ' 🔽';
  };

  return (
    <th scope={scope} style={{ cursor: 'pointer' }} onClick={handleSort}>
      {label}
      {renderIndicator()}
    </th>
  );
};

export default SortableTableHeader;
