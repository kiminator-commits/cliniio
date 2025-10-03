import { SecureAuthService } from './secureAuthService';

export const login = async (
  email: string,
  password: string
): Promise<{ token: string }> => {
  // Use the secure authentication service
  const authService = new SecureAuthService();
  const response = await authService.secureLogin({
    email,
    password,
  });

  if (response.success && response.data) {
    return {
      token: response.data.accessToken,
    };
  } else {
    throw new Error(response.error || 'Authentication failed');
  }
};
