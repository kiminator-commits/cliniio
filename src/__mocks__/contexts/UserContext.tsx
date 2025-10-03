import React, { createContext, useContext, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  title?: string;
  avatar_url?: string | null;
}

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  getUserDisplayName: () => string;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const mockUser: User = {
    id: 'test-user-id',
    name: 'Dr. Smith',
    email: 'test@example.com',
    role: 'User',
    title: 'Mr./Ms.',
    avatar_url: null,
  };

  const mockContext: UserContextType = {
    currentUser: mockUser,
    setCurrentUser: jest.fn(),
    getUserDisplayName: () => mockUser.name,
    refreshUserData: jest.fn().mockResolvedValue(undefined),
  };

  return (
    <UserContext.Provider value={mockContext}>{children}</UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
