import { useRef, useState, useEffect } from 'react';

export const useLoadingProtection = (timeout = 10000) => {
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimeout = useRef<NodeJS.Timeout | null>(null);

  const startLoading = () => {
    setIsLoading(true);
    loadingTimeout.current = setTimeout(() => {
      setIsLoading(false);
    }, timeout);
  };

  const stopLoading = () => {
    if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
    setIsLoading(false);
  };

  useEffect(() => {
    return () => {
      if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
    };
  }, []);

  return { isLoading, startLoading, stopLoading };
};
