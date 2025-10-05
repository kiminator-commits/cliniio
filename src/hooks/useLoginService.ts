import { useMutation } from '@tanstack/react-query';
import { SecureAuthService } from '@/services/secureAuthService';
import { useLoginStore } from '@/stores/useLoginStore';
import { logAudit } from '@/services/auditService';

interface LoginFormData {
  email: string;
  password: string;
}

// Create a dedicated login service using React Query's useMutation hook
export const useLoginService = () => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: async (formData: LoginFormData) => {
      // Use secure authentication service
      const authService = new SecureAuthService();
      const response = await authService.secureLogin({
        email: formData.email,
        password: formData.password,
      });

      if (response.success && response.data) {
        return {
          token: response.data.accessToken,
          expiry: new Date(
            Date.now() + response.data.expiresIn * 1000
          ).toISOString(),
        };
      } else {
        throw new Error(response.error || 'Authentication failed');
      }
    },
    onSuccess: (data, variables: LoginFormData) => {
      // Handle success (store auth token, redirect, etc.)
      useLoginStore.getState().setAuthToken(data.token, data.expiry);
      logAudit(variables.email, true);
    },
    onError: (error: Error, variables: LoginFormData) => {
      // Handle error (show error messages, etc.)
      console.error('Login failed:', error.message);
      logAudit(variables.email, false);
    },
  });

  return { login: mutate, isLoading: isPending, error };
};
