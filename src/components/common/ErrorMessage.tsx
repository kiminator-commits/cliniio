import React from 'react';

type ErrorMessageProps = {
  message?: string;
};

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = 'Something went wrong.',
}) => (
  <div role="alert" aria-live="assertive" className="text-sm text-red-600 mt-2">
    {message}
  </div>
);

export default ErrorMessage;
