import { evaluatePasswordStrength } from '../../utils/securityUtils';
// import { vi } from 'vitest';
import { SECURITY_CONSTANTS } from '../../constants/securityConstants';

describe('Password Strength Evaluation', () => {
  test('should return very weak for empty or short passwords', () => {
    expect(evaluatePasswordStrength('')).toEqual({
      score: 0,
      strength: 'very_weak',
      feedback: ['Password is too short'],
      suggestions: ['Use at least 8 characters'],
    });

    expect(evaluatePasswordStrength('123')).toEqual({
      score: 0,
      strength: 'very_weak',
      feedback: ['Password is too short'],
      suggestions: [
        `Use at least ${SECURITY_CONSTANTS.PASSWORD_STRENGTH.MIN_LENGTH} characters`,
      ],
    });
  });

  test('should give length bonuses correctly', () => {
    const mediumLength = evaluatePasswordStrength('password');
    expect(mediumLength.score).toBeGreaterThan(0);
    expect(mediumLength.strength).toBe('weak');

    const longPassword = evaluatePasswordStrength('verylongpassword');
    expect(longPassword.score).toBeGreaterThanOrEqual(mediumLength.score);
    expect(longPassword.feedback).toContain('Good length');
  });

  test('should give character variety bonuses', () => {
    const basicPassword = evaluatePasswordStrength('password123');
    const mixedPassword = evaluatePasswordStrength('Password123');
    const specialPassword = evaluatePasswordStrength('Password123!');

    expect(specialPassword.score).toBeGreaterThanOrEqual(mixedPassword.score);
    expect(mixedPassword.score).toBeGreaterThan(basicPassword.score);
  });

  test('should penalize common patterns', () => {
    const sequential = evaluatePasswordStrength('password123');
    const repeated = evaluatePasswordStrength('passworddddd');

    expect(sequential.feedback).toContain('Avoid common patterns');
    expect(repeated.feedback).toContain('Avoid repeated characters');
  });

  test('should provide helpful suggestions', () => {
    const weakPassword = evaluatePasswordStrength('password');

    expect(weakPassword.suggestions).toContain('Add uppercase letters');
    expect(weakPassword.suggestions).toContain('Add numbers');
    expect(weakPassword.suggestions).toContain('Add special characters');
    expect(weakPassword.suggestions).toContain(
      `Make it longer (${SECURITY_CONSTANTS.PASSWORD_STRENGTH.GOOD_LENGTH}+ characters)`
    );
  });

  test('should recognize strong passwords', () => {
    const strongPassword = evaluatePasswordStrength('MySecurePassword123!');

    expect(strongPassword.score).toBeGreaterThanOrEqual(4);
    expect(strongPassword.strength).toBe('strong');
    expect(strongPassword.feedback).toContain('Good password strength');
  });

  test('should handle very strong passwords', () => {
    const veryStrong = evaluatePasswordStrength('MyVerySecurePassword123!@#');

    expect(veryStrong.score).toBe(4);
    expect(veryStrong.strength).toBe('strong');
    expect(veryStrong.suggestions.length).toBeGreaterThan(0); // Should have suggestions for improvement
  });

  test('should provide appropriate feedback for different strengths', () => {
    const weak = evaluatePasswordStrength('password');
    const medium = evaluatePasswordStrength('Password123');
    const strong = evaluatePasswordStrength('MySecurePass123!');

    expect(weak.strength).toBe('weak');
    expect(medium.strength).toBe('strong');
    expect(strong.strength).toBe('strong');
  });
});
