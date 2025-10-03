import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useOnlineStatus } from './useOnlineStatus';

// Mock navigator
const mockNavigator = {
  onLine: true,
  connection: {
    type: 'wifi',
    effectiveType: '4g',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
};

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

// Mock window events
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

// Mock window if it doesn't exist
if (typeof window === 'undefined') {
  Object.defineProperty(global, 'window', {
    value: {
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    },
    writable: true,
  });
} else {
  window.addEventListener = mockAddEventListener;
  window.removeEventListener = mockRemoveEventListener;
}

describe('useOnlineStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigator.onLine = true;
  });

  it('should initialize with online status', () => {
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.lastOnline).toBeNull();
    expect(result.current.lastOffline).toBeNull();
    expect(result.current.connectionType).toBe('wifi');
    expect(result.current.effectiveType).toBe('4g');
  });

  it('should handle offline status', () => {
    mockNavigator.onLine = false;
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBe(false);
  });

  it('should provide connection message for online status', () => {
    const { result } = renderHook(() => useOnlineStatus());

    const message = result.current.getConnectionMessage();
    expect(message).toContain('Connection quality: Excellent');
  });

  it('should provide connection message for offline status', () => {
    mockNavigator.onLine = false;
    const { result } = renderHook(() => useOnlineStatus());

    const message = result.current.getConnectionMessage();
    expect(message).toContain("You're currently offline");
  });

  it('should handle different connection types', () => {
    mockNavigator.connection.effectiveType = '3g';
    const { result } = renderHook(() => useOnlineStatus());

    const message = result.current.getConnectionMessage();
    expect(message).toContain('Connection quality: Good');
  });

  it('should handle poor connection', () => {
    mockNavigator.connection.effectiveType = '2g';
    const { result } = renderHook(() => useOnlineStatus());

    const message = result.current.getConnectionMessage();
    expect(message).toContain('Connection quality: Poor');
  });

  it('should handle unknown connection type', () => {
    mockNavigator.connection.effectiveType = 'unknown';
    const { result } = renderHook(() => useOnlineStatus());

    const message = result.current.getConnectionMessage();
    expect(message).toContain('Connection status: Online');
  });

  it('should set up event listeners on mount', () => {
    renderHook(() => useOnlineStatus());

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    );
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    );
  });

  it('should clean up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useOnlineStatus());

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    );
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    );
  });

  it('should handle missing connection API', () => {
    delete (navigator as any).connection;

    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.connectionType).toBe('unknown');
    expect(result.current.effectiveType).toBe('unknown');
  });
});
