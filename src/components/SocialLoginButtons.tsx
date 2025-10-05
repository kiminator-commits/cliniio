import React, { useState, useEffect } from 'react';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa6';
import { supabase } from '@/lib/supabaseClient';
import { generateSecureToken } from '@/utils/securityUtils';
import { isDevelopment } from '@/lib/getEnv';

const SocialLoginButtons = () => {
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [oauthState, setOauthState] = useState<string>('');

  // Generate OAuth state parameter for CSRF protection
  useEffect(() => {
    const state = generateSecureToken(32);
    setOauthState(state);
    // Store state in session storage for validation
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('oauth_state', state);
    }
  }, []);

  const handleOAuthLogin = async (provider: 'google' | 'microsoft') => {
    try {
      setIsLoading((prev) => ({ ...prev, [provider]: true }));

      // Validate OAuth state
      if (!oauthState) {
        throw new Error('OAuth state not initialized');
      }

      // Map provider names to Supabase OAuth providers
      const supabaseProvider = provider === 'microsoft' ? 'azure' : provider;

      // Generate PKCE code verifier and challenge
      const codeVerifier = generateSecureToken(128);
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Store code verifier for validation
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('oauth_code_verifier', codeVerifier);
        sessionStorage.setItem('oauth_provider', provider);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: supabaseProvider as 'google' | 'azure',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            // Add security parameters
            access_type: 'offline',
            prompt: 'consent',
            state: oauthState,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
          },
        },
      });

      if (error) {
        console.error(`OAuth login error with ${provider}:`, error);
        throw error;
      }

      if (isDevelopment()) {
        console.log(`[SECURITY] OAuth login initiated with ${provider}:`, {
          provider: supabaseProvider,
          state: oauthState,
          codeChallenge,
          timestamp: new Date().toISOString(),
        });
      }

      // The user will be redirected to the OAuth provider
      // No need to handle the redirect manually as Supabase handles it
    } catch (error) {
      console.error(`Failed to login with ${provider}:`, error);

      // Clear stored OAuth data on error
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('oauth_code_verifier');
        sessionStorage.removeItem('oauth_provider');
        sessionStorage.removeItem('oauth_state');
      }

      // Show user-friendly error message
      alert(`Failed to login with ${provider}. Please try again.`);
    } finally {
      setIsLoading((prev) => ({ ...prev, [provider]: false }));
    }
  };

  // Generate PKCE code challenge from verifier
  const generateCodeChallenge = async (verifier: string): Promise<string> => {
    try {
      // Convert verifier to Uint8Array
      const encoder = new TextEncoder();
      const data = encoder.encode(verifier);

      // Generate SHA-256 hash
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);

      // Convert hash to base64url
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashBase64 = btoa(String.fromCharCode(...hashArray));

      // Convert to base64url (replace + with -, / with _, remove =)
      return hashBase64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    } catch (error) {
      console.error('Failed to generate PKCE code challenge:', error);
      // Fallback to simple hash if crypto API is not available
      return verifier.substring(0, 43);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleOAuthLogin('google')}
          disabled={isLoading.google || !oauthState}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading.google ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          ) : (
            <FaGoogle className="h-4 w-4 text-red-500" />
          )}
          <span className="ml-2">Google</span>
        </button>

        <button
          type="button"
          onClick={() => handleOAuthLogin('microsoft')}
          disabled={isLoading.microsoft || !oauthState}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading.microsoft ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          ) : (
            <FaMicrosoft className="h-4 w-4 text-blue-500" />
          )}
          <span className="ml-2">Microsoft</span>
        </button>
      </div>
    </div>
  );
};

export default SocialLoginButtons;
