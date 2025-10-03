import { supabase } from './supabaseClient';

interface SessionConfig {
  sessionTimeout: number; // in minutes
  inactiveTimeout: number; // in minutes
  rememberMeDuration: number; // in days
}

class SessionManager {
  private sessionStartTime: number = Date.now();
  private lastActivityTime: number = Date.now();
  private inactivityTimer: NodeJS.Timeout | null = null;
  private sessionTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private isRememberMe: boolean = false;
  private config: SessionConfig = {
    sessionTimeout: 480, // 8 hours default
    inactiveTimeout: 30, // 30 minutes default
    rememberMeDuration: 7, // 7 days default
  };

  constructor() {
    this.loadConfig();
    this.setupActivityListeners();
    this.startTimers();
  }

  private loadConfig(): void {
    // Load from localStorage (set by SecuritySessionsSettings)
    const sessionTimeout = localStorage.getItem('cliniio_session_timeout');
    const inactiveTimeout = localStorage.getItem('cliniio_inactive_timeout');
    const rememberMeDuration = localStorage.getItem(
      'cliniio_remember_me_duration'
    );

    if (sessionTimeout) this.config.sessionTimeout = parseInt(sessionTimeout);
    if (inactiveTimeout)
      this.config.inactiveTimeout = parseInt(inactiveTimeout);
    if (rememberMeDuration)
      this.config.rememberMeDuration = parseInt(rememberMeDuration);

    // Check if user selected "Remember Me"
    this.isRememberMe = localStorage.getItem('cliniio_remember_me') === 'true';

    // Adjust session timeout based on remember me
    if (this.isRememberMe) {
      this.config.sessionTimeout = this.config.rememberMeDuration * 24 * 60; // Convert days to minutes
    }
  }

  private setupActivityListeners(): void {
    // Track user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    activityEvents.forEach((event) => {
      document.addEventListener(event, () => this.updateActivity(), {
        passive: true,
      });
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseTimers();
      } else {
        this.resumeTimers();
      }
    });
  }

  private updateActivity(): void {
    this.lastActivityTime = Date.now();
    this.resetInactivityTimer();
  }

  private startTimers(): void {
    this.startSessionTimer();
    this.startInactivityTimer();
  }

  private startSessionTimer(): void {
    if (this.sessionTimer) clearTimeout(this.sessionTimer);

    const sessionTimeoutMs = this.config.sessionTimeout * 60 * 1000;
    const timeElapsed = Date.now() - this.sessionStartTime;
    const remainingTime = Math.max(0, sessionTimeoutMs - timeElapsed);

    // Show warning 5 minutes before session expires
    const warningTime = Math.max(0, remainingTime - 5 * 60 * 1000);

    if (warningTime > 0) {
      this.warningTimer = setTimeout(() => {
        this.showSessionWarning(remainingTime);
      }, warningTime);
    }

    this.sessionTimer = setTimeout(() => {
      this.handleSessionExpired();
    }, remainingTime);
  }

  private startInactivityTimer(): void {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);

    const inactivityTimeoutMs = this.config.inactiveTimeout * 60 * 1000;

    this.inactivityTimer = setTimeout(() => {
      this.handleInactivityTimeout();
    }, inactivityTimeoutMs);
  }

  private resetInactivityTimer(): void {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    this.startInactivityTimer();
  }

  private pauseTimers(): void {
    if (this.sessionTimer) clearTimeout(this.sessionTimer);
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);
  }

  private resumeTimers(): void {
    this.startTimers();
  }

  private showSessionWarning(remainingTime: number): void {
    const minutes = Math.ceil(remainingTime / (60 * 1000));

    // Create warning notification
    const warningDiv = document.createElement('div');
    warningDiv.id = 'session-warning';
    warningDiv.className =
      'fixed top-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg z-50 max-w-sm';
    warningDiv.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">Session Expiring Soon</h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p>Your session will expire in ${minutes} minute${minutes !== 1 ? 's' : ''}.</p>
          </div>
          <div class="mt-4 flex space-x-3">
            <button id="extend-session" class="bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 rounded-md border border-yellow-200 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
              Extend Session
            </button>
            <button id="dismiss-warning" class="bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 rounded-md border border-yellow-200 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(warningDiv);

    // Add event listeners
    document.getElementById('extend-session')?.addEventListener('click', () => {
      this.extendSession();
      warningDiv.remove();
    });

    document
      .getElementById('dismiss-warning')
      ?.addEventListener('click', () => {
        warningDiv.remove();
      });

    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (warningDiv.parentNode) {
        warningDiv.remove();
      }
    }, 30000);
  }

  public async extendSession(): Promise<void> {
    try {
      // Refresh the session with Supabase
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Error extending session:', error);
        return;
      }

      if (data.session) {
        // Reset timers
        this.sessionStartTime = Date.now();
        this.startTimers();

        // Show success message
        this.showMessage('Session extended successfully!', 'success');
      }
    } catch (error) {
      console.error('Error extending session:', error);
      this.showMessage(
        'Failed to extend session. Please log in again.',
        'error'
      );
    }
  }

  private async handleSessionExpired(): Promise<void> {
    console.log('🚨 SESSION EXPIRED - redirecting to login');
    this.showMessage('Your session has expired. Please log in again.', 'error');

    // Wait a moment for user to see the message
    setTimeout(async () => {
      await this.logout();
    }, 2000);
  }

  private async handleInactivityTimeout(): Promise<void> {
    this.showMessage(
      'You have been inactive for too long. Logging out...',
      'warning'
    );

    // Wait a moment for user to see the message
    setTimeout(async () => {
      await this.logout();
    }, 2000);
  }

  private showMessage(
    message: string,
    type: 'success' | 'error' | 'warning'
  ): void {
    const colors = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    };

    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 ${colors[type]} border rounded-lg p-4 shadow-lg z-50 max-w-sm`;
    messageDiv.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 ${type === 'success' ? 'text-green-400' : type === 'error' ? 'text-red-400' : 'text-yellow-400'}" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">${message}</p>
        </div>
      </div>
    `;

    document.body.appendChild(messageDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }

  private async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.href = '/login';
    }
  }

  public updateConfig(newConfig: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.startTimers(); // Restart timers with new config
  }

  public setRememberMe(enabled: boolean): void {
    this.isRememberMe = enabled;
    localStorage.setItem('cliniio_remember_me', enabled.toString());

    if (enabled) {
      this.config.sessionTimeout = this.config.rememberMeDuration * 24 * 60;
    } else {
      this.config.sessionTimeout = 480; // Reset to 8 hours
    }

    this.startTimers();
  }

  public getSessionInfo(): {
    sessionStartTime: number;
    lastActivityTime: number;
    remainingTime: number;
    inactiveTimeRemaining: number;
  } {
    const now = Date.now();
    const sessionElapsed = now - this.sessionStartTime;
    const sessionRemaining = Math.max(
      0,
      this.config.sessionTimeout * 60 * 1000 - sessionElapsed
    );

    const inactiveElapsed = now - this.lastActivityTime;
    const inactiveRemaining = Math.max(
      0,
      this.config.inactiveTimeout * 60 * 1000 - inactiveElapsed
    );

    return {
      sessionStartTime: this.sessionStartTime,
      lastActivityTime: this.lastActivityTime,
      remainingTime: sessionRemaining,
      inactiveTimeRemaining: inactiveRemaining,
    };
  }

  public destroy(): void {
    if (this.sessionTimer) clearTimeout(this.sessionTimer);
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);

    // Remove event listeners
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];
    activityEvents.forEach((event) => {
      document.removeEventListener(event, () => this.updateActivity());
    });
  }
}

// Create singleton instance
export const sessionManager = new SessionManager();

// Export for use in components
export default sessionManager;
