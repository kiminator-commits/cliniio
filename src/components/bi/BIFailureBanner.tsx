import React, { useState } from 'react';
import { formatTestTime } from '@/services/bi/formatTestTime';

type Props = {
  failure?: {
    id: string;
    description: string;
    failure_date: string | Date;
  };
};

export function BIFailureBanner({ failure }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (!failure || dismissed) return null;

  const handleBITestDismiss = () => {
    setDismissed(true);
    console.info(`🧹 BI failure banner dismissed for incident: ${failure.id}`);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="bg-red-600 text-white p-4 rounded-md shadow-md flex justify-between items-start"
    >
      <div>
        <h3 className="font-semibold text-lg">⚠️ BI Test Failure Detected</h3>
        <p className="text-sm opacity-90 mt-1">{failure.description}</p>
        <p className="text-xs opacity-70 mt-2">
          Failure date: {formatTestTime(failure.failure_date)}
        </p>
      </div>
      <button
        onClick={handleBITestDismiss}
        aria-label="Dismiss BI failure alert"
        className="ml-4 bg-white text-red-700 px-2 py-1 rounded font-semibold hover:bg-gray-100"
      >
        Dismiss
      </button>
    </div>
  );
}
