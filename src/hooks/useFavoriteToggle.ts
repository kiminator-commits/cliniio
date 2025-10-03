import { useCallback } from 'react';
import { toggleFavorite } from '@/utils/inventoryHelpers';

export function useFavoriteToggle(
  favorites: string[],
  setFavorites: (favs: string[]) => void
) {
  const handleToggleFavorite = useCallback(
    (toolId: string) => {
      const newFavorites = toggleFavorite(new Set(favorites), toolId);
      setFavorites(Array.from(newFavorites));
    },
    [favorites, setFavorites]
  );

  return {
    handleToggleFavorite,
  };
}
