import React from 'react';

interface User {
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
}

interface BillingTierInfo {
  currentTier: { name: string };
  nextTier: { name: string };
  usersToNextTier: number;
  activeUserCount: number;
}

interface BillingTierManagerProps {
  users: User[];
}

const BillingTierManager: React.FC<BillingTierManagerProps> = ({ users }) => {
  // Calculate billing tier information
  const getBillingTierInfo = (): BillingTierInfo | null => {
    const activeUserCount = users.filter(
      (user) => user.status === 'Active'
    ).length;

    // Define billing tiers
    const billingTiers = [
      { min: 0, max: 5, name: '0-5 Users' },
      { min: 6, max: 15, name: '6-15 Users' },
      { min: 16, max: 21, name: '16-21 Users' },
      { min: 22, max: Infinity, name: '21+ Users' },
    ];

    // Find current tier
    const currentTier = billingTiers.find(
      (tier) => activeUserCount >= tier.min && activeUserCount <= tier.max
    );

    // Find next tier
    const nextTier = billingTiers.find((tier) => tier.min > activeUserCount);

    if (!currentTier || !nextTier) return null;

    const usersToNextTier = nextTier.min - activeUserCount;

    return {
      currentTier,
      nextTier,
      usersToNextTier,
      activeUserCount,
    };
  };

  const billingTierInfo = getBillingTierInfo();

  if (!billingTierInfo) return null;

  return (
    <div className="mb-4">
      {/* Billing Tier Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-blue-900">Billing Tier</h4>
            <p className="text-xs text-blue-700">
              Current: {billingTierInfo.activeUserCount} active users (
              {billingTierInfo.currentTier.name})
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-600">
              Next tier: {billingTierInfo.nextTier.name}
            </p>
            <p className="text-xs text-blue-600">
              {billingTierInfo.usersToNextTier} users to next tier
            </p>
          </div>
        </div>
      </div>

      {/* Billing Tier Warning Banner */}
      {billingTierInfo.usersToNextTier <= 2 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-3">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-amber-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Billing Tier Warning
              </h3>
              <div className="mt-1 text-sm text-amber-700">
                <p>
                  You are {billingTierInfo.usersToNextTier} user
                  {billingTierInfo.usersToNextTier === 1 ? '' : 's'} away from
                  the next pricing tier ({billingTierInfo.nextTier.name}).
                  Please review and remove any inactive users to avoid an
                  increase in fees.
                </p>
                <p className="mt-1 text-xs">
                  Current: {billingTierInfo.activeUserCount} active users (
                  {billingTierInfo.currentTier.name})
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingTierManager;
