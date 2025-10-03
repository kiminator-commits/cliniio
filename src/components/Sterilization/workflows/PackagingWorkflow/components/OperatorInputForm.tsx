import React from 'react';

interface OperatorInputFormProps {
  operatorName: string;
  onOperatorNameChange: (name: string) => void;
  onStartSession: () => void;
  onCancel: () => void;
}

const OperatorInputForm: React.FC<OperatorInputFormProps> = ({
  operatorName,
  onOperatorNameChange,
  onStartSession,
  onCancel,
}) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Packaging Workflow
      </h3>
      <div className="mb-4">
        <label
          htmlFor="operator-name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Operator Name
        </label>
        <input
          id="operator-name"
          type="text"
          value={operatorName}
          onChange={(e) => onOperatorNameChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter your name"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onStartSession}
          disabled={!operatorName.trim()}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          Start Session
        </button>
      </div>
    </div>
  );
};

export default OperatorInputForm;
