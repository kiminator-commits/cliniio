// Removed unused import: LeaderboardUser

export const DEFAULT_RANK = 99;

export const DEFAULT_AVAILABLE_POINTS = 250;

export const ITEMS_PER_PAGE = 3;

export const DEFAULT_LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export const HOME_MENU_BUTTON_CLASS =
  'fixed bottom-4 left-12 z-50 bg-[#4ECDC4] text-white rounded-r-lg p-3 shadow-md border-none cursor-pointer';

export const HOME_UI_CONSTANTS = {
  // Layout
  NAV_BAR_MARGIN_TOP: 4,
  NAV_BAR_MARGIN_LEFT_DRAWER_OPEN: 24,
  NAV_BAR_MARGIN_LEFT_DRAWER_CLOSED: 72,

  // Navigation Dimensions
  NAVIGATION: {
    DRAWER_OPEN_WIDTH: '16rem', // 256px
    DRAWER_CLOSED_WIDTH: '4rem', // 64px
    MIN_HEIGHT: '100vh',
    TRANSITION_DURATION: '300ms',
  },

  // Default Values
  DEFAULT_RANK: 1,

  // Menu Button
  MENU_BUTTON: {
    BOTTOM: 4,
    LEFT: 12,
    Z_INDEX: 50,
    BACKGROUND: '#4ECDC4',
    COLOR: 'white',
    BORDER_RADIUS: '0 8px 8px 0',
    PADDING: '12px 8px',
    BOX_SHADOW: '0 2px 8px rgba(0,0,0,0.1)',
    ICON_SIZE: 20,
  },

  // Colors
  COLORS: {
    PRIMARY: '#4ECDC4',
    PRIMARY_LIGHT: '#38b2ac',
    PRIMARY_BG: 'teal-100',
    BORDER: 'teal-400',
    BORDER_OPACITY: 50,
    TEXT_PRIMARY: '#38b2ac',
    TEXT_SECONDARY: 'text-gray-600',
    BG_GRADIENT: {
      FROM: 'blue-50',
      TO: 'teal-50',
    },
  },

  // Spacing
  SPACING: {
    PADDING: 6,
    GAP: 6,
    MARGIN_TOP: 6,
  },

  // Border
  BORDER: {
    LEFT_WIDTH: 4,
    RADIUS: 'lg',
  },

  // Shadow
  SHADOW: 'md',

  // Card Classes
  taskCard:
    'bg-white rounded-lg shadow-md p-6 border-l-4 border-[#4ECDC4] border-opacity-50',
  sectionBox:
    'bg-white rounded-lg shadow-md p-6 border-l-4 border-[#4ECDC4] border-opacity-50',
} as const;
