import React, { useMemo, Suspense } from 'react';
import { ContentItem } from '../../types';
import { EmptyState } from '../EmptyState';
import { TableLoadingFallback } from './TableLoadingFallback';

interface TableContentProps {
  category: string;
  items: ContentItem[];
  onStatusUpdate: (contentId: string, status: string) => Promise<boolean>;
  onStartContent?: (contentId: string) => void;
  CoursesTable: React.ComponentType<{
    items: ContentItem[];
    onStartContent?: (id: string) => void;
  }>;
  LearningPathwaysTable: React.ComponentType<{
    items: ContentItem[];
    onStartContent?: (id: string) => void;
  }>;
  ProceduresTable: React.ComponentType<{
    items: ContentItem[];
    onStartContent?: (id: string) => void;
  }>;
  PoliciesTable: React.ComponentType<{
    items: ContentItem[];
    onStartContent?: (id: string) => void;
  }>;
}

export const TableContent: React.FC<TableContentProps> = ({
  category,
  items,
  onStartContent,
  CoursesTable,
  LearningPathwaysTable,
  ProceduresTable,
  PoliciesTable,
}) => {
  const renderTable = useMemo(() => {
    switch (category) {
      case 'Courses':
        return (
          <Suspense fallback={<TableLoadingFallback />}>
            <CoursesTable items={items} onStartContent={onStartContent} />
          </Suspense>
        );
      case 'Learning Pathways':
        return (
          <Suspense fallback={<TableLoadingFallback />}>
            <LearningPathwaysTable
              items={items}
              onStartContent={onStartContent}
            />
          </Suspense>
        );
      case 'Procedures':
        return (
          <Suspense fallback={<TableLoadingFallback />}>
            <ProceduresTable items={items} onStartContent={onStartContent} />
          </Suspense>
        );
      case 'Policies':
        return (
          <Suspense fallback={<TableLoadingFallback />}>
            <PoliciesTable items={items} onStartContent={onStartContent} />
          </Suspense>
        );
      default:
        return <EmptyState selectedCategory={category} />;
    }
  }, [
    category,
    items,
    onStartContent,
    CoursesTable,
    LearningPathwaysTable,
    ProceduresTable,
    PoliciesTable,
  ]);

  return renderTable;
};
