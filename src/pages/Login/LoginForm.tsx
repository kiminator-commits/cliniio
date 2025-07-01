import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import { useUI } from '../../contexts/UIContext';
import { submitLoginForm } from '../../services/api';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { LOGIN_LABELS } from '../../constants/loginConstants';
import SocialLoginButtons from '../../components/SocialLoginButtons';
import './styles.css';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
  rememberDevice: boolean;
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { setLoading } = useUI();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
    rememberDevice: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await submitLoginForm(formData);
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Implement the forgot password logic here
    console.log('Forgot Password clicked');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-white focus:text-black"
        >
          Skip to main content
        </a>
        <div
          id="main-content"
          className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg"
        >
          <div>
            <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-500">
              Welcome to Cliniio
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">Sign in to your account</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <span id="emailHelp" className="sr-only">
                  Enter your email address.
                </span>
                <label htmlFor="email" className="sr-only">
                  {LOGIN_LABELS.email}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    aria-label="Email address"
                    aria-describedby="emailHelp"
                    className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-red-500 text-sm mt-2">Please enter a valid email address.</p>
              <div>
                <span id="passwordHelp" className="sr-only">
                  Enter your account password.
                </span>
                <label htmlFor="password" className="sr-only">
                  {LOGIN_LABELS.password}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    aria-label="Password"
                    aria-describedby="passwordHelp"
                    className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div className="text-green-500 text-sm mt-2">Password strength: Good</div>
                <p className="text-red-500 text-sm mt-2">Password must be at least 8 characters.</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    aria-label={LOGIN_LABELS.rememberMe}
                    className="h-4 w-4 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    {LOGIN_LABELS.rememberMe}
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="remember-device"
                    name="remember-device"
                    type="checkbox"
                    aria-label={LOGIN_LABELS.rememberDevice}
                    className="h-4 w-4 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-device" className="ml-2 block text-sm text-gray-900">
                    {LOGIN_LABELS.rememberDevice}
                  </label>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#2dd4bf] hover:bg-[#14b8a6] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-[#2dd4bf] transition-colors duration-200"
              >
                {LOGIN_LABELS.submit}
              </button>
            </div>

            <div className="text-center">
              <div className="mt-4 text-center flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-[#4ECDC4] hover:text-[#45b7af] cursor-pointer focus:outline-none"
                >
                  Forgot Password?
                </button>
                <span className="mx-2 text-gray-400">|</span>
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="text-sm text-[#4ECDC4] hover:text-[#45b7af] cursor-pointer focus:outline-none"
                >
                  Skip Login
                </button>
              </div>
            </div>
          </form>

          <SocialLoginButtons />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default memo(LoginForm);
