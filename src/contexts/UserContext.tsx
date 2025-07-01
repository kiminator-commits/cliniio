import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  title?: string; // e.g., "Dr.", "Nurse", etc.
}

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  getUserDisplayName: () => string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Try to get user from localStorage on initialization
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    // Default user for demo purposes
    return {
      id: '1',
      name: 'Dr. Smith',
      email: 'dr.smith@cliniio.com',
      role: 'Physician',
      title: 'Dr.',
    };
  });

  const getUserDisplayName = () => {
    if (!currentUser) return 'Unknown User';
    return currentUser.title ? `${currentUser.title} ${currentUser.name}` : currentUser.name;
  };

  const handleSetCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        getUserDisplayName,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
