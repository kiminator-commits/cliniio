import React, { useState } from 'react';
import {
  STATUS_BUNDLES,
  getBundleById,
  findDuplicateStatuses,
} from '../../config/statusBundles';

interface StatusType {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  isDefault: boolean;
  isCore: boolean;
  isPublished: boolean;
  category?: string;
  requiresVerification?: boolean;
  autoTransition?: boolean;
  transitionTo?: string;
  alertLevel?: 'low' | 'medium' | 'high' | 'critical';
}

interface StatusBundleManagerProps {
  customStatuses: StatusType[];
  onLoadBundle: (bundleId: string) => void;
  onReplaceWithBundle: (bundleId: string) => void;
}

const StatusBundleManager: React.FC<StatusBundleManagerProps> = ({
  customStatuses,
  onLoadBundle,
  onReplaceWithBundle,
}) => {
  const [selectedBundle, setSelectedBundle] = useState<string>('');
  const [showBundlePreview, setShowBundlePreview] = useState(false);
  const [duplicateStatuses, setDuplicateStatuses] = useState<
    { bundleStatus: string; existingStatus: string; similarity: number }[]
  >([]);

  const handleBundleSelect = (bundleId: string) => {
    setSelectedBundle(bundleId);
    const bundle = getBundleById(bundleId);

    if (bundle) {
      // Check for duplicates
      const duplicates = findDuplicateStatuses(bundle, customStatuses);
      setDuplicateStatuses(duplicates);
      setShowBundlePreview(true);
    }
  };

  const handleLoadBundle = () => {
    onLoadBundle(selectedBundle);
    // Reset bundle selection
    setSelectedBundle('');
    setShowBundlePreview(false);
    setDuplicateStatuses([]);
  };

  const handleReplaceWithBundle = () => {
    onReplaceWithBundle(selectedBundle);
    // Reset bundle selection
    setSelectedBundle('');
    setShowBundlePreview(false);
    setDuplicateStatuses([]);
  };

  const handleCancelBundle = () => {
    setSelectedBundle('');
    setShowBundlePreview(false);
    setDuplicateStatuses([]);
  };

  return (
    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
      <h5 className="text-sm font-medium text-green-800 mb-2">
        🚀 Quick Setup: Pre-configured Status Bundles
      </h5>
      <p className="text-xs text-green-700 mb-3">
        Select a bundle to quickly add relevant statuses for your healthcare
        specialty. All statuses start as drafts.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
        {STATUS_BUNDLES.map((bundle) => (
          <button
            key={bundle.id}
            onClick={() => handleBundleSelect(bundle.id)}
            className={`p-2 text-left rounded border transition-colors ${
              selectedBundle === bundle.id
                ? 'bg-green-100 border-green-400 text-green-800'
                : 'bg-white border-green-200 hover:bg-green-50 text-green-700'
            }`}
          >
            <div className="font-medium text-xs">{bundle.name}</div>
            <div className="text-xs opacity-75">{bundle.description}</div>
            <div className="text-xs opacity-60">
              {bundle.statuses.length} statuses
            </div>
          </button>
        ))}
      </div>

      {showBundlePreview && selectedBundle && (
        <div className="mt-3 p-3 bg-white border border-green-300 rounded">
          <h6 className="text-sm font-medium text-green-800 mb-2">
            Bundle Preview: {getBundleById(selectedBundle)?.name}
          </h6>

          {duplicateStatuses.length > 0 && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800 mb-1">
                ⚠️ Found {duplicateStatuses.length} similar statuses:
              </p>
              <ul className="text-xs text-yellow-700 space-y-1">
                {duplicateStatuses.slice(0, 3).map((dup, index) => (
                  <li key={index}>
                    • "{dup.bundleStatus}" similar to "{dup.existingStatus}"
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={handleLoadBundle}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add New Statuses Only
            </button>
            <button
              onClick={handleReplaceWithBundle}
              className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Replace All Custom Statuses
            </button>
            <button
              onClick={handleCancelBundle}
              className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusBundleManager;
