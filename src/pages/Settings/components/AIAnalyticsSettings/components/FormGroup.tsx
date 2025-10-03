import React from 'react';
import { FormGroupProps } from '../AIAnalyticsSettings.types';

const FormGroup: React.FC<FormGroupProps> = ({ title, children }) => {
  return (
    <div className="space-y-4">
      <h5 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
        {title}
      </h5>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default FormGroup;
