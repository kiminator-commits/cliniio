import { useMutation, useQueryClient } from '@tanstack/react-query';
import { batchEnvironmentalCleanAction } from '../services/EnvironmentalCleanService';

/**
 * Hook to execute batch actions on multiple Environmental Clean items.
 * Uses `batchEnvironmentalCleanAction` API and invalidates the list cache on success.
 */
export function useEnvironmentalCleanBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, action }: { ids: string[]; action: string }) =>
      batchEnvironmentalCleanAction({ ids, action }),
    onSuccess: () => {
      // Invalidate environmentalCleans query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['environmentalCleans'] });
    },
  });
}
