import React, { Suspense } from 'react';
import { DrawerMenu } from '../Navigation/DrawerMenu';
import { FaBars } from 'react-icons/fa';
import { ErrorBoundary } from '../ErrorBoundary';
import { HOME_UI_CONSTANTS } from '../../constants/homeUiConstants';

interface PageLayoutProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  description,
  children,
  headerAction,
}) => {
  const [drawerOpen, setDrawerOpen] = React.useState(true);

  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
          {drawerOpen && <DrawerMenu isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />}
          <div className="flex-1">
            {!drawerOpen && (
              <button
                onClick={() => setDrawerOpen(true)}
                style={{
                  position: 'fixed',
                  top: 24,
                  left: 12,
                  zIndex: 50,
                  background: '#4ECDC4',
                  color: 'white',
                  borderRadius: '0 8px 8px 0',
                  padding: '12px 8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label="Open main menu"
              >
                <FaBars size={20} />
              </button>
            )}
            {(title || description) && (
              <div
                className="mb-2 flex items-center justify-between"
                style={{
                  marginLeft: drawerOpen
                    ? HOME_UI_CONSTANTS.NAV_BAR_MARGIN_LEFT_DRAWER_OPEN
                    : HOME_UI_CONSTANTS.NAV_BAR_MARGIN_LEFT_DRAWER_CLOSED,
                  marginTop: HOME_UI_CONSTANTS.NAV_BAR_MARGIN_TOP,
                }}
              >
                <div>
                  {title && (
                    <h1 className="text-2xl md:text-3xl font-bold text-[#5b5b5b] mb-1">{title}</h1>
                  )}
                  {description && <p className="text-sm text-gray-500 mb-2">{description}</p>}
                </div>
                {headerAction && <div className="ml-4">{headerAction}</div>}
              </div>
            )}
            <div
              style={{
                marginLeft: drawerOpen
                  ? HOME_UI_CONSTANTS.NAV_BAR_MARGIN_LEFT_DRAWER_OPEN
                  : HOME_UI_CONSTANTS.NAV_BAR_MARGIN_LEFT_DRAWER_CLOSED,
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};
