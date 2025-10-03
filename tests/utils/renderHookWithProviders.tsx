import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

// Create a reusable QueryClient for testing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

// Wrapper for testing hooks with providers
export function renderHookWithProviders<T>(
  callback: () => T,
  options?: Parameters<typeof renderHook>[1]
) {
  return renderHook(callback, { wrapper: AllProviders, ...options });
}
