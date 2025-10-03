import React from 'react';

interface FormGroupProps {
  title: string;
  children: React.ReactNode;
}

const FormGroup: React.FC<FormGroupProps> = ({ title, children }) => {
  return (
    <div className="space-y-4">
      <h5 className="text-sm font-medium text-gray-700">{title}</h5>
      <div className="space-y-3">{children}</div>
    </div>
  );
};

export default FormGroup;
