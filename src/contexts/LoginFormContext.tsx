import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
  rememberDevice: boolean;
}

interface LoginFormContextType {
  formData: LoginFormData;
  setFormData: React.Dispatch<React.SetStateAction<LoginFormData>>;
}

const LoginFormContext = createContext<LoginFormContextType | undefined>(undefined);

export const LoginFormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
    rememberDevice: false,
  });

  return (
    <LoginFormContext.Provider value={{ formData, setFormData }}>
      {children}
    </LoginFormContext.Provider>
  );
};

export const useLoginForm = () => {
  const context = useContext(LoginFormContext);
  if (!context) {
    throw new Error('useLoginForm must be used within a LoginFormProvider');
  }
  return context;
};
