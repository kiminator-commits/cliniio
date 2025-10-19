import { createContext, useContext } from 'react';

/**
 * Incident Context for managing current incident information
 * Provides incidentId for BI and incident operations
 */
const IncidentContext = createContext<{ incidentId: string | null }>({ incidentId: null });

export const useIncidentContext = () => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidentContext must be used within an IncidentProvider');
  }
  return context;
};

/**
 * Hook to get current incident ID from session storage
 * Falls back to context if available
 */
export const useCurrentIncidentId = (): string | null => {
  try {
    return sessionStorage.getItem('currentIncidentId') || null;
  } catch (error) {
    console.warn('Failed to get current incident ID from session storage:', error);
    return null;
  }
};
