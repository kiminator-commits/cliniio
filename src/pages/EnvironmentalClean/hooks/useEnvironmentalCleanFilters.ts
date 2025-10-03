import { useCallback, useState, useMemo } from 'react';
import { Room, RoomStatusType } from '../models';

export function useEnvironmentalCleanFilters(items: Room[] = []) {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<'all' | RoomStatusType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesTerm =
        searchTerm === '' ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = status === 'all' || item.status === status;
      return matchesTerm && matchesStatus;
    });
  }, [items, searchTerm, status]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  const onSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const onStatusChange = useCallback((value: 'all' | RoomStatusType) => {
    setStatus(value);
    setCurrentPage(1);
  }, []);

  const onPageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    searchTerm,
    status,
    paginatedItems,
    onSearchChange,
    onStatusChange,
    currentPage,
    totalPages,
    onPageChange,
  };
}
