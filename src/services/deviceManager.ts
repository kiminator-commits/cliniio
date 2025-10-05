import { supabase } from '@/lib/supabaseClient';

export interface TrustedDevice {
  id: string;
  userId: string;
  deviceFingerprint: string;
  deviceName: string;
  lastUsed: string;
  createdAt: string;
  isActive: boolean;
}

export interface DeviceFingerprint {
  fingerprint: string;
  deviceName: string;
}

class DeviceManager {
  private static instance: DeviceManager | null = null;
  private readonly STORAGE_KEY = 'cliniio_trusted_devices';
  private readonly DEVICE_NAME_KEY = 'cliniio_device_name';

  static getInstance(): DeviceManager {
    if (!DeviceManager.instance) {
      DeviceManager.instance = new DeviceManager();
    }
    return DeviceManager.instance;
  }

  /**
   * Generate a device fingerprint
   */
  generateDeviceFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
      }

      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL(),
      ].join('|');

      return btoa(fingerprint)
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 32);
    } catch {
      return 'unknown_device';
    }
  }

  /**
   * Get a friendly device name
   */
  getDeviceName(): string {
    const stored = localStorage.getItem(this.DEVICE_NAME_KEY);
    if (stored) return stored;

    // Generate a friendly name based on browser and OS
    const userAgent = navigator.userAgent;
    let deviceName = 'Unknown Device';

    if (userAgent.includes('Windows')) {
      deviceName = 'Windows Device';
    } else if (userAgent.includes('Mac')) {
      deviceName = 'Mac Device';
    } else if (userAgent.includes('Linux')) {
      deviceName = 'Linux Device';
    } else if (userAgent.includes('Android')) {
      deviceName = 'Android Device';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      deviceName = 'iOS Device';
    }

    // Add browser info
    if (userAgent.includes('Chrome')) {
      deviceName += ' (Chrome)';
    } else if (userAgent.includes('Firefox')) {
      deviceName += ' (Firefox)';
    } else if (userAgent.includes('Safari')) {
      deviceName += ' (Safari)';
    } else if (userAgent.includes('Edge')) {
      deviceName += ' (Edge)';
    }

    // Store for future use
    localStorage.setItem(this.DEVICE_NAME_KEY, deviceName);
    return deviceName;
  }

  /**
   * Store a trusted device
   */
  async storeTrustedDevice(
    userId: string,
    deviceFingerprint: string
  ): Promise<boolean> {
    try {
      const deviceName = this.getDeviceName();

      const { error } = await supabase.from('trusted_devices').upsert({
        user_id: userId,
        device_fingerprint: deviceFingerprint,
        device_name: deviceName,
        last_used: new Date().toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Failed to store trusted device:', error);
        return false;
      }

      // Also store locally for quick access
      this.storeDeviceLocally(deviceFingerprint, deviceName);

      return true;
    } catch (error) {
      console.error('Error storing trusted device:', error);
      return false;
    }
  }

  /**
   * Check if current device is trusted
   */
  async isDeviceTrusted(userId: string): Promise<boolean> {
    try {
      const deviceFingerprint = this.generateDeviceFingerprint();

      const { data, error } = await supabase
        .from('trusted_devices')
        .select('id, last_used, is_active')
        .eq('user_id', userId)
        .eq('device_fingerprint', deviceFingerprint)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return false;
      }

      // Update last used timestamp
      await this.updateLastUsed(data.id);

      return true;
    } catch (error) {
      console.error('Error checking trusted device:', error);
      return false;
    }
  }

  /**
   * Get all trusted devices for a user
   */
  async getTrustedDevices(userId: string): Promise<TrustedDevice[]> {
    try {
      const { data, error } = await supabase
        .from('trusted_devices')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_used', { ascending: false });

      if (error) {
        console.error('Failed to get trusted devices:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting trusted devices:', error);
      return [];
    }
  }

  /**
   * Remove a trusted device
   */
  async removeTrustedDevice(deviceId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trusted_devices')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', deviceId);

      if (error) {
        console.error('Failed to remove trusted device:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error removing trusted device:', error);
      return false;
    }
  }

  /**
   * Update last used timestamp
   */
  private async updateLastUsed(deviceId: string): Promise<void> {
    try {
      await supabase
        .from('trusted_devices')
        .update({
          last_used: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', deviceId);
    } catch (error) {
      console.error('Error updating last used:', error);
    }
  }

  /**
   * Store device info locally for quick access
   */
  private storeDeviceLocally(
    deviceFingerprint: string,
    deviceName: string
  ): void {
    try {
      const deviceInfo = {
        fingerprint: deviceFingerprint,
        name: deviceName,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(deviceInfo));
    } catch (error) {
      console.error('Error storing device locally:', error);
    }
  }

  /**
   * Get locally stored device info
   */
  getLocalDeviceInfo(): DeviceFingerprint | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const deviceInfo = JSON.parse(stored);

      // Check if it's not too old (30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const storedDate = new Date(deviceInfo.timestamp);

      if (storedDate < thirtyDaysAgo) {
        localStorage.removeItem(this.STORAGE_KEY);
        return null;
      }

      return deviceInfo;
    } catch (error) {
      console.error('Error getting local device info:', error);
      return null;
    }
  }

  /**
   * Clear all trusted devices for a user
   */
  async clearAllTrustedDevices(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trusted_devices')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to clear trusted devices:', error);
        return false;
      }

      // Clear local storage
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.DEVICE_NAME_KEY);

      return true;
    } catch (error) {
      console.error('Error clearing trusted devices:', error);
      return false;
    }
  }
}

// Export singleton instance
export const deviceManager = DeviceManager.getInstance();
export default deviceManager;
