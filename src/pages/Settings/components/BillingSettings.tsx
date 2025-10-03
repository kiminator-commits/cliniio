import React from 'react';

const BillingSettings: React.FC = () => {
  return (
    <div>
      <h4 className="text-lg font-semibold mb-3">
        Billing & Subscription Settings
      </h4>

      {/* Current Plan & Payment Methods - Combined */}
      <div className="mb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Current Plan */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Current Plan
            </h5>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h6 className="text-base font-semibold text-blue-900">
                    Professional Plan
                  </h6>
                  <p className="text-xs text-blue-700">
                    $299/month • 50 users • Full features
                  </p>
                  <p className="text-xs text-blue-600">
                    Next billing: Jan 15, 2024
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Payment Methods
            </h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 border border-gray-200 rounded-md">
                <div className="flex items-center">
                  <div className="w-8 h-5 bg-blue-600 rounded mr-2 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">VISA</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-700">
                      •••• •••• •••• 4242
                    </span>
                    <p className="text-xs text-gray-500">Expires 12/25</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded-full">
                    Default
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 text-xs">
                    Edit
                  </button>
                </div>
              </div>
              <button className="w-full p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors text-xs">
                + Add Payment Method
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Information - Compact */}
      <div className="mb-4">
        <h5 className="text-sm font-medium text-gray-700 mb-2">
          Billing Information
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="company-name"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Company Name
            </label>
            <input
              id="company-name"
              type="text"
              defaultValue="Medical Center Inc."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            />
          </div>
          <div>
            <label
              htmlFor="tax-id"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Tax ID
            </label>
            <input
              id="tax-id"
              type="text"
              defaultValue="12-3456789"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            />
          </div>
          <div>
            <label
              htmlFor="billing-email"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Billing Email
            </label>
            <input
              id="billing-email"
              type="email"
              defaultValue="billing@medicalcenter.com"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            />
          </div>
          <div>
            <label
              htmlFor="billing-phone"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Phone
            </label>
            <input
              id="billing-phone"
              type="tel"
              defaultValue="+1 (555) 123-4567"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            />
          </div>
          <div>
            <label
              htmlFor="billing-city"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              City
            </label>
            <input
              id="billing-city"
              type="text"
              defaultValue="New York"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            />
          </div>
          <div>
            <label
              htmlFor="billing-state-zip"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              State/ZIP
            </label>
            <div className="flex gap-1">
              <input
                id="billing-state"
                type="text"
                defaultValue="NY"
                className="w-1/2 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              />
              <input
                id="billing-zip"
                type="text"
                defaultValue="10001"
                className="w-1/2 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Settings & Usage - Side by Side */}
      <div className="mb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Invoice Settings */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Invoice Settings
            </h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 border border-gray-200 rounded-md">
                <span className="text-xs font-medium text-gray-700">
                  Frequency
                </span>
                <select className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]">
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Annually</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-2 border border-gray-200 rounded-md">
                <span className="text-xs font-medium text-gray-700">
                  Auto-pay
                </span>
                <input
                  type="checkbox"
                  id="auto-pay"
                  className="rounded"
                  defaultChecked
                />
              </div>
              <div className="flex items-center justify-between p-2 border border-gray-200 rounded-md">
                <span className="text-xs font-medium text-gray-700">
                  Reminders
                </span>
                <input
                  type="checkbox"
                  id="payment-reminders"
                  className="rounded"
                  defaultChecked
                />
              </div>
            </div>
          </div>

          {/* Usage & Limits */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Usage & Limits
            </h5>
            <div className="space-y-2">
              <div className="p-2 border border-gray-200 rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">
                    Users
                  </span>
                  <span className="text-xs text-gray-600">35/50</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: '70%' }}
                  ></div>
                </div>
              </div>
              <div className="p-2 border border-gray-200 rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">
                    Storage
                  </span>
                  <span className="text-xs text-gray-600">2.1/10 GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-green-600 h-1.5 rounded-full"
                    style={{ width: '21%' }}
                  ></div>
                </div>
              </div>
              <div className="p-2 border border-gray-200 rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">
                    API Calls
                  </span>
                  <span className="text-xs text-gray-600">45K/100K</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-yellow-600 h-1.5 rounded-full"
                    style={{ width: '45%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Management - Compact */}
      <div className="mb-4">
        <h5 className="text-sm font-medium text-gray-700 mb-2">
          Plan Management
        </h5>
        <div className="grid grid-cols-3 gap-2">
          <button className="p-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-xs">
            Upgrade
          </button>
          <button className="p-2 border border-gray-300 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-xs">
            Downgrade
          </button>
          <button className="p-2 border border-red-300 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors text-xs">
            Cancel
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-[#4ECDC4] text-white rounded-md hover:bg-[#38b2ac] transition-colors text-sm">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default BillingSettings;
