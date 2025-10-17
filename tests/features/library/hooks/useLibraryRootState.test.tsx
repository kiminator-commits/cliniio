import { renderHook, act } from '@testing-library/react';
import { useLibraryRootState } from '@/features/library/hooks/useLibraryRootState';
import { describe, test, expect, it } from 'vitest';

describe('useLibraryRootState', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useLibraryRootState());
    expect(result.current.searchQuery).toBe('');
    expect(result.current.showFilters).toBe(false);
    expect(result.current.favorites instanceof Set).toBe(true);
  });

  it('should update searchQuery when setSearchQuery is called', () => {
    const { result } = renderHook(() => useLibraryRootState());
    act(() => {
      result.current.setSearchQuery('test');
    });
    expect(result.current.searchQuery).toBe('test');
  });
});
