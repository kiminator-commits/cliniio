import React from 'react';
import { ContentItem } from '../../types';
import { useSimplifiedKnowledgeHub } from '../../providers/SimplifiedKnowledgeHubProvider';
import { SimpleTable } from './SimpleTable';

interface LearningPathwaysTableProps {
  items: ContentItem[];
  onStartContent?: (id: string) => void;
}

export const LearningPathwaysTable: React.FC<LearningPathwaysTableProps> =
  React.memo(({ items, onStartContent }) => {
    const { deleteContent, updateContentStatus } = useSimplifiedKnowledgeHub();

    // Use provided items or empty array if no items
    const displayItems = items.length > 0 ? items : [];

    return (
      <SimpleTable
        items={displayItems}
        type="learning-pathways"
        onDelete={deleteContent}
        onStatusUpdate={updateContentStatus}
        onStartContent={onStartContent}
      />
    );
  });

LearningPathwaysTable.displayName = 'LearningPathwaysTable';
