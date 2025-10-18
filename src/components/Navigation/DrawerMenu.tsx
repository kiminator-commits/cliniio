import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaFlask,
  FaBoxOpen,
  FaBroom,
  FaBookOpen,
  FaChartBar,
  FaCog,
  FaUser,
} from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import { SecureAuthService } from '../../services/secureAuthService';

interface DrawerMenuProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  hasComplianceIssues?: boolean;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onOpen,
  onClose,
  hasComplianceIssues = false,
}) => {
  const { currentUser, getUserDisplayName, isLoading, clearUserData } =
    useUser();
  const [showLogout, setShowLogout] = useState(false);
  const userRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  // Show loading state while user data is being fetched
  if (isLoading) {
    return (
      <div className="bg-white shadow-lg transition-all duration-300 flex flex-col min-h-screen w-16 sm:w-20 md:w-20">
        <div className="flex-1 pt-4 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4ECDC4]"></div>
        </div>
      </div>
    );
  }

  // Navigate to the selected page without closing the drawer
  const handleNavigation = (path: string) => {
    navigate(path);
    // Menu stays open during navigation
  };

  const menuItems = [
    { path: '/home', icon: FaHome, label: 'Home' },
    { path: '/sterilization', icon: FaFlask, label: 'Sterilization' },
    { path: '/inventory', icon: FaBoxOpen, label: 'Inventory' },
    {
      path: '/environmental-clean',
      icon: FaBroom,
      label: 'Environmental Clean',
    },
    { path: '/knowledge-hub', icon: FaBookOpen, label: 'Knowledge Hub' },
    { path: '/intelligence', icon: FaChartBar, label: 'Intelligence' },
    { path: '/settings', icon: FaCog, label: 'Settings' },
  ];

  return (
    <div
      className={`bg-white shadow-lg transition-all duration-300 flex flex-col min-h-screen ${
        isOpen ? 'w-full sm:w-64 md:w-64' : 'w-16 sm:w-20 md:w-20'
      }`}
    >
      <div className="flex-1 pt-4 overflow-y-auto">
        {isOpen ? (
          <div className="px-4 sm:px-6 pb-6 flex justify-between items-center">
            <div className="relative">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#4ECDC4]">
                Cliniio
              </h1>
            </div>
            <button
              onClick={onClose}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClose();
                }
              }}
              className="p-2 hover:bg-gray-50 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:ring-opacity-50 touch-manipulation"
              aria-label="Collapse navigation menu (Press Enter or Space)"
              title="Collapse menu (Enter/Space)"
              tabIndex={0}
            >
              <svg
                className="w-5 h-5 text-gray-600 hover:text-[#4ECDC4] transition-colors duration-200 transform hover:scale-110 active:scale-95"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 12H5"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="px-4 sm:px-6 pb-6 flex justify-center items-center">
            <button
              onClick={onOpen}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpen();
                }
              }}
              className="p-2 hover:bg-gray-50 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:ring-opacity-50 touch-manipulation"
              aria-label="Expand navigation menu (Press Enter or Space)"
              title="Expand menu (Enter/Space)"
              tabIndex={0}
            >
              <svg
                className="w-5 h-5 text-gray-600 hover:text-[#4ECDC4] transition-colors duration-200 transform hover:scale-110 active:scale-95"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
        <nav>
          {menuItems.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => handleNavigation(path)}
              className={`flex items-center transition-colors duration-200 w-full text-left touch-manipulation relative ${
                isOpen
                  ? 'px-4 sm:px-6 py-4'
                  : 'px-3 sm:px-4 py-4 justify-center'
              } ${
                currentPath === path
                  ? 'bg-[#4ECDC4] bg-opacity-10 border-r-4 border-[#4ECDC4] text-[#4ECDC4]'
                  : 'text-[#5b5b5b] hover:bg-gray-50 hover:text-[#4ECDC4]'
              }`}
              aria-label={isOpen ? label : `${label} page`}
              title={isOpen ? undefined : label}
            >
              <Icon
                size={20}
                className={`${isOpen ? 'mr-4' : ''} ${currentPath === path ? 'text-[#4ECDC4]' : 'text-gray-400'}`}
                aria-hidden="true"
              />
              {isOpen && (
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`font-medium whitespace-nowrap ${currentPath === path ? 'text-[#4ECDC4]' : 'text-[#5b5b5b]'}`}
                  >
                    {label}
                  </span>
                  {/* Compliance warning badge for Settings */}
                  {path === '/settings' && hasComplianceIssues && (
                    <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ml-2">
                      !
                    </div>
                  )}
                </div>
              )}
              {/* Compliance warning badge for Settings (collapsed menu) */}
              {!isOpen && path === '/settings' && hasComplianceIssues && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  !
                </div>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div
        className={`${isOpen ? 'p-3 sm:p-4' : 'p-1'} border-t border-gray-200 bg-white sticky bottom-0`}
      >
        <div className="relative">
          <button
            ref={userRef}
            className={`flex items-center space-x-4 w-full text-left ${!isOpen ? 'justify-center mb-2' : 'mb-4'}`}
            onClick={() => setShowLogout((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setShowLogout((v) => !v);
              }
            }}
            aria-expanded={showLogout}
            aria-haspopup="true"
            aria-label={
              isOpen
                ? `User menu for ${currentUser ? getUserDisplayName() : 'User'}`
                : 'User profile menu'
            }
          >
            <div className="w-8 h-8 rounded-full bg-[#4ECDC4] flex items-center justify-center overflow-hidden">
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                  onLoad={() =>
                    console.log(
                      'Avatar image loaded successfully in DrawerMenu'
                    )
                  }
                  onError={(e) =>
                    console.error(
                      'Avatar image failed to load in DrawerMenu:',
                      e
                    )
                  }
                />
              ) : (
                <FaUser size={20} className="text-white" />
              )}
            </div>
            {isOpen && (
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500">
                  {currentUser?.role || 'User'}
                </p>
              </div>
            )}
          </button>
          {showLogout && isOpen && (
            <div
              role="menu"
              aria-labelledby="user-menu"
              style={{
                position: 'absolute',
                bottom: 56,
                left: 0,
                background: 'white',
                borderRadius: 8,
                boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
                minWidth: 180,
                zIndex: 100,
                padding: 12,
                textAlign: 'center',
              }}
            >
              <button
                role="menuitem"
                className="px-4 py-2 bg-[#4ECDC4] text-white rounded hover:bg-[#38b2ac] w-full"
                onClick={async () => {
                  console.log('🚪 DrawerMenu: Logout button clicked');
                  try {
                    console.log('🚪 DrawerMenu: Starting logout process...');

                    // Clear user data from UserContext FIRST (before clearing auth tokens)
                    console.log('🚪 DrawerMenu: Calling clearUserData()...');
                    clearUserData();

                    // Wait a moment to ensure UserContext is cleared
                    await new Promise((resolve) => setTimeout(resolve, 100));

                    // Clear login store data
                    console.log(
                      '🚪 DrawerMenu: Calling login store reset()...'
                    );
                    const { useLoginStore } = await import(
                      '../../stores/useLoginStore'
                    );
                    await useLoginStore.getState().reset();

                    // Call auth service logout
                    console.log(
                      '🚪 DrawerMenu: Calling auth service logout()...'
                    );
                    const authService = new SecureAuthService();
                    await authService.logout();

                    console.log(
                      '🚪 DrawerMenu: Logout successful, navigating to login'
                    );
                    navigate('/login');
                    setShowLogout(false);

                    // Force page reload to clear console and reset all services
                    console.log(
                      '🔄 DrawerMenu: Reloading page for clean state...'
                    );
                    window.location.reload();
                  } catch (error) {
                    console.error('🚪 DrawerMenu: Logout failed:', error);
                    // Still navigate to login even if logout fails
                    navigate('/login');
                    setShowLogout(false);

                    // Force page reload even on error to ensure clean state
                    console.log(
                      '🔄 DrawerMenu: Reloading page after logout error...'
                    );
                    window.location.reload();
                  }
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
