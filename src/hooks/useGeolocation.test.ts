import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useGeolocation } from './useGeolocation';

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};

Object.defineProperty(global, 'navigator', {
  value: {
    geolocation: mockGeolocation,
  },
  writable: true,
});

describe('useGeolocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup the mock after clearing
    Object.defineProperty(global, 'navigator', {
      value: {
        geolocation: mockGeolocation,
      },
      writable: true,
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.latitude).toBeNull();
    expect(result.current.longitude).toBeNull();
    expect(result.current.accuracy).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle successful geolocation', async () => {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.getCurrentLocation();
    });

    expect(result.current.latitude).toBe(40.7128);
    expect(result.current.longitude).toBe(-74.006);
    expect(result.current.accuracy).toBe(10);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle geolocation permission denied error', () => {
    const mockError = {
      code: 1, // PERMISSION_DENIED
      message: 'User denied geolocation',
      PERMISSION_DENIED: 1,
    };

    mockGeolocation.getCurrentPosition.mockImplementation((_success, error) => {
      error(mockError);
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.getCurrentLocation();
    });

    expect(result.current.error).toBe(
      'Location access denied. Please enable location services.'
    );
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle geolocation position unavailable error', () => {
    const mockError = {
      code: 2, // POSITION_UNAVAILABLE
      message: 'Position unavailable',
      POSITION_UNAVAILABLE: 2,
    };

    mockGeolocation.getCurrentPosition.mockImplementation((_success, error) => {
      error(mockError);
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.getCurrentLocation();
    });

    expect(result.current.error).toBe('Location information unavailable.');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle geolocation timeout error', () => {
    const mockError = {
      code: 3, // TIMEOUT
      message: 'Timeout',
      TIMEOUT: 3,
    };

    mockGeolocation.getCurrentPosition.mockImplementation((_success, error) => {
      error(mockError);
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.getCurrentLocation();
    });

    expect(result.current.error).toBe('Location request timed out.');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle unknown geolocation error', () => {
    const mockError = {
      code: 999,
      message: 'Unknown error',
    };

    mockGeolocation.getCurrentPosition.mockImplementation((_success, error) => {
      error(mockError);
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.getCurrentLocation();
    });

    expect(result.current.error).toBe('Unknown error occurred');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle geolocation not supported', () => {
    // Mock navigator without geolocation
    Object.defineProperty(global, 'navigator', {
      value: {},
      writable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.getCurrentLocation();
    });

    expect(result.current.error).toBe(
      'Geolocation is not supported by this browser.'
    );
    expect(result.current.isLoading).toBe(false);
  });

  it('should clear location data', () => {
    const { result } = renderHook(() => useGeolocation());

    // First set some data
    act(() => {
      result.current.getCurrentLocation();
    });

    // Then clear it
    act(() => {
      result.current.clearLocation();
    });

    expect(result.current.latitude).toBeNull();
    expect(result.current.longitude).toBeNull();
    expect(result.current.accuracy).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should set loading state when getting location', () => {
    mockGeolocation.getCurrentPosition.mockImplementation(
      (_success, _error) => {
        // Don't call callbacks immediately to test loading state
      }
    );

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.getCurrentLocation();
    });

    expect(result.current.isLoading).toBe(true);
  });
});
