import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useLoginStore } from '@/store/useLoginStore';
import { facilityConfigService } from '@/services/facilityConfigService';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthToken, setSessionExpiry } = useLoginStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Validate OAuth state parameter for CSRF protection
        const urlParams = new URLSearchParams(window.location.search);
        const stateParam = urlParams.get('state');
        const storedState = sessionStorage.getItem('oauth_state');

        if (stateParam && storedState && stateParam !== storedState) {
          console.error('OAuth state mismatch - possible CSRF attack');
          navigate('/login?error=invalid_state');
          return;
        }

        // Get the session from the URL hash/fragment
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login?error=auth_failed');
          return;
        }

        if (data.session) {
          // Successfully authenticated via OAuth
          console.log(
            'OAuth authentication successful, setting up user session'
          );

          // Set the auth token and session expiry in the store
          setAuthToken(
            data.session.access_token,
            data.session.expires_at
              ? new Date(data.session.expires_at * 1000).toISOString()
              : '',
            true // OAuth logins should be remembered by default
          );
          setSessionExpiry(
            data.session.expires_at
              ? new Date(data.session.expires_at * 1000).toISOString()
              : ''
          );

          // Store in localStorage for persistence (OAuth logins are remembered by default)
          localStorage.setItem('authToken', data.session.access_token);
          localStorage.setItem(
            'sessionExpiry',
            data.session.expires_at
              ? new Date(data.session.expires_at * 1000).toISOString()
              : ''
          );
          localStorage.setItem(
            'currentUser',
            JSON.stringify(data.session.user)
          );

          // Get or create user profile
          if (data.session?.user) {
            try {
              // Determine OAuth provider from user metadata or app metadata
              const provider =
                data.session.user.app_metadata?.provider || 'unknown';
              console.log('OAuth provider detected:', provider);

              // Check if user profile exists
              const { data: existingProfile, error: profileError } =
                await supabase
                  .from('users')
                  .select('*')
                  .eq('id', data.session.user.id)
                  .single();

              if (profileError && profileError.code !== 'PGRST116') {
                console.warn('Error checking user profile:', profileError);
              }

              if (!existingProfile) {
                // Create new user profile for OAuth user
                const fullName =
                  data.session.user.user_metadata?.full_name ||
                  data.session.user.user_metadata?.name ||
                  data.session.user.user_metadata?.display_name ||
                  '';

                const nameParts = fullName.trim().split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                const userProfile = {
                  id: data.session.user.id,
                  email: data.session.user.email,
                  first_name: firstName,
                  last_name: lastName,
                  role: 'user',
                  facility_id: facilityConfigService.getDefaultFacilityId(), // Use configured default facility
                  avatar_url:
                    data.session.user.user_metadata?.avatar_url ||
                    data.session.user.user_metadata?.picture ||
                    null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };

                const { error: createError } = await supabase
                  .from('users')
                  .insert(userProfile);

                if (createError) {
                  console.warn('Failed to create user profile:', createError);
                } else {
                  console.log(
                    'Created new user profile for OAuth user:',
                    userProfile
                  );
                }
              } else {
                // Update existing profile with latest OAuth data
                const fullName =
                  data.session.user.user_metadata?.full_name ||
                  data.session.user.user_metadata?.name ||
                  data.session.user.user_metadata?.display_name ||
                  `${existingProfile.first_name || ''} ${existingProfile.last_name || ''}`.trim();

                const nameParts = fullName.trim().split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                const updateData = {
                  email: data.session.user.email,
                  first_name: firstName,
                  last_name: lastName,
                  avatar_url:
                    data.session.user.user_metadata?.avatar_url ||
                    data.session.user.user_metadata?.picture ||
                    existingProfile.avatar_url,
                  provider: provider,
                  updated_at: new Date().toISOString(),
                };

                const { error: updateError } = await supabase
                  .from('users')
                  .update(updateData)
                  .eq('id', data.session.user.id);

                if (updateError) {
                  console.warn('Failed to update user profile:', updateError);
                } else {
                  console.log('Updated existing user profile:', updateData);
                }
              }
            } catch (profileError) {
              console.warn('Error handling user profile:', profileError);
              // Don't fail the login if profile creation fails
            }
          }

          // Clean up OAuth session storage
          sessionStorage.removeItem('oauth_state');
          sessionStorage.removeItem('oauth_code_verifier');
          sessionStorage.removeItem('oauth_provider');

          // Redirect to home page
          console.log('OAuth user session established, redirecting to home');
          navigate('/home');
        } else {
          // No session found, redirect to login
          console.log('No session found, redirecting to login');
          // Clean up OAuth session storage
          sessionStorage.removeItem('oauth_state');
          sessionStorage.removeItem('oauth_code_verifier');
          sessionStorage.removeItem('oauth_provider');
          navigate('/login');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        // Clean up OAuth session storage on error
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem('oauth_code_verifier');
        sessionStorage.removeItem('oauth_provider');
        navigate('/login?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [navigate, setAuthToken, setSessionExpiry]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
