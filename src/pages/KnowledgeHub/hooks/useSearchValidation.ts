import { useState } from 'react';

interface User {
  id: string;
  [key: string]: unknown;
}

interface UseSearchValidationProps {
  validateAndSanitizeSearch: (
    query: string,
    userId: string
  ) => { isValid: boolean; error?: string };
  currentUser: User | null;
}

export const useSearchValidation = ({
  validateAndSanitizeSearch,
  currentUser,
}: UseSearchValidationProps) => {
  const [searchError, setSearchError] = useState<string | null>(null);

  const validateSearch = (query: string) => {
    if (!currentUser) {
      setSearchError('Authentication required');
      return;
    }

    if (query.trim()) {
      const validation = validateAndSanitizeSearch(query, currentUser.id);
      if (!validation.isValid) {
        setSearchError(validation.error || 'Invalid search query');
        return;
      }
    }

    setSearchError(null);
  };

  return {
    searchError,
    validateSearch,
  };
};
