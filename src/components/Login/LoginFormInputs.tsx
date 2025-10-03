import React from 'react';

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

interface LoginFormInputsProps {
  formData: LoginFormData;
  setFormData: (data: LoginFormData) => void;
  errors: FormErrors;
}

const LoginFormInputs = ({
  formData,
  setFormData,
  errors,
}: LoginFormInputsProps) => {
  return (
    <>
      <input
        type="email"
        id="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        aria-describedby="email-error"
        aria-invalid={errors.email ? 'true' : 'false'}
      />
      <span id="email-error" role="alert">
        {errors.email}
      </span>

      <input
        type="password"
        id="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        aria-describedby="password-error"
        aria-invalid={errors.password ? 'true' : 'false'}
      />
      <span id="password-error" role="alert">
        {errors.password}
      </span>
    </>
  );
};

export default LoginFormInputs;
