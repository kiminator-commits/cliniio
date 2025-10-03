import { useEffect, useCallback } from 'react';
import { SecureAuthService } from '@/services/secureAuthService';
import { logAudit } from '@/services/auditService';
import { useLoginStore } from '@/stores/useLoginStore';

export const useLoginForm = () => {
  // Initialize secure token storage
  const initializeSecureStorage = useCallback(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedExpiry = localStorage.getItem('sessionExpiry');
    
    if (storedToken && storedExpiry && new Date(storedExpiry) > new Date()) {
      useLoginStore.getState().setAuthToken(storedToken, storedExpiry);
      useLoginStore.getState().setSessionExpiry(storedExpiry);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeSecureStorage();
  }, [initializeSecureStorage]);

  // Secure session refresh with enhanced error handling
  useEffect(() => {
    const interval = setInterval(
      async () => {
        try {
          const authService = new SecureAuthService();
          const refreshed = await authService.refreshToken();
          
          if (refreshed) {
            // Log successful refresh for security monitoring
            console.log('[AUTH] Session refreshed successfully');
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (err) {
          console.error('[AUTH] Session refresh failed:', err);
          
          // Clear invalid session and logout
          useLoginStore.getState().reset();
          const authService = new SecureAuthService();
          await authService.logout();
        }
      },
      14 * 60 * 1000 // Refresh every 14 minutes
    );
    
    return () => clearInterval(interval);
  }, []);

  // Get store selectors and actions
  const formData = useLoginStore((state) => state.formData);
  const errors = useLoginStore((state) => state.errors);
  const loading = useLoginStore((state) => state.loading);
  const setField = useLoginStore((state) => state.setField);

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setField(field, value);
    };

  const handleSubmit = useCallback(async (credentials: {
    username: string;
    password: string;
  }): Promise<void> => {
    const startTime = performance.now();
    
    try {
      // Set loading state
      useLoginStore.getState().setLoading(true);
      
      // Sanitize inputs for security
      const sanitizedEmail = credentials.username.trim().toLowerCase();
      const sanitizedPassword = credentials.password;
      
      // Validate inputs
      if (!sanitizedEmail || !sanitizedPassword) {
        throw new Error('Email and password are required');
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
        throw new Error('Please enter a valid email address');
      }
      
      if (sanitizedPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Attempt secure login
      const authService = new SecureAuthService();
      const response = await authService.secureLogin({
        email: sanitizedEmail,
        password: sanitizedPassword,
      });
      
      if (response.success && response.data) {
        // Store tokens securely
        const expiry = new Date(Date.now() + response.data.expiresIn * 1000).toISOString();
        useLoginStore.getState().setAuthToken(response.data.accessToken, expiry);
      } else {
        throw new Error(response.error || 'Authentication failed');
      }
      
      // Log successful authentication
      await logAudit(sanitizedEmail, true);
      
      const loginTime = performance.now() - startTime;
      console.log(`[AUTH] Login successful for ${sanitizedEmail} in ${loginTime.toFixed(2)}ms`);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      // Log failed authentication
      await logAudit(credentials.username, false);
      
      const loginTime = performance.now() - startTime;
      console.error(`[AUTH] Login failed for ${credentials.username} after ${loginTime.toFixed(2)}ms:`, errorMessage);
      
      // Set error state
      useLoginStore.getState().setErrors({ 
        general: errorMessage 
      });
      
      throw new Error(errorMessage);
    } finally {
      // Clear loading state
      useLoginStore.getState().setLoading(false);
    }
  }, []);

  // Secure logout function
  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      console.log('[AUTH] Starting secure logout...');
      
      // Call secure logout
      await logout();
      
      // Clear all local state
      useLoginStore.getState().reset();
      
      console.log('[AUTH] Logout completed successfully');
    } catch (error) {
      console.error('[AUTH] Logout error:', error);
      
      // Force clear local state even if server logout fails
      useLoginStore.getState().reset();
      
      throw error;
    }
  }, []);

  // Check if user is authenticated
  const isAuthenticated = useCallback((): boolean => {
    const authToken = useLoginStore.getState().authToken;
    const tokenExpiry = useLoginStore.getState().tokenExpiry;
    
    if (!authToken || !tokenExpiry) {
      return false;
    }
    
    return new Date(tokenExpiry) > new Date();
  }, []);

  // Get current user info
  const getCurrentUser = useCallback(() => {
    const authToken = useLoginStore.getState().authToken;
    const tokenExpiry = useLoginStore.getState().tokenExpiry;
    
    if (!authToken || !tokenExpiry || new Date(tokenExpiry) <= new Date()) {
      return null;
    }
    
    // In a real implementation, you might decode the JWT token here
    // For now, return basic info
    return {
      token: authToken,
      expiresAt: tokenExpiry,
    };
  }, []);

  return { 
    formData, 
    errors, 
    loading, 
    handleChange, 
    handleSubmit,
    handleLogout,
    isAuthenticated,
    getCurrentUser,
  };
};
