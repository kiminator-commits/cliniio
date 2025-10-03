interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  lockedUntil: number;
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();
  private readonly maxAttempts = 5;
  private readonly lockoutDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
  private readonly progressiveDelays = [0, 1000, 2000, 5000, 10000]; // Delays in milliseconds

  /**
   * Check if an email is rate limited
   */
  isRateLimited(email: string): boolean {
    const entry = this.attempts.get(email);
    if (!entry) return false;

    // Check if account is locked
    if (entry.lockedUntil > Date.now()) {
      return true;
    }

    // Reset if lockout period has passed
    if (entry.lockedUntil > 0 && entry.lockedUntil <= Date.now()) {
      this.attempts.delete(email);
      return false;
    }

    return false;
  }

  /**
   * Record a failed login attempt
   */
  recordFailedAttempt(email: string): {
    isLocked: boolean;
    remainingAttempts: number;
    lockoutTime?: number;
  } {
    const entry = this.attempts.get(email) || {
      attempts: 0,
      lastAttempt: 0,
      lockedUntil: 0,
    };

    entry.attempts += 1;
    entry.lastAttempt = Date.now();

    // Check if we should lock the account
    if (entry.attempts >= this.maxAttempts) {
      entry.lockedUntil = Date.now() + this.lockoutDuration;
      this.attempts.set(email, entry);

      return {
        isLocked: true,
        remainingAttempts: 0,
        lockoutTime: entry.lockedUntil,
      };
    }

    this.attempts.set(email, entry);

    return {
      isLocked: false,
      remainingAttempts: this.maxAttempts - entry.attempts,
    };
  }

  /**
   * Record a successful login and reset attempts
   */
  recordSuccess(email: string): void {
    this.attempts.delete(email);
  }

  /**
   * Get remaining attempts for an email
   */
  getRemainingAttempts(email: string): number {
    const entry = this.attempts.get(email);
    if (!entry) return this.maxAttempts;

    if (entry.lockedUntil > Date.now()) {
      return 0; // Account is locked
    }

    return Math.max(0, this.maxAttempts - entry.attempts);
  }

  /**
   * Get lockout time remaining for an email
   */
  getLockoutTimeRemaining(email: string): number {
    const entry = this.attempts.get(email);
    if (!entry || entry.lockedUntil <= Date.now()) return 0;

    return Math.max(0, entry.lockedUntil - Date.now());
  }

  /**
   * Format lockout time for display
   */
  formatLockoutTime(email: string): string {
    const remaining = this.getLockoutTimeRemaining(email);
    if (remaining === 0) return '';

    const minutes = Math.ceil(remaining / (60 * 1000));
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  /**
   * Clean up old entries (optional - for memory management)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [email, entry] of this.attempts.entries()) {
      // Remove entries older than 1 hour
      if (entry.lastAttempt < now - 60 * 60 * 1000) {
        this.attempts.delete(email);
      }
    }
  }
}

// Create a singleton instance
export const rateLimiter = new RateLimiter();

// Clean up old entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      rateLimiter.cleanup();
    },
    5 * 60 * 1000
  );
}
