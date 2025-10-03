import React from 'react';

type HomePageState = 'loading' | 'error' | 'empty' | 'ready';

interface UseHomePageStateReturn {
  state: HomePageState;
  component: React.ReactNode | null;
}

export function useHomePageState(): UseHomePageStateReturn {
  // Always return ready state to let the parent render the normal layout with Tasks and Analytics containers
  return {
    state: 'ready',
    component: null,
  };
}
