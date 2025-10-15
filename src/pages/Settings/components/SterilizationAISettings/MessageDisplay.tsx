import React from 'react';
import Icon from '@mdi/react';
import { mdiCheckCircle, mdiAlertCircle } from '@mdi/js';
import { MessageDisplayProps } from './types';

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      className={`p-4 rounded-lg border mb-6 ${
        message.type === 'success'
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon
          path={message.type === 'success' ? mdiCheckCircle : mdiAlertCircle}
          size={1}
          className="text-current"
        />
        {message.text}
      </div>
    </div>
  );
};
