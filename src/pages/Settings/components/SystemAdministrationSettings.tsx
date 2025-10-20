import React, { useState, useEffect } from 'react';
import OfficeHoursSettings from './OfficeHoursSettings';
import UserManagementTab from '../../../components/UserManagementTab';
import UserForm from './UserForm';
import UserModals from './UserModals';
import SecuritySessionsSettings from './SecuritySessionsSettings';
import AuditDashboardPage from '../../Admin/AuditDashboardPage';
import { Badge as _Badge } from '../../../components/ui/badge';
import { supabase } from '../../../lib/supabaseClient';
// import BillingTierManager from './BillingTierManager';

interface User {
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
}

interface SystemAdministrationSettingsProps {
  initialTab?: string | null;
  complianceFlagCount?: number;
}

const SystemAdministrationSettings: React.FC<SystemAdministrationSettingsProps> = ({ 
  initialTab, 
  complianceFlagCount = 0 
}) => {
  const [users] = useState<User[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'office-hours' | 'security' | 'audit'>(
    (initialTab === 'audit' ? 'audit' : initialTab === 'security' ? 'security' : initialTab === 'office-hours' ? 'office-hours' : 'users')
  );
  const [_flagCount, setFlagCount] = useState<number>(0);

  // Calculate billing tier information
  const getBillingTierInfo = () => {
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

  const _billingTierInfo = getBillingTierInfo();

  // Fetch audit flag count
  useEffect(() => {
    async function fetchFlagCount() {
      try {
        const { count, error } = await supabase
          .from('audit_flags')
          .select('*', { count: 'exact', head: true })
          .eq('resolved', false);
        if (!error && typeof count === 'number') {
          setFlagCount(count);
        }
      } catch (err) {
        console.error('Failed to fetch audit flag count:', err);
      }
    }
    fetchFlagCount();
  }, []);

  // Handler functions for the refactored components
  const _handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const _handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const _handleAddUser = () => {
    setShowAddUserModal(true);
  };

  const handleCloseModals = () => {
    setShowAddUserModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const handleSaveUser = (userData: Partial<User>) => {
    // Here you would implement the save logic
    console.log('Saving user:', userData);
    handleCloseModals();
  };

  const handleConfirmDelete = () => {
    // Here you would implement the delete logic
    console.log('Deleting user:', selectedUser);
    handleCloseModals();
  };

  return (
    <div>
      <h4 className="text-lg font-semibold mb-4">System Administration</h4>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-[#4ECDC4] text-[#4ECDC4]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('office-hours')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'office-hours'
                  ? 'border-[#4ECDC4] text-[#4ECDC4]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Office Set-up
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-[#4ECDC4] text-[#4ECDC4]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Security & Sessions
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'audit'
                  ? 'border-[#4ECDC4] text-[#4ECDC4]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } ${
                complianceFlagCount > 0 
                  ? 'bg-red-50 text-red-700 border-red-300' 
                  : ''
              }`}
            >
              <span>Audit & Compliance</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <>
          {/* User Management */}
          <UserManagementTab />
        </>
      )}

      {activeTab === 'office-hours' && (
        <div>
          <OfficeHoursSettings />
        </div>
      )}

      {activeTab === 'security' && (
        <div>
          <SecuritySessionsSettings />
        </div>
      )}

      {activeTab === 'audit' && (
        <div>
          <AuditDashboardPage />
        </div>
      )}

      {/* User Forms and Modals */}
      <UserForm
        isOpen={showAddUserModal || showEditModal}
        onClose={handleCloseModals}
        onSave={handleSaveUser}
        user={selectedUser}
        mode={showEditModal ? 'edit' : 'add'}
      />

      <UserModals
        showDeleteModal={showDeleteModal}
        selectedUser={selectedUser}
        onCloseDeleteModal={() => setShowDeleteModal(false)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default SystemAdministrationSettings;
