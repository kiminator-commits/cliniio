import React, { useState } from 'react';
import { PageLayout } from '../../components/Layout/PageLayout';
import RoomManagement from '../../components/Settings/RoomManagement';
import Icon from '@mdi/react';
import {
  mdiAccount,
  mdiCog,
  mdiBookOpen,
  mdiSchool,
  mdiSpray,
  mdiPackageVariant,
  mdiThermometer,
  mdiDatabase,
  mdiChartLine,
  mdiTestTube,
  mdiShield,
  mdiBell,
  mdiPalette,
  mdiAccountGroup,
  mdiOfficeBuilding,
  mdiKey,
  mdiEye,
  mdiPlus,
  mdiContentSave,
  mdiRefresh,
} from '@mdi/js';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');

  const tabs = [
    { id: 'profile', label: 'Profile & Account', icon: mdiAccount },
    { id: 'system', label: 'System Admin', icon: mdiCog },
    { id: 'content', label: 'Content Management', icon: mdiBookOpen },
    { id: 'learning', label: 'Learning & Training', icon: mdiSchool },
    { id: 'cleaning', label: 'Environmental Cleaning', icon: mdiSpray },
    { id: 'inventory', label: 'Inventory Management', icon: mdiPackageVariant },
    { id: 'sterilization', label: 'Sterilization', icon: mdiThermometer },
    { id: 'system-config', label: 'System Configuration', icon: mdiDatabase },
    { id: 'analytics', label: 'Analytics & Reporting', icon: mdiChartLine },
    { id: 'prototype', label: 'Prototype Settings', icon: mdiTestTube },
  ];

  return (
    <PageLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#5b5b5b] mb-1">Settings</h1>
            <p className="text-gray-500 text-sm">
              Configure your application preferences and account settings
            </p>
          </div>
        </div>

        {/* Settings Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex flex-wrap gap-2 p-4">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-[#4ECDC4] text-white shadow-md'
                      : 'text-gray-600 hover:text-[#4ECDC4] hover:bg-gray-50'
                  }`}
                >
                  <Icon path={tab.icon} size={0.8} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Profile & Account */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiAccount} size={1} className="text-[#4ECDC4]" />
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="full-name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Full Name
                        </label>
                        <input
                          id="full-name"
                          type="text"
                          defaultValue="Admin User"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          defaultValue="admin@cliniio.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="role"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Role
                        </label>
                        <input
                          id="role"
                          type="text"
                          defaultValue="Administrator"
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiShield} size={1} className="text-[#4ECDC4]" />
                      Security
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="current-password"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Current Password
                        </label>
                        <input
                          id="current-password"
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="new-password"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          New Password
                        </label>
                        <input
                          id="new-password"
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="2fa"
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                        <label htmlFor="2fa" className="ml-2 text-sm text-gray-700">
                          Enable Two-Factor Authentication
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon path={mdiBell} size={1} className="text-[#4ECDC4]" />
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Email Notifications</span>
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={e =>
                          setNotifications({ ...notifications, email: e.target.checked })
                        }
                        className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">SMS Notifications</span>
                      <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={e =>
                          setNotifications({ ...notifications, sms: e.target.checked })
                        }
                        className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Push Notifications</span>
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={e =>
                          setNotifications({ ...notifications, push: e.target.checked })
                        }
                        className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon path={mdiPalette} size={1} className="text-[#4ECDC4]" />
                    Preferences
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="theme-select"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Theme
                      </label>
                      <select
                        id="theme-select"
                        value={theme}
                        onChange={e => setTheme(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="language-select"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Language
                      </label>
                      <select
                        id="language-select"
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Administration */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiAccountGroup} size={1} className="text-[#4ECDC4]" />
                      User Management
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Total Users</span>
                        <span className="text-lg font-semibold text-[#4ECDC4]">24</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Active Users</span>
                        <span className="text-lg font-semibold text-green-600">18</span>
                      </div>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3db8b0] transition-colors">
                        <Icon path={mdiPlus} size={0.8} />
                        Add New User
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiOfficeBuilding} size={1} className="text-[#4ECDC4]" />
                      Department Management
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Departments</span>
                        <span className="text-lg font-semibold text-[#4ECDC4]">6</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Emergency</span>
                          <span className="text-gray-500">8 users</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>ICU</span>
                          <span className="text-gray-500">6 users</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Operating Room</span>
                          <span className="text-gray-500">4 users</span>
                        </div>
                      </div>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3db8b0] transition-colors">
                        <Icon path={mdiPlus} size={0.8} />
                        Add Department
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon path={mdiKey} size={1} className="text-[#4ECDC4]" />
                    Access Control
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Admin Access</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Full system access</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Content Management</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Create and edit content</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">User Management</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Manage users and roles</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Management */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiBookOpen} size={1} className="text-[#4ECDC4]" />
                      Library Content
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Total Courses</span>
                        <span className="text-lg font-semibold text-[#4ECDC4]">156</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Procedures</span>
                        <span className="text-lg font-semibold text-[#4ECDC4]">89</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">SDS Sheets</span>
                        <span className="text-lg font-semibold text-[#4ECDC4]">234</span>
                      </div>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3db8b0] transition-colors">
                        <Icon path={mdiPlus} size={0.8} />
                        Add Content
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiEye} size={1} className="text-[#4ECDC4]" />
                      Content Approval
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <span className="text-sm text-yellow-800">Pending Review</span>
                        <span className="text-lg font-semibold text-yellow-600">12</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <span>New Safety Protocol</span>
                          <button className="text-[#4ECDC4] hover:text-[#3db8b0]">Review</button>
                        </div>
                        <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <span>Updated Procedure</span>
                          <button className="text-[#4ECDC4] hover:text-[#3db8b0]">Review</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon path={mdiCog} size={1} className="text-[#4ECDC4]" />
                    AI Recommendations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="ai-algorithm"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        AI Algorithm
                      </label>
                      <select
                        id="ai-algorithm"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                      >
                        <option>Role-based Recommendations</option>
                        <option>Learning History</option>
                        <option>Performance-based</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="update-frequency"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Update Frequency
                      </label>
                      <select
                        id="update-frequency"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                      >
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Learning & Training */}
            {activeTab === 'learning' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiSchool} size={1} className="text-[#4ECDC4]" />
                      Progress Tracking
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="completion-requirement"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Completion Requirement (%)
                        </label>
                        <input
                          id="completion-requirement"
                          type="number"
                          defaultValue="80"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="certificate-expiry"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Certificate Expiry (months)
                        </label>
                        <input
                          id="certificate-expiry"
                          type="number"
                          defaultValue="12"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiChartLine} size={1} className="text-[#4ECDC4]" />
                      Gamification
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Points System</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Badges</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Leaderboards</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Streaks</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Environmental Cleaning */}
            {activeTab === 'cleaning' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiSpray} size={1} className="text-[#4ECDC4]" />
                      Room Management
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Total Rooms</span>
                        <span className="text-lg font-semibold text-[#4ECDC4]">45</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Active Schedules</span>
                        <span className="text-lg font-semibold text-green-600">38</span>
                      </div>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3db8b0] transition-colors">
                        <Icon path={mdiPlus} size={0.8} />
                        Add Room
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiCog} size={1} className="text-[#4ECDC4]" />
                      Task Templates
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <span>Standard Cleaning</span>
                          <button className="text-[#4ECDC4] hover:text-[#3db8b0]">Edit</button>
                        </div>
                        <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <span>Deep Cleaning</span>
                          <button className="text-[#4ECDC4] hover:text-[#3db8b0]">Edit</button>
                        </div>
                        <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <span>Emergency Cleaning</span>
                          <button className="text-[#4ECDC4] hover:text-[#3db8b0]">Edit</button>
                        </div>
                      </div>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3db8b0] transition-colors">
                        <Icon path={mdiPlus} size={0.8} />
                        Create Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Management */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiPackageVariant} size={1} className="text-[#4ECDC4]" />
                      Stock Management
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Total Items</span>
                        <span className="text-lg font-semibold text-[#4ECDC4]">1,234</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                        <span className="text-sm text-red-800">Low Stock Alerts</span>
                        <span className="text-lg font-semibold text-red-600">8</span>
                      </div>
                      <div>
                        <label
                          htmlFor="low-stock-threshold"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Low Stock Threshold (%)
                        </label>
                        <input
                          id="low-stock-threshold"
                          type="number"
                          defaultValue="15"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiCog} size={1} className="text-[#4ECDC4]" />
                      Scanner Configuration
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="scanner-type"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Scanner Type
                        </label>
                        <select
                          id="scanner-type"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                        >
                          <option>Barcode</option>
                          <option>QR Code</option>
                          <option>Both</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Auto-sync with Database</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Room Management */}
                <RoomManagement />
              </div>
            )}

            {/* Sterilization */}
            {activeTab === 'sterilization' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiThermometer} size={1} className="text-[#4ECDC4]" />
                      Equipment Configuration
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="default-temperature"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Default Temperature (°C)
                        </label>
                        <input
                          id="default-temperature"
                          type="number"
                          defaultValue="121"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="default-pressure"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Default Pressure (PSI)
                        </label>
                        <input
                          id="default-pressure"
                          type="number"
                          defaultValue="15"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="cycle-duration"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Cycle Duration (minutes)
                        </label>
                        <input
                          id="cycle-duration"
                          type="number"
                          defaultValue="30"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiCog} size={1} className="text-[#4ECDC4]" />
                      Compliance Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">FDA Standards</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">ISO Standards</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Auto Documentation</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Configuration */}
            {activeTab === 'system-config' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiDatabase} size={1} className="text-[#4ECDC4]" />
                      Database Settings
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="backup-frequency"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Backup Frequency
                        </label>
                        <select
                          id="backup-frequency"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                        >
                          <option>Daily</option>
                          <option>Weekly</option>
                          <option>Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="data-retention"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Data Retention (days)
                        </label>
                        <input
                          id="data-retention"
                          type="number"
                          defaultValue="365"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                        />
                      </div>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3db8b0] transition-colors">
                        <Icon path={mdiContentSave} size={0.8} />
                        Create Backup
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiCog} size={1} className="text-[#4ECDC4]" />
                      System Health
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <span className="text-sm text-green-800">System Status</span>
                        <span className="text-lg font-semibold text-green-600">Healthy</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Uptime</span>
                        <span className="text-lg font-semibold text-[#4ECDC4]">99.9%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Last Restart</span>
                        <span className="text-sm text-gray-500">2 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics & Reporting */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiChartLine} size={1} className="text-[#4ECDC4]" />
                      Dashboard Configuration
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Performance Metrics</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">User Activity</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Learning Progress</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">System Alerts</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiContentSave} size={1} className="text-[#4ECDC4]" />
                      Report Generation
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="report-format"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Report Format
                        </label>
                        <select
                          id="report-format"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                        >
                          <option>PDF</option>
                          <option>Excel</option>
                          <option>CSV</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="report-schedule"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Schedule
                        </label>
                        <select
                          id="report-schedule"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                        >
                          <option>Weekly</option>
                          <option>Monthly</option>
                          <option>Quarterly</option>
                        </select>
                      </div>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3db8b0] transition-colors">
                        <Icon path={mdiContentSave} size={0.8} />
                        Generate Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Prototype Settings */}
            {activeTab === 'prototype' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiTestTube} size={1} className="text-[#4ECDC4]" />
                      Demo Data
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Show Sample Data</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Demo Mode</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                        <Icon path={mdiRefresh} size={0.8} />
                        Reset to Defaults
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path={mdiCog} size={1} className="text-[#4ECDC4]" />
                      Feature Flags
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Experimental Features</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Beta Testing</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Debug Mode</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon path={mdiChartLine} size={1} className="text-[#4ECDC4]" />
                    Performance Testing
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="load-test-users"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Load Test Users
                      </label>
                      <input
                        id="load-test-users"
                        type="number"
                        defaultValue="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="stress-test-duration"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Stress Test Duration (min)
                      </label>
                      <input
                        id="stress-test-duration"
                        type="number"
                        defaultValue="30"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                      <Icon path={mdiTestTube} size={0.8} />
                      Run Stress Test
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button className="flex items-center gap-2 px-6 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3db8b0] transition-colors">
                <Icon path={mdiContentSave} size={0.8} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Settings;
