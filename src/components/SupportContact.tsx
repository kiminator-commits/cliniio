import React, { useState } from 'react';
import { BugTracker } from '@/pages/ContentBuilder/components/BugTracker';
import { FaTimes, FaBug, FaUserShield, FaTools } from 'react-icons/fa';

interface SupportContactProps {
  isOpen: boolean;
  onClose: () => void;
  errorContext?: string;
  technicalReport?: string;
}

export const SupportContact: React.FC<SupportContactProps> = ({
  isOpen,
  onClose,
  errorContext = 'login',
  technicalReport,
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'support' | 'bug'>(
    'support'
  );

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-contact-title"
    >
      <button
        className="absolute inset-0 w-full h-full"
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        aria-label="Close dialog"
      />
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2
            id="support-contact-title"
            className="text-xl font-semibold text-gray-900"
          >
            Get Help
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('admin')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'admin'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUserShield className="w-4 h-4 inline mr-2" />
              Administrator
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'support'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaTools className="w-4 h-4 inline mr-2" />
              Technical Support
            </button>
            <button
              onClick={() => setActiveTab('bug')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bug'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaBug className="w-4 h-4 inline mr-2" />
              Report Bug
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Contact Your System Administrator
                </h3>
                <p className="text-blue-800 mb-4">
                  For login issues, account access problems, or user management
                  questions, please contact your system administrator.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-blue-700">
                    <strong>Common Administrator Issues:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 list-disc list-inside space-y-1 ml-4">
                    <li>Account not found or disabled</li>
                    <li>Password reset requests</li>
                    <li>Permission or role changes</li>
                    <li>Account lockouts</li>
                    <li>User profile updates</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  How to Contact:
                </h4>
                <p className="text-sm text-gray-700">
                  Contact your IT department or system administrator directly.
                  They have access to user management tools and can resolve
                  account-related issues.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-orange-900 mb-2">
                  Contact Technical Support
                </h3>
                <p className="text-orange-800 mb-4">
                  For technical issues, system errors, or application problems,
                  please contact our technical support team.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-orange-700">
                    <strong>Common Technical Issues:</strong>
                  </p>
                  <ul className="text-sm text-orange-700 list-disc list-inside space-y-1 ml-4">
                    <li>System performance problems</li>
                    <li>Connection or network errors</li>
                    <li>Application crashes or freezes</li>
                    <li>Data synchronization issues</li>
                    <li>Browser compatibility problems</li>
                  </ul>
                </div>
              </div>

              {technicalReport && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Technical Report
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Please include this technical report when contacting
                    support:
                  </p>
                  <div className="bg-white border border-gray-300 rounded p-3">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                      {technicalReport}
                    </pre>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Support Information:
                </h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <strong>Error Context:</strong> {errorContext}
                  </p>
                  <p>
                    <strong>Timestamp:</strong> {new Date().toLocaleString()}
                  </p>
                  <p>
                    <strong>Browser:</strong> {navigator.userAgent}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bug' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Report a Bug
                </h3>
                <p className="text-gray-600">
                  Use the bug tracker below to report issues, suggest
                  improvements, or provide feedback about the application.
                </p>
              </div>
              <BugTracker />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportContact;
