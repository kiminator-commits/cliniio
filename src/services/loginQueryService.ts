import { useMutation } from '@tanstack/react-query';
import { SecureAuthService } from './secureAuthService';
import { create } from 'zustand';
import { useState, useEffect } from 'react';

// Password visibility toggle hook
export const usePasswordVisibility = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  return { passwordVisible, togglePasswordVisibility };
};

// Simple validation function without external dependencies
export const validateForm = (data: { email: string; password: string }) => {
  const errors: string[] = [];

  // Email validation
  if (!data.email || data.email.trim() === '') {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  // Password validation
  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  return errors.length === 0 ? true : errors;
};

// Define login credentials type
interface LoginCredentials {
  email: string;
  password: string;
}

// Helper function to sanitize input
const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, '').trim();
};

// Define a login function for React Query
const loginMutation = async (credentials: LoginCredentials) => {
  // Sanitize user input
  const sanitizedEmail = sanitizeInput(credentials.email);
  const sanitizedPassword = sanitizeInput(credentials.password);

  // Use the secure authentication service
  const authService = new SecureAuthService();
  const response = await authService.secureLogin({
    email: sanitizedEmail,
    password: sanitizedPassword,
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

// Use React Query's useMutation for login
export const useLogin = () => {
  return useMutation({
    mutationFn: loginMutation,
  });
};

const loginWithRetry = async (credentials: LoginCredentials) => {
  try {
    // Sanitize user input
    const sanitizedEmail = sanitizeInput(credentials.email);
    const sanitizedPassword = sanitizeInput(credentials.password);

    const authService = new SecureAuthService();
    const response = await authService.secureLogin({
      email: sanitizedEmail,
      password: sanitizedPassword,
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
  } catch (err) {
    console.error(err);
    // Implement retry logic if needed
    throw new Error('Login failed, please try again.');
  }
};

export const useLoginWithRetry = () => {
  return useMutation({
    mutationFn: loginWithRetry,
    retry: 3, // Retry up to 3 times on failure
    onError: (error: Error) => {
      console.error('Error logging in:', error);
    },
  });
};

// Handle submit function with security measures
export const handleSubmit = async (
  e: React.FormEvent,
  formData: { email: string; password: string }
): Promise<void> => {
  e.preventDefault();
  const { email, password } = formData;
  try {
    await loginService(email, password);
    // Handle successful login
  } catch (err) {
    console.error(err);
    // Handle error
  }
};

// Centralized auth state with persistence
export const useAuthStore = create<{
  token: string | null;
  setAuthToken: (token: string) => void;
}>((set) => ({
  token: localStorage.getItem('authToken') || null,
  setAuthToken: (token: string) => {
    localStorage.setItem('authToken', token);
    set({ token });
  },
}));

// Rate limiting hook
export const useRateLimit = () => {
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);

  useEffect(() => {
    if (lockedUntil && new Date() < lockedUntil) {
      // User is locked out
      return;
    }
    if (lockedUntil && new Date() >= lockedUntil) {
      // Use setTimeout to avoid calling setState synchronously in effect
      setTimeout(() => {
        setAttempts(0);
        setLockedUntil(null);
      }, 0);
    }
  }, [lockedUntil]);

  const incrementAttempts = () => {
    if (attempts + 1 >= 5) {
      setLockedUntil(new Date(new Date().getTime() + 15 * 60 * 1000)); // Lock for 15 minutes
    } else {
      setAttempts(attempts + 1);
    }
  };

  return { attempts, lockedUntil, incrementAttempts };
};

const loginService = async (email: string, password: string) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};
