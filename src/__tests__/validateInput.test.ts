import { validateInput, isNotEmpty, isSafeText } from '@/utils/validation';

describe('validateInput', () => {
  it('returns error for empty input', () => {
    const errors = validateInput('', [isNotEmpty]);
    expect(errors).toContain('Field cannot be empty');
  });

  it('returns error for unsafe characters', () => {
    const errors = validateInput('<script>', [isSafeText]);
    expect(errors).toContain('Input contains unsafe characters');
  });

  it('returns no errors for valid input', () => {
    const errors = validateInput('Clean text', [isNotEmpty, isSafeText]);
    expect(errors.length).toBe(0);
  });
});
