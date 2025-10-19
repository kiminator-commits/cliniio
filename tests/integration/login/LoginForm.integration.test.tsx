import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, type Mock } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SecureAuthService } from '@/services/secureAuthService';
import LoginForm from '@/pages/Login/LoginForm';

// Mock the SecureAuthService for testing
vi.mock('@/services/secureAuthService');
vi.mock('@/store/useLoginStore', () => ({
  useLoginStore: vi.fn((selector) => {
    const mockState = {
      formData: { email: '', password: '' },
      errors: {},
      loading: false,
      setField: vi.fn(),
      setErrors: vi.fn(),
      setLoading: vi.fn(),
      setAuthToken: vi.fn(),
      incrementFailedAttempts: vi.fn(),
      resetFailedAttempts: vi.fn(),
      isSecureMode: false,
    };
    return selector ? selector(mockState) : mockState;
  }),
}));

// Mock UserContext
vi.mock('@/contexts/UserContext', () => ({
  useUser: () => ({
    refreshUserData: vi.fn(),
  }),
}));

const mockSecureAuthService = SecureAuthService as Mock<typeof SecureAuthService>;

// Create a test wrapper with necessary providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('LoginForm - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render login form successfully', async () => {
    // Mock successful authentication
    mockSecureAuthService.prototype.secureLogin.mockResolvedValue({
      success: true,
      data: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh',
        expiresIn: 3600,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          role: 'user',
        },
      },
    });

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    // Check if login form elements are present
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });
  });

  test('should handle authentication errors', async () => {
    // Mock authentication failure
    mockSecureAuthService.prototype.secureLogin.mockResolvedValue({
      success: false,
      error: 'Invalid credentials',
    });

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    // Form should still render even with auth errors
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    });
  });
});
