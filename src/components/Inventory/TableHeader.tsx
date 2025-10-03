import React from 'react';
import styles from './TableStyles.module.css';

interface TableHeaderProps {
  columns: string[];
  activeTab?: string;
}

const TableHeader: React.FC<TableHeaderProps> = React.memo(
  ({ columns, activeTab }) => {
    return (
      <thead className={styles.tableHeader}>
        <tr>
          {columns.map((col) => {
            // Hide category column for tools tab
            if (activeTab === 'tools' && col === 'category') {
              return null;
            }
            return (
              <th
                key={col}
                className={`${styles.tableHeaderCell} text-gray-500 inventory-table-header`}
                scope="col"
                aria-label={col.toLowerCase()}
                style={{ color: '#6b7280' }}
              >
                {col}
              </th>
            );
          })}
          <th
            className={`${styles.tableHeaderCell} text-gray-500 inventory-table-header`}
            scope="col"
            aria-label="Item actions"
            style={{ color: '#6b7280' }}
          >
            Actions
          </th>
        </tr>
      </thead>
    );
  }
);

TableHeader.displayName = 'TableHeader';

export default TableHeader;
