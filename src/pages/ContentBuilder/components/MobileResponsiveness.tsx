import React, { useEffect, useState, useRef, useCallback } from 'react';
import Icon from '@mdi/react';
import {
  mdiPhone,
  mdiTablet,
  mdiMonitor,
  mdiViewGrid,
  mdiViewList,
  mdiFullscreen,
  mdiFullscreenExit,
  mdiGesture,
} from '@mdi/js';

// Device detection hook
export const useDeviceDetection = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(
    'desktop'
  );
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    'landscape'
  );

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({ width, height });

      // Device type detection
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }

      // Orientation detection
      setOrientation(width > height ? 'landscape' : 'portrait');

      // Touch device detection
      setIsTouchDevice(
        'ontouchstart' in window || navigator.maxTouchPoints > 0
      );
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  return {
    deviceType,
    isTouchDevice,
    screenSize,
    orientation,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
  };
};

// Touch gesture hook
export const useTouchGestures = (
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void
) => {
  const [gesture, setGesture] = useState<string>('');
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null
  );
  const touchEndRef = useRef<{ x: number; y: number; time: number } | null>(
    null
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling during gesture
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      touchEndRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      const start = touchStartRef.current;
      const end = touchEndRef.current;

      const deltaX = end.x - start.x;
      const deltaY = end.y - start.y;
      const deltaTime = end.time - start.time;

      // Minimum distance and time for gesture recognition
      const minDistance = 50;
      const maxTime = 300;

      if (
        deltaTime < maxTime &&
        (Math.abs(deltaX) > minDistance || Math.abs(deltaY) > minDistance)
      ) {
        let direction: 'left' | 'right' | 'up' | 'down' | '';

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }

        setGesture(direction);
        onSwipe?.(direction);
      }

      // Reset touch references
      touchStartRef.current = null;
      touchEndRef.current = null;
    },
    [onSwipe]
  );

  return {
    gesture,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};

// Responsive layout hook
export const useResponsiveLayout = () => {
  const [layout, setLayout] = useState<'grid' | 'list' | 'compact'>('grid');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleLayout = useCallback(() => {
    setLayout((prev) => {
      switch (prev) {
        case 'grid':
          return 'list';
        case 'list':
          return 'compact';
        case 'compact':
          return 'grid';
        default:
          return 'grid';
      }
    });
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  return {
    layout,
    isFullscreen,
    sidebarCollapsed,
    toggleLayout,
    toggleFullscreen,
    toggleSidebar,
  };
};

// Mobile-optimized toolbar component
export const MobileToolbar: React.FC = () => {
  const { deviceType, isTouchDevice } = useDeviceDetection();
  const {
    layout,
    toggleLayout,
    isFullscreen,
    toggleFullscreen,
    sidebarCollapsed,
    toggleSidebar,
  } = useResponsiveLayout();

  if (!isTouchDevice && deviceType === 'desktop') {
    return null; // Don't show on desktop non-touch devices
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex items-center justify-around p-3">
        <button
          onClick={toggleSidebar}
          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={`${sidebarCollapsed ? 'Expand' : 'Collapse'} sidebar`}
        >
          <Icon path={mdiViewGrid} size={1.2} className="text-gray-600" />
          <span className="text-xs text-gray-600">Menu</span>
        </button>

        <button
          onClick={toggleLayout}
          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={`Switch to ${layout === 'grid' ? 'list' : layout === 'list' ? 'compact' : 'grid'} layout`}
        >
          <Icon
            path={
              layout === 'grid'
                ? mdiViewList
                : layout === 'list'
                  ? mdiViewGrid
                  : mdiViewList
            }
            size={1.2}
            className="text-gray-600"
          />
          <span className="text-xs text-gray-600 capitalize">{layout}</span>
        </button>

        <button
          onClick={toggleFullscreen}
          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={`${isFullscreen ? 'Exit' : 'Enter'} fullscreen mode`}
        >
          <Icon
            path={isFullscreen ? mdiFullscreenExit : mdiFullscreen}
            size={1.2}
            className="text-gray-600"
          />
          <span className="text-xs text-gray-600">Full</span>
        </button>
      </div>
    </div>
  );
};

// Touch-friendly button component
export const TouchButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: string;
  className?: string;
}> = ({
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  className = '',
}) => {
  const { isTouchDevice } = useDeviceDetection();

  const getSizeClasses = () => {
    if (isTouchDevice) {
      // Larger touch targets on mobile
      switch (size) {
        case 'sm':
          return 'px-4 py-3 text-sm min-h-[44px]';
        case 'lg':
          return 'px-8 py-4 text-lg min-h-[56px]';
        default:
          return 'px-6 py-3 text-base min-h-[48px]';
      }
    } else {
      // Standard sizes on desktop
      switch (size) {
        case 'sm':
          return 'px-3 py-1.5 text-sm';
        case 'lg':
          return 'px-6 py-3 text-lg';
        default:
          return 'px-4 py-2 text-base';
      }
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#4ECDC4] text-white hover:bg-[#3db8b0] active:bg-[#2da3a0]';
      case 'secondary':
        return 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300';
      case 'ghost':
        return 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200';
      default:
        return 'bg-[#4ECDC4] text-white hover:bg-[#3db8b0] active:bg-[#2da3a0]';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isTouchDevice ? 'touch-manipulation' : ''}
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
      style={{
        // Ensure minimum touch target size
        minHeight: isTouchDevice ? '44px' : undefined,
        minWidth: isTouchDevice ? '44px' : undefined,
      }}
    >
      {icon && (
        <Icon
          path={icon}
          size={size === 'sm' ? 0.8 : size === 'lg' ? 1.2 : 1}
        />
      )}
      {children}
    </button>
  );
};

// Responsive grid component
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const { deviceType } = useDeviceDetection();

  const getGridClasses = () => {
    switch (deviceType) {
      case 'mobile':
        return 'grid-cols-1 gap-3';
      case 'tablet':
        return 'grid-cols-2 gap-4';
      case 'desktop':
        return 'grid-cols-3 gap-6';
      default:
        return 'grid-cols-1 gap-3';
    }
  };

  return (
    <div className={`grid ${getGridClasses()} ${className}`}>{children}</div>
  );
};

// Mobile-optimized form component
export const MobileForm: React.FC<{
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}> = ({ children, onSubmit, className = '' }) => {
  const { isTouchDevice } = useDeviceDetection();

  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-4 ${isTouchDevice ? 'space-y-6' : 'space-y-4'} ${className}`}
    >
      {children}
    </form>
  );
};

// Touch-friendly input component
export const TouchInput: React.FC<{
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
}> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  required = false,
  error,
  className = '',
}) => {
  const { isTouchDevice } = useDeviceDetection();

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`
          w-full px-4 py-3 border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent
          ${error ? 'border-red-300' : ''}
          ${isTouchDevice ? 'text-base' : 'text-sm'}
          ${className}
        `}
        style={{
          // Ensure touch-friendly input size
          minHeight: isTouchDevice ? '48px' : undefined,
          fontSize: isTouchDevice ? '16px' : undefined, // Prevents zoom on iOS
        }}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Swipeable content component
export const SwipeableContent: React.FC<{
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
}> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = '',
}) => {
  const handleSwipe = useCallback(
    (direction: 'left' | 'right' | 'up' | 'down') => {
      switch (direction) {
        case 'left':
          onSwipeLeft?.();
          break;
        case 'right':
          onSwipeRight?.();
          break;
        case 'up':
          onSwipeUp?.();
          break;
        case 'down':
          onSwipeDown?.();
          break;
      }
    },
    [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]
  );

  const { touchHandlers } = useTouchGestures(handleSwipe);

  return (
    <div {...touchHandlers} className={`touch-pan-y ${className}`}>
      {children}
    </div>
  );
};

// Device indicator component (for development/testing)
export const DeviceIndicator: React.FC = () => {
  const { deviceType, isTouchDevice, screenSize, orientation } =
    useDeviceDetection();

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-black bg-opacity-75 text-white text-xs p-2 rounded-lg font-mono">
      <div className="flex items-center gap-2 mb-1">
        <Icon
          path={
            deviceType === 'mobile'
              ? mdiPhone
              : deviceType === 'tablet'
                ? mdiTablet
                : mdiMonitor
          }
          size={0.8}
        />
        <span className="uppercase">{deviceType}</span>
        {isTouchDevice && <Icon path={mdiGesture} size={0.8} />}
      </div>
      <div>
        {screenSize.width} × {screenSize.height}
      </div>
      <div className="uppercase">{orientation}</div>
    </div>
  );
};

// Export all components and hooks (already exported above)
