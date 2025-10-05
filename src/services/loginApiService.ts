import { useMutation } from '@tanstack/react-query';
import { SecureAuthService } from './secureAuthService';

// Create a dedicated login service to handle API calls
export const loginService = async (email: string, password: string) => {
  // Use the secure authentication service
  const authService = new SecureAuthService();
  const response = await authService.secureLogin({
    email,
    password,
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
};

export const useLoginService = () => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      loginService(credentials.email, credentials.password),
  });

  return { login: mutate, isLoading: isPending, error };
};
