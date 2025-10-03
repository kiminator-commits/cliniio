import React from 'react';
import { ContentItem } from '../../types';
import { useSimplifiedKnowledgeHub } from '../../providers/SimplifiedKnowledgeHubProvider';
import { SimpleTable } from './SimpleTable';

interface ProceduresTableProps {
  items: ContentItem[];
  onStartContent?: (id: string) => void;
}

export const ProceduresTable: React.FC<ProceduresTableProps> = React.memo(
  ({ items, onStartContent }) => {
    const { deleteContent, updateContentStatus } = useSimplifiedKnowledgeHub();

    // Use provided items or empty array if no items
    const displayItems = items && items.length > 0 ? items : [];

    return (
      <SimpleTable
        items={displayItems}
        type="procedures"
        onDelete={deleteContent}
        onStatusUpdate={updateContentStatus}
        onStartContent={onStartContent}
      />
    );
  }
);

ProceduresTable.displayName = 'ProceduresTable';
