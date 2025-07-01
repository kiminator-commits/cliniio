import { LoginFormData } from '@/contexts/LoginFormContext';

export const loginService = {
  submit: async (formData: LoginFormData): Promise<{ success: boolean }> => {
    console.log('Submitting login data:', formData);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true }; // Always succeeds for now
  },
};
