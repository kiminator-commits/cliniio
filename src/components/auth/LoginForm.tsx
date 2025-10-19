import React, { useState } from 'react';
import { login } from '@/services/authService';
import { useLoginStore } from '@/store/useLoginStore';
import { logger } from '@/services/loggerService';

export default function LoginForm() {
  const { setToken } = useLoginStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const isDev = import.meta.env.MODE !== 'production';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isOnline) return setError('Offline: please reconnect before logging in.');

    // ✅ Clear any stale error
    setError(null);

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res?.token) {
        setToken(res.token, true);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err: unknown) {
      logger.error('Login attempt failed', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  // ✅ Restrict mock login to development
  async function handleDevShortcut() {
    if (!isDev) return;
    logger.warn('Using dev-only mock login');
    setToken('mock-token', true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        disabled={loading || !isOnline}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        disabled={loading || !isOnline}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded"
      />
      <button
        type="submit"
        disabled={loading || !isOnline}
        className="bg-blue-500 text-white rounded p-2"
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      {isDev && (
        <button type="button" onClick={handleDevShortcut} className="text-xs text-gray-500 underline">
          Dev Login Shortcut
        </button>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {!isOnline && <p className="text-yellow-600 text-sm">You are offline.</p>}
    </form>
  );
}
