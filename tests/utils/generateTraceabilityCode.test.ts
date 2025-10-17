import {
  generateTraceabilityCode,
  getCurrentTraceabilityCode,
  isValidTraceabilityCode,
} from '../../src/utils/generateTraceabilityCode';
import { describe, test, expect } from 'vitest';

describe('Traceability Code Generation', () => {
  test('should generate a valid traceability code format', () => {
    const code = generateTraceabilityCode();
    expect(isValidTraceabilityCode(code)).toBe(true);
  });

  test('should generate codes in format Letter + Number', () => {
    const code = generateTraceabilityCode();
    expect(code).toMatch(/^[A-Z][1-9]$/);
  });

  test('should generate consistent codes for the same day', () => {
    const code1 = generateTraceabilityCode();
    const code2 = generateTraceabilityCode();
    expect(code1).toBe(code2);
  });

  test('should validate correct code formats', () => {
    expect(isValidTraceabilityCode('A1')).toBe(true);
    expect(isValidTraceabilityCode('B5')).toBe(true);
    expect(isValidTraceabilityCode('Z9')).toBe(true);
  });

  test('should reject invalid code formats', () => {
    expect(isValidTraceabilityCode('A0')).toBe(false); // Number must be 1-9
    expect(isValidTraceabilityCode('a1')).toBe(false); // Letter must be uppercase
    expect(isValidTraceabilityCode('AA')).toBe(false); // Must be letter + number
    expect(isValidTraceabilityCode('1A')).toBe(false); // Must start with letter
    expect(isValidTraceabilityCode('A10')).toBe(false); // Must be single digit
  });

  test('getCurrentTraceabilityCode should return same as generateTraceabilityCode', () => {
    const code1 = generateTraceabilityCode();
    const code2 = getCurrentTraceabilityCode();
    expect(code1).toBe(code2);
  });
});
