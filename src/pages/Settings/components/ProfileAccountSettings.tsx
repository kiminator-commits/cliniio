import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useUser } from '../../../contexts/UserContext';
import { TabNavigation } from './navigation';
import { BasicInfoTab, PreferencesTab, MobileTab, AccountTab } from './tabs';
import { PasswordChangeModal } from './modals';
import { UserData } from '../services/settingsService';

export const ProfileAccountSettings: React.FC = () => {
  const { refreshUserData } = useUser();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('basic-info');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form states
  const [basicInfoForm, setBasicInfoForm] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    date_of_birth: string;
    bio: string;
    preferred_language: string;
    timezone: string;
  }>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    date_of_birth: '',
    bio: '',
    preferred_language: 'en',
    timezone: 'UTC',
  });

  const [preferences, setPreferences] = useState<{
    theme: string;
    notifications: {
      push: boolean;
      sound: string;
      volume: number;
      vibration: string;
      vibrationEnabled: boolean;
    };
  }>({
    theme: 'light',
    notifications: {
      push: true,
      sound: 'gentle-chime',
      volume: 50,
      vibration: 'short-pulse',
      vibrationEnabled: true,
    },
  });

  const [mobileShortcuts, setMobileShortcuts] = useState<
    Array<Record<string, unknown>>
  >([]);

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const availableShortcuts = [
    { id: 'home', name: 'Home Dashboard', icon: 'mdiHome', url: '/home' },
    {
      id: 'sterilization',
      name: 'Sterilization',
      icon: 'mdiTestTube',
      url: '/sterilization',
    },
    {
      id: 'inventory',
      name: 'Inventory',
      icon: 'mdiPackageVariant',
      url: '/inventory',
    },
    {
      id: 'environmental',
      name: 'Environmental Clean',
      icon: 'mdiBroom',
      url: '/environmental-clean',
    },
    {
      id: 'knowledge',
      name: 'Knowledge Hub',
      icon: 'mdiBookOpenVariant',
      url: '/knowledge-hub',
    },
    { id: 'library', name: 'Library', icon: 'mdiLibrary', url: '/library' },
    { id: 'settings', name: 'Settings', icon: 'mdiCog', url: '/settings' },
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  // Handle URL parameters for password reset flow
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    const openPasswordModal = searchParams.get('openPasswordModal');

    if (tab === 'account' && openPasswordModal === 'true') {
      setActiveTab('account');
      setShowPasswordModal(true);
      setIsPasswordReset(true);
      // Clear the URL parameters
      window.history.replaceState({}, '', '/settings');
    }
  }, [location.search]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        let { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        // If no profile exists, create a default one
        if (!profileData) {
          // Get user's facility_id first
          const { data: userProfile } = await supabase
            .from('users')
            .select('facility_id')
            .eq('id', user.id)
            .single();

          const defaultProfile = {
            id: user.id,
            email: user.email || '',
            first_name: '',
            last_name: '',
            role: 'user' as const,
            phone: '',
            department: '',
            position: '',
            date_of_birth: '',
            bio: '',
            preferred_language: 'en',
            timezone: 'UTC',
            facility_id:
              userProfile?.facility_id ||
              '550e8400-e29b-41d4-a716-446655440000', // fallback for dev
          };

          const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert(defaultProfile)
            .select()
            .single();

          if (insertError) {
            console.error('Error creating default profile:', insertError);
            // Still set the form with basic user info
            setBasicInfoForm({
              first_name: '',
              last_name: '',
              email: user.email || '',
              phone: '',
              department: '',
              position: '',
              date_of_birth: '',
              bio: '',
              preferred_language: 'en',
              timezone: 'UTC',
            });
          } else {
            profileData = newProfile;
          }
        }

        if (profileData) {
          console.log('Profile data found:', profileData);

          // Fetch the current active_sessions count
          try {
            const { data: sessionsData } = await supabase
              .from('user_sessions')
              .select('id')
              .eq('user_id', user.id)
              .eq('is_active', true);

            const activeSessionsCount = sessionsData?.length || 0;

            // Update the profile data with the real active sessions count
            const updatedProfileData: UserData = {
              id: profileData.id,
              email: profileData.email || '',
              first_name: profileData.first_name || '',
              last_name: profileData.last_name || '',
              role: profileData.role || '',
              phone: profileData.phone || '',
              department: profileData.department || '',
              position: profileData.position || '',
              date_of_birth: profileData.date_of_birth || '',
              bio: profileData.bio || '',
              preferred_language: profileData.preferred_language || 'en',
              timezone: profileData.timezone || 'UTC',
              avatar_url: profileData.avatar_url,
              active_sessions: activeSessionsCount,
            };

            setUserData(updatedProfileData);
          } catch (sessionsError) {
            console.warn(
              'Failed to fetch active sessions count:',
              sessionsError
            );
            const fallbackUserData: UserData = {
              id: profileData.id,
              email: profileData.email || '',
              first_name: profileData.first_name || '',
              last_name: profileData.last_name || '',
              role: profileData.role || '',
              phone: profileData.phone || '',
              department: profileData.department || '',
              position: profileData.position || '',
              date_of_birth: profileData.date_of_birth || '',
              bio: profileData.bio || '',
              preferred_language: profileData.preferred_language || 'en',
              timezone: profileData.timezone || 'UTC',
              avatar_url: profileData.avatar_url,
              active_sessions: 0,
            };
            setUserData(fallbackUserData);
          }

          setBasicInfoForm({
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            email: profileData.email || user.email || '',
            phone: profileData.phone || '',
            department: profileData.department || '',
            position: profileData.position || '',
            date_of_birth: profileData.date_of_birth || '',
            bio: profileData.bio || '',
            preferred_language: profileData.preferred_language || 'en',
            timezone: profileData.timezone || 'UTC',
          });
          console.log('Basic info form set to:', {
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            email: profileData.email || user.email || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user's facility_id first
      const { data: userProfile } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      // Ensure required fields are present
      const profileData = {
        id: user.id,
        email: user.email || '',
        first_name: basicInfoForm.first_name || '',
        last_name: basicInfoForm.last_name || '',
        role: 'user' as const,
        phone: basicInfoForm.phone || '',
        department: basicInfoForm.department || '',
        position: basicInfoForm.position || '',
        date_of_birth: basicInfoForm.date_of_birth || '',
        bio: basicInfoForm.bio || '',
        preferred_language: basicInfoForm.preferred_language || 'en',
        timezone: basicInfoForm.timezone || 'UTC',
        facility_id:
          userProfile?.facility_id || '550e8400-e29b-41d4-a716-446655440000', // fallback for dev
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('users').upsert(profileData);

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Refresh the user data after saving
      await fetchUserData();
    } catch (error: unknown) {
      setSaveError(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      setPasswordError(null);
      setPasswordSuccess(null);

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('New passwords do not match');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setPasswordError('New password must be at least 6 characters long');
        return;
      }

      if (isPasswordReset) {
        // For password reset, we need to send a reset email first
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user?.email) {
          setPasswordError('User not found');
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(
          user.email,
          {
            redirectTo: `${window.location.origin}/settings?tab=account&openPasswordModal=true`,
          }
        );

        if (error) throw error;

        setPasswordSuccess(
          'Password reset email sent! Check your email for the reset link.'
        );
        setShowPasswordModal(false);
        setIsPasswordReset(false);
      } else {
        // Regular password change
        const { error } = await supabase.auth.updateUser({
          password: passwordData.newPassword,
        });

        if (error) throw error;

        setPasswordSuccess('Password updated successfully');
        setShowPasswordModal(false);
      }
    } catch (error: unknown) {
      setPasswordError(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  };

  const handleArchiveAccount = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Archive the user by setting is_active to false and adding archived_at timestamp
      const { error } = await supabase
        .from('users')
        .update({
          is_active: false,
          archived_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Sign out the user after archiving
      await supabase.auth.signOut();

      // Redirect to login page
      window.location.href = '/login';
    } catch (error: unknown) {
      console.error('Error archiving account:', error);
    }
  };

  const uploadProfilePhoto = async (file: File) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUserData((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));

      // Refresh user data in UserContext to update the main menu avatar
      refreshUserData();
    } catch (error: unknown) {
      console.error('Error uploading photo:', error);
    }
  };

  const removeProfilePhoto = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('users')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (error) throw error;

      setUserData((prev) => (prev ? { ...prev, avatar_url: undefined } : null));
    } catch (error: unknown) {
      console.error('Error removing photo:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4ECDC4]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="text-lg font-semibold">Profile & Account Settings</h4>
      </div>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'basic-info' && (
        <BasicInfoTab
          basicInfoForm={basicInfoForm}
          setBasicInfoForm={setBasicInfoForm}
          userData={userData}
          uploadingPhoto={false}
          uploadProfilePhoto={uploadProfilePhoto}
          removeProfilePhoto={removeProfilePhoto}
        />
      )}

      {activeTab === 'preferences' && (
        <PreferencesTab
          preferences={preferences}
          setPreferences={setPreferences}
        />
      )}

      {activeTab === 'mobile' && (
        <MobileTab
          mobileShortcuts={mobileShortcuts}
          setMobileShortcuts={setMobileShortcuts}
          availableShortcuts={availableShortcuts}
        />
      )}

      {activeTab === 'account' && (
        <AccountTab
          userData={userData}
          onPasswordChange={handlePasswordChange}
          onOpenPasswordModal={() => setShowPasswordModal(true)}
          onArchiveAccount={handleArchiveAccount}
          passwordError={passwordError}
          passwordSuccess={passwordSuccess}
        />
      )}

      {activeTab === 'basic-info' && (
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#4ECDC4] text-white rounded-md hover:bg-[#38b2ac] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {saveSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          Changes saved successfully!
        </div>
      )}

      {saveError && (
        <div className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          Error saving changes: {saveError}
        </div>
      )}

      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setIsPasswordReset(false);
        }}
        onSubmit={handlePasswordChange}
        error={passwordError}
        success={passwordSuccess}
        isPasswordReset={isPasswordReset}
      />
    </div>
  );
};
