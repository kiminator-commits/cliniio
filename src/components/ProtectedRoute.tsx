import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { observabilityService } from '../services/observability/observabilityService';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!cancelled) {
          if (error || !user) {
            console.warn('⚠️ ProtectedRoute: blocked due to invalid session');
            setSessionValid(false);
            setLoading(false);
            await observabilityService.logSecurityEvent(
              'security.protected_route_blocked',
              'Blocked unauthenticated access attempt',
              { error: error?.message, hasUser: !!user }
            );
          } else {
            setSessionValid(true);
            setLoading(false);
          }
        }
      } catch (err: unknown) {
        console.error('❌ ProtectedRoute session validation failed:', err);
        if (!cancelled) {
          setSessionValid(false);
          setLoading(false);
          await observabilityService.logSecurityEvent(
            'security.protected_route_blocked',
            'Protected route validation failed',
            { error: err instanceof Error ? err.message : String(err) }
          );
        }
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return null;
  if (!sessionValid)
    return <Navigate to="/login" state={{ from: location }} replace />;

  return <>{children}</>;
};
