import { submitLoginForm, sendOtp, verifyOtp } from '../services/api';

export const useLoginApi = () => {
  const login = async (email: string, password: string) => {
    return submitLoginForm({ email, password });
  };

  const requestOtp = async (email: string) => {
    return sendOtp(email);
  };

  const verifyCode = async (email: string, otp: string) => {
    return verifyOtp(email, otp);
  };

  return { login, requestOtp, verifyCode };
};
