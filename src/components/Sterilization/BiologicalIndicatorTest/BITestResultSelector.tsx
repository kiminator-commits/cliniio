import React from 'react';
import Icon from '@mdi/react';
import { mdiCheckCircle, mdiAlertCircle } from '@mdi/js';

interface BITestResultSelectorProps {
  selectedResult: 'pass' | 'fail' | null;
  onResultSelect: (result: 'pass' | 'fail') => void;
  getResultSelectionClasses: (result: 'pass' | 'fail') => string;
}

/**
 * Result selection component for the Biological Indicator Test.
 * Contains the pass/fail radio button options.
 */
export const BITestResultSelector: React.FC<BITestResultSelectorProps> = ({
  selectedResult,
  onResultSelect,
  getResultSelectionClasses,
}) => {
  return (
    <div className="space-y-3 mb-6">
      <label className="block">
        <div
          className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${getResultSelectionClasses('pass')}`}
          onClick={() => onResultSelect('pass')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onResultSelect('pass');
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
            onChange={() => onResultSelect('pass')}
            className="sr-only"
          />
          <Icon path={mdiCheckCircle} size={1.5} className="text-green-600" />
          <div>
            <div className="font-medium text-gray-800">PASS</div>
            <div className="text-sm text-gray-600">
              Test passed - all cycles safe
            </div>
          </div>
        </div>
      </label>

      <label className="block">
        <div
          className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${getResultSelectionClasses('fail')}`}
          onClick={() => onResultSelect('fail')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onResultSelect('fail');
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
            onChange={() => onResultSelect('fail')}
            className="sr-only"
          />
          <Icon path={mdiAlertCircle} size={1.5} className="text-red-600" />
          <div>
            <div className="font-medium text-gray-800">FAIL</div>
            <div className="text-sm text-gray-600">
              Test failed - quarantine required
            </div>
          </div>
        </div>
      </label>
    </div>
  );
};
