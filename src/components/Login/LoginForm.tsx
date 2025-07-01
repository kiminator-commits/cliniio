import React, { FormEvent, useRef } from 'react';

interface LoginFormProps {
  formState: {
    email: string;
    password: string;
    loading: boolean;
    error: string | null;
    showPassword: boolean;
    emailError: string;
    passwordError: string;
    feedbackMessage: string;
    feedbackType: 'success' | 'error' | '';
  };
  rememberMe: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberMeChange: (value: boolean) => void;
  onShowPasswordToggle: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  onForgotPassword: () => void;
  validateEmail: (value: string) => boolean;
  validatePassword: (value: string) => boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  formState,
  rememberMe,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onShowPasswordToggle,
  onSubmit,
  onForgotPassword,
  validateEmail,
  validatePassword,
}) => {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const loginButtonRef = useRef<HTMLButtonElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      if (document.activeElement === emailInputRef.current) {
        passwordInputRef.current?.focus();
      } else if (document.activeElement === passwordInputRef.current) {
        loginButtonRef.current?.click();
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" aria-label="Login form">
      {formState.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm sm:text-base">
          <span className="block sm:inline">{formState.error}</span>
        </div>
      )}

      {formState.feedbackMessage && (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          className={`mt-2 p-3 rounded-md text-sm ${
            formState.feedbackType === 'error'
              ? 'bg-red-100 border border-red-400 text-red-700'
              : 'bg-green-100 border border-green-400 text-green-700'
          }`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <span className="block sm:inline">{formState.feedbackMessage}</span>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span aria-hidden="true">*</span>
        </label>
        <input
          ref={emailInputRef}
          id="email"
          type="email"
          required
          value={formState.email}
          onChange={e => {
            onEmailChange(e.target.value);
            validateEmail(e.target.value);
          }}
          onBlur={e => validateEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`w-full px-3 py-2 border ${formState.emailError ? 'border-red-500' : 'border-gray-300'} bg-white text-black rounded focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] text-base`}
          placeholder="your@email.com"
          aria-label="Email address"
          aria-required="true"
          aria-invalid={!!formState.emailError}
          aria-describedby={formState.emailError ? 'email-error' : undefined}
          tabIndex={0}
        />
        {formState.emailError && (
          <p id="email-error" className="text-red-600 text-sm mt-1" role="alert" aria-live="polite">
            {formState.emailError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password <span aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <input
            ref={passwordInputRef}
            id="password"
            type={formState.showPassword ? 'text' : 'password'}
            required
            value={formState.password}
            onChange={e => {
              onPasswordChange(e.target.value);
              validatePassword(e.target.value);
            }}
            onBlur={e => validatePassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full px-3 py-2 border ${formState.passwordError ? 'border-red-500' : 'border-gray-300'} bg-white text-black rounded focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] text-base pr-10`}
            placeholder="••••••••"
            aria-label="Password"
            aria-required="true"
            aria-invalid={!!formState.passwordError}
            aria-describedby={formState.passwordError ? 'password-error' : undefined}
            tabIndex={0}
          />
          <button
            type="button"
            onClick={onShowPasswordToggle}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] rounded p-1"
            aria-label={formState.showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {formState.showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {formState.passwordError && (
          <p
            id="password-error"
            className="text-red-600 text-sm mt-1"
            role="alert"
            aria-live="polite"
          >
            {formState.passwordError}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id="rememberMe"
          checked={rememberMe}
          onChange={() => onRememberMeChange(!rememberMe)}
          className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
        />
        <label htmlFor="rememberMe" className="text-sm text-gray-700">
          Stay signed in
        </label>
      </div>

      <div>
        <button
          ref={loginButtonRef}
          type="submit"
          disabled={formState.loading}
          className="w-full bg-[#4ECDC4] text-white py-2.5 px-4 rounded hover:bg-[#3dbeb5] transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4] focus:ring-offset-white disabled:opacity-50"
          aria-busy={formState.loading}
          aria-live="polite"
        >
          {formState.loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 01-8 8z"
                />
              </svg>
              Logging in...
            </span>
          ) : (
            'Login'
          )}
        </button>
      </div>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-teal-600 hover:underline focus:outline-none"
        >
          Forgot Password?
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
