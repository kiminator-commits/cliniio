import { FROZEN_SECURITY_CONSTANTS } from '@/constants/securityConstants';

describe('Security Constants', () => {
  test('should have all required rate limit constants', () => {
    expect(FROZEN_SECURITY_CONSTANTS.RATE_LIMIT.MAX_ATTEMPTS).toBe(5);
    expect(FROZEN_SECURITY_CONSTANTS.RATE_LIMIT.LOCKOUT_DURATION_MINUTES).toBe(
      15
    );
    expect(FROZEN_SECURITY_CONSTANTS.RATE_LIMIT.WINDOW_SIZE_MINUTES).toBe(15);
  });

  test('should have validation timing constants', () => {
    expect(FROZEN_SECURITY_CONSTANTS.VALIDATION.DEBOUNCE_MS).toBe(500);
  });

  test('should have security threshold constants', () => {
    expect(FROZEN_SECURITY_CONSTANTS.THRESHOLDS.MIN_PASSWORD_LENGTH).toBe(8);
    expect(FROZEN_SECURITY_CONSTANTS.THRESHOLDS.MAX_LOGIN_ATTEMPTS).toBe(5);
  });

  test('should have password strength constants', () => {
    expect(FROZEN_SECURITY_CONSTANTS.PASSWORD_STRENGTH.MIN_LENGTH).toBe(8);
    expect(FROZEN_SECURITY_CONSTANTS.PASSWORD_STRENGTH.GOOD_LENGTH).toBe(12);
    expect(FROZEN_SECURITY_CONSTANTS.PASSWORD_STRENGTH.EXCELLENT_LENGTH).toBe(
      16
    );
    expect(FROZEN_SECURITY_CONSTANTS.PASSWORD_STRENGTH.MAX_SCORE).toBe(5);
  });

  test('should be readonly (const assertion)', () => {
    // Test that the object is deeply readonly
    expect(() => {
      // This should throw because the object is frozen/readonly
      (
        FROZEN_SECURITY_CONSTANTS as Record<string, unknown>
      ).RATE_LIMIT.MAX_ATTEMPTS = 10;
    }).toThrow();

    // Verify the value wasn't actually changed
    expect(FROZEN_SECURITY_CONSTANTS.RATE_LIMIT.MAX_ATTEMPTS).toBe(5);
  });
});
