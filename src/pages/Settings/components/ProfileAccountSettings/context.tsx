import React, { createContext, useContext, ReactNode } from 'react';
import { useProfileSettings } from './hooks';
import { ProfileSettingsState } from './types';

interface ProfileSettingsContextType {
  state: ProfileSettingsState;
  setState: React.Dispatch<React.SetStateAction<ProfileSettingsState>>;
  fetchUserData: () => Promise<void>;
  handleSave: () => Promise<void>;
  handlePasswordChange: (passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<void>;
  handleArchiveAccount: () => Promise<void>;
  uploadProfilePhoto: (file: File) => Promise<void>;
  removeProfilePhoto: () => Promise<void>;
}

const ProfileSettingsContext = createContext<
  ProfileSettingsContextType | undefined
>(undefined);

interface ProfileSettingsProviderProps {
  children: ReactNode;
}

export const ProfileSettingsProvider: React.FC<
  ProfileSettingsProviderProps
> = ({ children }) => {
  const profileSettings = useProfileSettings();

  return (
    <ProfileSettingsContext.Provider value={profileSettings}>
      {children}
    </ProfileSettingsContext.Provider>
  );
};

export const useProfileSettingsContext = () => {
  const context = useContext(ProfileSettingsContext);
  if (context === undefined) {
    throw new Error(
      'useProfileSettingsContext must be used within a ProfileSettingsProvider'
    );
  }
  return context;
};
