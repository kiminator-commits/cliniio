/**
 * Utility functions for device detection
 */

/**
 * Check if the current device is a mobile device
 * @returns boolean indicating if the device is mobile
 */
export const isMobileDevice = (): boolean => {
  // Check for mobile user agent
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
    'mobile',
    'tablet',
  ];

  const isMobileByUserAgent = mobileKeywords.some((keyword) =>
    userAgent.includes(keyword)
  );

  // Check for touch capability (additional mobile indicator)
  const hasTouchScreen =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Check screen size (mobile devices typically have smaller screens)
  const isSmallScreen = window.innerWidth <= 768;

  // Check for mobile-specific features
  const hasMobileFeatures =
    'orientation' in window || 'deviceorientation' in window;

  return (
    isMobileByUserAgent ||
    (hasTouchScreen && isSmallScreen) ||
    hasMobileFeatures
  );
};

/**
 * Check if the device supports camera access
 * @returns Promise<boolean> indicating if camera is available
 */
export const hasCameraAccess = async (): Promise<boolean> => {
  try {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false;
    }

    // Check if video devices are available
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === 'videoinput'
    );

    return videoDevices.length > 0;
  } catch (error) {
    console.warn('Error checking camera access:', error);
    return false;
  }
};

/**
 * Get device type description
 * @returns string describing the device type
 */
export const getDeviceType = (): string => {
  if (isMobileDevice()) {
    return 'mobile';
  }
  return 'desktop';
};
