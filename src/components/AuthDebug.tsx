import React from 'react';
import { useLoginStore } from '@/stores/useLoginStore';

const AuthDebug: React.FC = () => {
  const authToken = useLoginStore((state) => state.authToken);
  const tokenExpiry = useLoginStore((state) => state.tokenExpiry);
  const reset = useLoginStore((state) => state.reset);

  const isTokenExpired = tokenExpiry && new Date(tokenExpiry) < new Date();
  const isAuthenticated = !!authToken && !isTokenExpired;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-xs">
      <h4 className="font-bold mb-2">Auth Debug</h4>
      <div>Token: {authToken ? 'Present' : 'Missing'}</div>
      <div>Expired: {isTokenExpired ? 'Yes' : 'No'}</div>
      <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      <div>
        Expiry: {tokenExpiry ? new Date(tokenExpiry).toLocaleString() : 'None'}
      </div>
      <button
        onClick={reset}
        className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
      >
        Clear Auth
      </button>
    </div>
  );
};

export default AuthDebug;
