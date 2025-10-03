import React from 'react';
import Icon from '@mdi/react';
import { mdiAlertCircle, mdiCheckCircle } from '@mdi/js';

interface ValidationStatusProps {
  validationStatus: {
    status: 'valid' | 'warning' | 'error';
    message: string;
  };
}

export const ValidationStatus: React.FC<ValidationStatusProps> = ({
  validationStatus,
}) => {
  return (
    <div
      className={`p-4 rounded-lg border ${
        validationStatus.status === 'error'
          ? 'bg-red-50 border-red-200'
          : validationStatus.status === 'warning'
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-green-50 border-green-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon
          path={
            validationStatus.status === 'error'
              ? mdiAlertCircle
              : validationStatus.status === 'warning'
                ? mdiAlertCircle
                : mdiCheckCircle
          }
          size={1.2}
          className={
            validationStatus.status === 'error'
              ? 'text-red-600'
              : validationStatus.status === 'warning'
                ? 'text-yellow-600'
                : 'text-green-600'
          }
        />
        <div>
          <h5
            className={`font-medium ${
              validationStatus.status === 'error'
                ? 'text-red-900'
                : validationStatus.status === 'warning'
                  ? 'text-yellow-900'
                  : 'text-green-900'
            }`}
          >
            {validationStatus.status === 'error'
              ? 'Course Cannot Be Published'
              : validationStatus.status === 'warning'
                ? 'Course Ready with Warnings'
                : 'Course Ready to Publish'}
          </h5>
          <p
            className={`text-sm ${
              validationStatus.status === 'error'
                ? 'text-red-700'
                : validationStatus.status === 'warning'
                  ? 'text-yellow-700'
                  : 'text-green-700'
            }`}
          >
            {validationStatus.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ValidationStatus;
