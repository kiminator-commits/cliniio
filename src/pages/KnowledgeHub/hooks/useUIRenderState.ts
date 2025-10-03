import { useMemo } from 'react';
import { ContentItem } from '../types';
import {
  UIStateService,
  UIState,
  RenderState,
} from '../services/uiStateService';

interface UseUIRenderStateProps {
  uiState: UIState;
  selectedCategory: string | null;
  categoryItems: ContentItem[];
}

export const useUIRenderState = ({
  uiState,
  selectedCategory,
  categoryItems,
}: UseUIRenderStateProps) => {
  const renderState = useMemo((): RenderState => {
    return UIStateService.determineRenderState(
      uiState,
      selectedCategory,
      categoryItems
    );
  }, [uiState, selectedCategory, categoryItems]);

  return renderState;
};
