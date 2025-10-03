import { useState } from 'react';
import { useSearchValidation } from './useSearchValidation';

interface User {
  id: string;
  [key: string]: unknown;
}

interface UseTableFiltersProps {
  validateAndSanitizeSearch: (
    query: string,
    userId: string
  ) => { isValid: boolean; error?: string };
  currentUser: User | null;
}

export const useTableFilters = ({
  validateAndSanitizeSearch,
  currentUser,
}: UseTableFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { searchError, validateSearch } = useSearchValidation({
    validateAndSanitizeSearch,
    currentUser,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    validateSearch(query);
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(e.target.value);
  };

  return {
    searchQuery,
    statusFilter,
    searchError,
    handleSearchChange,
    handleStatusFilterChange,
  };
};
