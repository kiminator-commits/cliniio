import React from 'react';
import { TableSkeleton } from '@/components/ui/Skeleton';

export const TableLoadingFallback: React.FC = () => (
  <TableSkeleton rows={5} columns={4} />
);
