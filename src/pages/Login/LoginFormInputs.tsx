import React from 'react';
import { LoginFormData } from './types';
import {
  EmailField,
  PasswordField,
  OtpField,
  CheckboxFields,
} from './components';

interface Props {
  formData: LoginFormData;
  handleChange: (
    field: keyof LoginFormData
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const LoginFormFields: React.FC<Props> = ({
  formData,
  handleChange,
  disabled = false,
}) => {
  return (
    <div className="rounded-md shadow-sm space-y-4">
      <EmailField
        formData={formData}
        handleChange={handleChange}
        disabled={disabled}
      />

      <PasswordField
        formData={formData}
        handleChange={handleChange}
        disabled={disabled}
      />

      <OtpField
        formData={formData}
        handleChange={handleChange}
        disabled={disabled}
      />

      <CheckboxFields
        formData={formData}
        handleChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
};

export default LoginFormFields;
