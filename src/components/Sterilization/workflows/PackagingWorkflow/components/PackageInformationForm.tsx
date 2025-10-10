import React from 'react';

interface PackageInfo {
  packageType: string;
  packageSize: string;
  notes: string;
}

interface PackageInformationFormProps {
  packageInfo: PackageInfo;
  batchLoading: boolean;
  onPackageInfoChange: (info: PackageInfo) => void;
  onFinalizePackage: () => void;
  onCancel: () => void;
  packageTypes: string[];
  packageSizes: string[];
}

const PackageInformationForm: React.FC<PackageInformationFormProps> = ({
  packageInfo,
  batchLoading,
  onPackageInfoChange,
  onFinalizePackage,
  onCancel,
  packageTypes,
  packageSizes,
}) => {
  const handlePackageTypeChange = (packageType: string) => {
    onPackageInfoChange({ ...packageInfo, packageType });
  };

  const handlePackageSizeChange = (packageSize: string) => {
    onPackageInfoChange({ ...packageInfo, packageSize });
  };

  const handleNotesChange = (notes: string) => {
    onPackageInfoChange({ ...packageInfo, notes });
  };

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="font-medium text-blue-800 mb-3">Package Information</h4>
      <div className="space-y-3">
        <div>
          <label
            htmlFor="package-type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Package Type
          </label>
          <select
            id="package-type"
            value={packageInfo.packageType}
            onChange={(e) => handlePackageTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select package type</option>
            {packageTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="package-size"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Package Size
          </label>
          <select
            id="package-size"
            value={packageInfo.packageSize}
            onChange={(e) => handlePackageSizeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select package size</option>
            {packageSizes.map((size) => (
              <option key={size} value={size}>
                {size.charAt(0).toUpperCase() + size.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="package-notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notes (Optional)
          </label>
          <textarea
            id="package-notes"
            value={packageInfo.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="Additional notes about the package..."
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onFinalizePackage}
          disabled={
            batchLoading || !packageInfo.packageType || !packageInfo.packageSize
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {batchLoading ? 'Processing...' : 'Generate Batch Code'}
        </button>
      </div>
    </div>
  );
};

export default PackageInformationForm;
