import { useEffect, useRef, useCallback } from 'react';
import { refreshSession, logout } from '@/services/authService';
import { useLoginStore } from '@/store/useLoginStore';
import { logger } from '@/services/loggerService';

export function useAuthSession() {
  const { token, clear, setToken } = useLoginStore();
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);

  // ✅ Logout wrapper
  const handleLogout = useCallback(async () => {
    try {
      if (token) await logout(token);
    } catch (err) {
      logger.warn('Server-side logout failed', err);
    } finally {
      clear();
      if (refreshTimer.current) clearInterval(refreshTimer.current);
      logger.info('Local session cleared');
    }
  }, [token, clear]);

  // ✅ Manual refresh
  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const data = await refreshSession(token);
      if (data?.token) {
        setToken(data.token, true);
        logger.info('Session refreshed successfully');
      }
    } catch (err) {
      logger.error('Session refresh failed', err);
      await handleLogout();
    }
  }, [token, setToken, handleLogout]);

  // ✅ Auto-refresh every 25 min
  useEffect(() => {
    if (!token) return undefined;
    refreshTimer.current = setInterval(() => {
      refresh();
    }, 25 * 60 * 1000);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [token, refresh]);

  return { refresh, logout: handleLogout };
}
