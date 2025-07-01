import React, { useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaFlask,
  FaBoxOpen,
  FaBroom,
  FaBookOpen,
  FaCog,
  FaUser,
  FaChevronLeft,
} from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({ isOpen, onClose }) => {
  const { currentUser, getUserDisplayName } = useUser();
  const [showLogout, setShowLogout] = useState(false);
  const userRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  const menuItems = [
    { path: '/home', icon: FaHome, label: 'Home' },
    { path: '/sterilization', icon: FaFlask, label: 'Sterilization' },
    { path: '/inventory', icon: FaBoxOpen, label: 'Inventory' },
    { path: '/environmental-clean', icon: FaBroom, label: 'Environmental Clean' },
    { path: '/knowledge-hub', icon: FaBookOpen, label: 'Knowledge Hub' },
    { path: '/settings', icon: FaCog, label: 'Settings' },
  ];

  return (
    <div
      className={`bg-white shadow-lg transition-all duration-300 flex flex-col h-screen ${isOpen ? 'w-64' : 'w-16'}`}
    >
      <div className="flex-1 pt-4">
        <div className="px-6 pb-6 flex justify-between items-center">
          <div className="relative">
            <h1 className="text-3xl font-bold text-[#4ECDC4]">Cliniio</h1>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <FaChevronLeft size={20} className="text-gray-500" />
          </button>
        </div>
        <nav>
          {menuItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center px-6 py-4 transition-colors duration-200 ${
                currentPath === path
                  ? 'bg-[#4ECDC4] bg-opacity-10 border-r-4 border-[#4ECDC4] text-[#4ECDC4]'
                  : 'text-[#5b5b5b] hover:bg-gray-50 hover:text-[#4ECDC4]'
              }`}
            >
              <Icon
                size={20}
                className={`mr-4 ${currentPath === path ? 'text-[#4ECDC4]' : 'text-gray-400'}`}
              />
              <span
                className={`font-medium ${currentPath === path ? 'text-[#4ECDC4]' : 'text-[#5b5b5b]'}`}
              >
                {label}
              </span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4">
        <div className="relative">
          <button
            ref={userRef}
            className="flex items-center space-x-4 mb-4 w-full text-left"
            onClick={() => setShowLogout(v => !v)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                setShowLogout(v => !v);
              }
            }}
            aria-expanded={showLogout}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-[#4ECDC4] flex items-center justify-center">
              <FaUser size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{getUserDisplayName()}</p>
              <p className="text-xs text-gray-500">{currentUser?.role || 'User'}</p>
            </div>
          </button>
          {showLogout && (
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
                onClick={() => {
                  navigate('/login');
                  setShowLogout(false);
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
