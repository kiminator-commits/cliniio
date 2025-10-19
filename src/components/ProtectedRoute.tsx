import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useLoginStore } from '@/store/useLoginStore';
import { logger } from '@/services/loggerService';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, clear } = useLoginStore();

  // ✅ Move reset/clear side effect out of render
  useEffect(() => {
    if (!token) {
      logger.info('No token found — triggering logout cleanup.');
      clear();
    }
  }, [token, clear]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
