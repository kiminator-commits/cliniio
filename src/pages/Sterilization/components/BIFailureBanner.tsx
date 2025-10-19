import React, { useState } from 'react';
import { useSterilizationStore } from '@/store/sterilizationStore';
import { formatDate } from '@/utils/dateUtils';
import { logger } from '@/services/loggerService';

interface BIFailure {
  failure_date?: string;
  [key: string]: unknown;
}

export default function BIFailureBanner() {
  const { latestFailure } = useSterilizationStore();
  const [visible, setVisible] = useState(true);

  if (!latestFailure || !visible) return null;

  const failureDate =
    (latestFailure as BIFailure)?.failure_date
      ? new Date((latestFailure as BIFailure).failure_date!)
      : new Date(); // fallback for safety

  // ✅ Implement dismiss handler
  function handleBITestDismiss() {
    setVisible(false);
    logger.info('User dismissed BI failure banner');
  }

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold">
            ⚠️ Biological Indicator Failure Detected
          </p>
          <p className="text-sm">
            Failure Date: {formatDate(failureDate)}
          </p>
        </div>
        <button
          onClick={handleBITestDismiss}
          className="text-sm text-red-700 underline"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
