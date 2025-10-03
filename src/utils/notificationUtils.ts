// Notification sound and vibration utilities

// Audio context for playing notification sounds
let audioContext: AudioContext | null = null;

// Initialize audio context
const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
  }
  return audioContext;
};

// Generate different notification sounds
export const generateNotificationSound = (
  soundType: string,
  volume: number = 50
) => {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  // Set volume (0-100 to 0-1)
  gainNode.gain.value = volume / 100;

  // Connect nodes
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Configure sound based on type
  switch (soundType) {
    case 'gentle-chime':
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
      oscillator.type = 'sine';
      break;

    case 'medical-alert':
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.15);
      oscillator.type = 'square';
      break;

    case 'soft-bell':
      oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
      oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
      oscillator.type = 'sine';
      break;

    case 'digital-beep':
      oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
      oscillator.type = 'square';
      break;

    case 'success-tone':
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
      oscillator.type = 'sine';
      break;

    case 'warning-sound':
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      oscillator.type = 'sawtooth';
      break;

    default:
      return;
  }

  // Play the sound
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.3);
};

// Vibration patterns for mobile devices
export const getVibrationPattern = (patternType: string): number[] => {
  switch (patternType) {
    case 'short-pulse':
      return [100];
    case 'double-tap':
      return [100, 50, 100];
    case 'long-pulse':
      return [300];
    case 'pattern':
      return [100, 50, 100, 50, 200];
    case 'off':
    default:
      return [];
  }
};

// Test vibration (if supported)
export const testVibration = (patternType: string) => {
  if ('vibrate' in navigator) {
    const pattern = getVibrationPattern(patternType);
    if (pattern.length > 0) {
      navigator.vibrate(pattern);
    }
  } else {
    console.log('Vibration not supported on this device');
  }
};

// Play notification sound
export const playNotificationSound = (
  soundType: string,
  volume: number = 50
) => {
  if (soundType === 'none') return;

  try {
    generateNotificationSound(soundType, volume);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

// Test full notification (sound + vibration)
export const testFullNotification = (preferences: {
  notifications: {
    sound: string;
    volume: number;
    vibration: string;
    vibrationEnabled: boolean;
  };
}) => {
  const { sound, volume, vibration, vibrationEnabled } =
    preferences.notifications;

  // Play sound
  if (sound && sound !== 'none') {
    playNotificationSound(sound, volume);
  }

  // Test vibration
  if (vibrationEnabled && vibration && vibration !== 'off') {
    testVibration(vibration);
  }
};
