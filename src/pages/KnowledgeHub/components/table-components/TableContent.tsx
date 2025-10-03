import React, { useMemo, Suspense } from 'react';
import { ContentItem } from '../../types';
import { EmptyState } from '../EmptyState';
import { TableLoadingFallback } from './TableLoadingFallback';

interface TableContentProps {
  category: string;
  items: ContentItem[];
  onStatusUpdate: (contentId: string, status: string) => Promise<boolean>;
  CoursesTable: React.ComponentType<{ items: ContentItem[] }>;
  LearningPathwaysTable: React.ComponentType<{ items: ContentItem[] }>;
  ProceduresTable: React.ComponentType<{ items: ContentItem[] }>;
  PoliciesTable: React.ComponentType<{ items: ContentItem[] }>;
}

export const TableContent: React.FC<TableContentProps> = ({
  category,
  items,
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
            <CoursesTable items={items} />
          </Suspense>
        );
      case 'Learning Pathways':
        return (
          <Suspense fallback={<TableLoadingFallback />}>
            <LearningPathwaysTable items={items} />
          </Suspense>
        );
      case 'Procedures':
        return (
          <Suspense fallback={<TableLoadingFallback />}>
            <ProceduresTable items={items} />
          </Suspense>
        );
      case 'Policies':
        return (
          <Suspense fallback={<TableLoadingFallback />}>
            <PoliciesTable items={items} />
          </Suspense>
        );
      default:
        return <EmptyState selectedCategory={category} />;
    }
  }, [
    category,
    items,
    CoursesTable,
    LearningPathwaysTable,
    ProceduresTable,
    PoliciesTable,
  ]);

  return renderTable;
};
