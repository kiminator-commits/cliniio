import React from 'react';

interface InlineErrorProps {
  message: string;
}

export default function InlineError({ message }: InlineErrorProps) {
  return (
    <div
      style={{
        color: 'red',
        fontSize: '14px',
        marginTop: '8px',
        padding: '8px',
        border: '1px solid #ffcdd2',
        borderRadius: '4px',
        backgroundColor: '#ffebee',
      }}
      aria-live="polite"
      role="alert"
    >
      {message}
    </div>
  );
}
