import { createContext, useContext } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Operator Context for managing current operator information
 * Provides operatorId for BI and incident operations
 */
const OperatorContext = createContext<{ operatorId: string | null }>({ operatorId: null });

export const useOperatorContext = () => {
  const context = useContext(OperatorContext);
  if (!context) {
    throw new Error('useOperatorContext must be used within an OperatorProvider');
  }
  return context;
};

/**
 * Hook to get current operator ID from Supabase auth
 * Falls back to context if available
 */
export const useCurrentOperatorId = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.warn('Failed to get current operator ID:', error);
    return null;
  }
};
