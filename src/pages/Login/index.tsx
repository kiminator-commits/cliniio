import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { usePerformanceMonitoring } from '../../hooks/usePerformanceMonitoring';

// Lazy load the main login form
const LoginForm = lazy(() => import('./LoginForm'));

// Minimal loading fallback
const LoginFormFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-md w-full space-y-8">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-[#4ECDC4] rounded-full flex items-center justify-center">
          <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Loading...
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Preparing your secure login experience
        </p>
      </div>
    </div>
  </div>
);

const LoginPage: React.FC = () => {
  // Monitor login page performance
  usePerformanceMonitoring('Login Page');

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default LoginPage;
