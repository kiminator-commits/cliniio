import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@mdi/react';
import {
  mdiTestTube,
  mdiCheckCircle,
  mdiAlertCircle,
  mdiClose,
  mdiCalendar,
  mdiClock,
} from '@mdi/js';
import { useSterilizationStore } from '../../store/sterilizationStore';

interface BITestResult {
  date: Date;
  result: 'pass' | 'fail';
  operator?: string;
}

interface BiologicalIndicatorTestProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: BITestResult) => void;
  operatorName?: string;
}

const BiologicalIndicatorTest: React.FC<BiologicalIndicatorTestProps> = ({
  isOpen,
  onClose,
  onComplete,
  operatorName = 'Operator',
}) => {
  const [selectedResult, setSelectedResult] = useState<'pass' | 'fail' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { get } = useSterilizationStore();

  const handleSubmit = () => {
    const lastTestDate = get().lastBITestDate; // Assumes Zustand state tracks last BI test
    const today = new Date().toDateString();

    if (lastTestDate && new Date(lastTestDate).toDateString() === today) {
      alert('A BI test has already been logged for today.');
      return;
    }

    if (selectedResult === 'fail') {
      alert('BI test failed. All sterilized tools must be quarantined.');
      // Optionally: trigger a quarantine state update here
    }

    if (selectedResult) {
      setIsSubmitting(true);
      const result: BITestResult = {
        date: new Date(),
        result: selectedResult,
        operator: operatorName,
      };

      // Simulate a brief delay for better UX
      setTimeout(() => {
        onComplete(result);
        setIsSubmitting(false);
        setSelectedResult(null);
        onClose();
      }, 500);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedResult(null);
      onClose();
    }
  };

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[99999] p-4"
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
      }}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Icon path={mdiTestTube} size={1.5} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Daily BI Test</h2>
              <p className="text-sm text-gray-600">Required every 24 hours</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Icon path={mdiClose} size={1} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Icon path={mdiCalendar} size={1} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
              </span>
            </div>
            <p className="text-gray-700 mb-4">
              Please complete the daily Biological Indicator test and record the result below.
            </p>
          </div>

          {/* Result Selection */}
          <div className="space-y-3 mb-6">
            <label className="block">
              <div
                className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                  selectedResult === 'pass' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }"
                onClick={() => setSelectedResult('pass')}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedResult('pass');
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={selectedResult === 'pass'}
              >
                <input
                  type="radio"
                  name="biResult"
                  value="pass"
                  checked={selectedResult === 'pass'}
                  onChange={() => setSelectedResult('pass')}
                  className="sr-only"
                />
                <Icon path={mdiCheckCircle} size={1.5} className="text-green-600" />
                <div>
                  <div className="font-medium text-gray-800">PASS</div>
                  <div className="text-sm text-gray-600">Test passed - all cycles safe</div>
                </div>
              </div>
            </label>

            <label className="block">
              <div
                className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                  selectedResult === 'fail' ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }"
                onClick={() => setSelectedResult('fail')}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedResult('fail');
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={selectedResult === 'fail'}
              >
                <input
                  type="radio"
                  name="biResult"
                  value="fail"
                  checked={selectedResult === 'fail'}
                  onChange={() => setSelectedResult('fail')}
                  className="sr-only"
                />
                <Icon path={mdiAlertCircle} size={1.5} className="text-red-600" />
                <div>
                  <div className="font-medium text-gray-800">FAIL</div>
                  <div className="text-sm text-gray-600">Test failed - quarantine required</div>
                </div>
              </div>
            </label>
          </div>

          {/* Warning for Fail */}
          {selectedResult === 'fail' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon path={mdiAlertCircle} size={1} className="text-red-500" />
                <span className="font-medium text-red-800">Critical Alert</span>
              </div>
              <p className="text-sm text-red-700">
                All sterilization cycles since the last successful BI test must be quarantined and
                re-sterilized. Contact your supervisor immediately.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!selectedResult || isSubmitting}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                selectedResult && !isSubmitting
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Icon path={mdiClock} size={1} className="animate-spin" />
                  Recording...
                </div>
              ) : (
                'Record Result'
              )}
            </button>

            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BiologicalIndicatorTest;
