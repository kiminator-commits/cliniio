import { useState } from 'react';
import { LoginFormData } from '@/contexts/LoginFormContext';
import { loginService } from '@/services/loginService';

export const useLoginFormLogic = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
    rememberDevice: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await loginService.submit(formData);
    setLoading(false);
  };

  return { formData, setFormData, loading, handleSubmit };
};
