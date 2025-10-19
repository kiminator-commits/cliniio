import { logger } from '@/services/loggerService';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export async function login(email: string, password: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // ✅ Handle non-JSON responses safely
    const contentType = response?.headers?.get('content-type') ?? '';
    const data =
      contentType.includes('application/json')
        ? await response.json()
        : { message: await response.text() };

    if (!response?.ok) throw new Error(data.message || 'Login failed');
    
    // Check if we have a valid session/token in the response
    if (!data.token && !data.access_token) {
      throw new Error(data.message || 'No session returned from authentication');
    }
    
    return data;
  } catch (err: any) {
    clearTimeout(timeout);

    // ✅ Distinguish timeout aborts
    if (err.name === 'AbortError') throw new Error('Login request timed out');
    logger.error('Login failed', err);
    throw err;
  }
}

export async function logout(token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response?.ok) {
      throw new Error('Logout failed');
    }
    
    logger.info('Logout API called successfully');
  } catch (err) {
    logger.warn('Logout API call failed', err);
    throw err;
  }
}

export async function refreshSession(token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res?.ok) throw new Error('Token refresh failed');
    const data = await res.json();
    
    // Check if we have valid session data
    if (!data.token && !data.access_token) {
      throw new Error('No session returned from refresh');
    }
    
    return { ...data, refreshedAt: new Date().toISOString() };
  } catch (err) {
    logger.error('Session refresh failed', err);
    throw err;
  }
}

export async function validateToken(token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/validate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!res?.ok) {
      return { valid: false, error: 'Invalid token' };
    }
    
    const data = await res.json();
    return { valid: true, ...data };
  } catch (err) {
    logger.error('Token validation failed', err);
    return { valid: false, error: 'Token validation failed' };
  }
}
