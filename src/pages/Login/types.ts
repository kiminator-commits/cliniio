export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
  rememberDevice: boolean;
  otp?: string;
  stage?: 'credentials' | 'otp';
}

export interface FormErrors {
  email?: string;
  password?: string;
  submit?: string;
  otp?: string;
  rememberMe?: string;
  rememberDevice?: string;
  stage?: string;
}
