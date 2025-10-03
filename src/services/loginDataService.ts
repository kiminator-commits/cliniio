import { useQuery } from '@tanstack/react-query';

const fetchLoginData = async () => {
  const response = await fetch('/api/login');
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};

export const useLoginData = () => {
  return useQuery({
    queryKey: ['login'],
    queryFn: fetchLoginData,
    retry: 3, // Retry 3 times if it fails
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};
