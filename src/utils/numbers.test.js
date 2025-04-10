import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import {
  toDecimal,
  formatNumber,
  add,
  multiply,
  gte,
  subtract,
  power,
} from './numbers';

// Configure Decimal.js for consistency if needed (though numbers.js already does)
// Decimal.set({ precision: 20, rounding: 4 });

describe('Numbers Utility', () => {
  describe('toDecimal', () => {
    it('should convert a number to a Decimal object', () => {
      const result = toDecimal(123.45);
      expect(result).toBeInstanceOf(Decimal);
      expect(result.toString()).toBe('123.45');
    });

    it('should convert a string number to a Decimal object', () => {
      const result = toDecimal('987.65');
      expect(result).toBeInstanceOf(Decimal);
      expect(result.toString()).toBe('987.65');
    });

    it('should handle zero', () => {
      const result = toDecimal(0);
      expect(result).toBeInstanceOf(Decimal);
      expect(result.isZero()).toBe(true);
    });

    it('should handle large numbers', () => {
      const result = toDecimal('1e20');
      expect(result).toBeInstanceOf(Decimal);
      expect(result.toExponential()).toBe('1e+20');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers less than 1000 without suffix', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(123)).toBe('123');
      expect(formatNumber(999)).toBe('999');
      expect(formatNumber(123.45)).toBe('123.45');
      expect(formatNumber(123.456)).toBe('123.46'); // Checks rounding
      expect(formatNumber(12.00)).toBe('12'); // Removes trailing zeros
    });

    it('should format numbers with K suffix', () => {
      expect(formatNumber(1000)).toBe('1K');
      expect(formatNumber(1234)).toBe('1.23K');
      expect(formatNumber(9999)).toBe('10K'); // Should round up
      expect(formatNumber(10000)).toBe('10K');
      expect(formatNumber(123456)).toBe('123.46K');
      expect(formatNumber(999999)).toBe('1000K'); // Rounds up within the current suffix
    });

    it('should format numbers with M suffix', () => {
      expect(formatNumber(1000000)).toBe('1M');
      expect(formatNumber(1234567)).toBe('1.23M');
      expect(formatNumber(999999999)).toBe('1000M'); // Rounds up within the current suffix
    });

    it('should format numbers with B suffix', () => {
      expect(formatNumber(1000000000)).toBe('1B');
      expect(formatNumber(1234567890)).toBe('1.23B');
    });

    it('should format numbers with T suffix', () => {
      expect(formatNumber('1e12')).toBe('1T');
      expect(formatNumber('1.23e12')).toBe('1.23T');
    });

    // Add more tests for other suffixes if needed, e.g., Qa, Qi etc.
    it('should format numbers with Qa suffix', () => {
      expect(formatNumber('1e15')).toBe('1Qa');
      expect(formatNumber('5.67e15')).toBe('5.67Qa');
    });

    it('should format numbers with Qi suffix', () => {
      expect(formatNumber('1e18')).toBe('1Qi');
      expect(formatNumber('8.91e18')).toBe('8.91Qi');
    });

    it('should handle very large numbers with scientific notation', () => {
      // The suffixes array has 58 elements (index 0 to 57)
      // 1000^58 = 1e174
      expect(formatNumber('1e174')).toBe('1e+174');
      expect(formatNumber('1.2345e180')).toBe('1.23e+180');
      expect(formatNumber('9.999e200')).toBe('1e+201'); // Check rounding in scientific
    });

    it('should accept string inputs', () => {
      expect(formatNumber('1500')).toBe('1.5K');
      expect(formatNumber('2000000')).toBe('2M');
    });

    it('should handle Decimal inputs', () => {
      expect(formatNumber(new Decimal(5000))).toBe('5K');
      expect(formatNumber(new Decimal('3.14159e9'))).toBe('3.14B');
    });
  });

  describe('add', () => {
    it('should add two numbers precisely', () => {
      const result = add(0.1, 0.2);
      expect(result.toString()).toBe('0.3');
    });

    it('should add large numbers precisely', () => {
      const result = add('1e20', '2e20');
      expect(result.toExponential()).toBe('3e+20');
    });

    it('should handle mixed number and string inputs', () => {
      const result = add(100, '200.5');
      expect(result.toString()).toBe('300.5');
    });
  });

  describe('multiply', () => {
    it('should multiply two numbers precisely', () => {
      const result = multiply(0.1, 0.2);
      expect(result.toString()).toBe('0.02');
    });

    it('should multiply large numbers precisely', () => {
      const result = multiply('1.5e10', '2e5');
      expect(result.toExponential()).toBe('3e+15');
    });

    it('should handle mixed number and string inputs', () => {
      const result = multiply(10, '1.23');
      expect(result.toString()).toBe('12.3');
    });
  });

  describe('gte', () => {
    it('should return true if a >= b', () => {
      expect(gte(10, 5)).toBe(true);
      expect(gte(10, 10)).toBe(true);
      expect(gte('10.1', 10)).toBe(true);
      expect(gte('1e10', '1e10')).toBe(true);
    });

    it('should return false if a < b', () => {
      expect(gte(5, 10)).toBe(false);
      expect(gte('9.99', 10)).toBe(false);
      expect(gte('1e10', '1.1e10')).toBe(false);
    });

    it('should handle mixed number and string inputs', () => {
      expect(gte(100, '99.9')).toBe(true);
      expect(gte('100', 99.9)).toBe(true);
      expect(gte(100, '100.1')).toBe(false);
      expect(gte('100', 100.1)).toBe(false);
    });
  });

  describe('subtract', () => {
    it('should subtract two numbers precisely', () => {
      const result = subtract(0.3, 0.1);
      expect(result.toString()).toBe('0.2');
    });

    it('should subtract large numbers precisely', () => {
      const result = subtract('3e20', '1e20');
      expect(result.toExponential()).toBe('2e+20');
    });

    it('should handle mixed number and string inputs', () => {
      const result = subtract(500, '100.5');
      expect(result.toString()).toBe('399.5');
    });

    it('should result in negative numbers correctly', () => {
      const result = subtract(10, 20);
      expect(result.toString()).toBe('-10');
    });
  });

  describe('power', () => {
    it('should calculate the power precisely', () => {
      const result = power(2, 3); // 2^3
      expect(result.toString()).toBe('8');
    });

    it('should handle fractional exponents', () => {
      const result = power(16, 0.5); // sqrt(16)
      expect(result.toString()).toBe('4');
    });

    it('should handle large bases and exponents', () => {
      const result = power(10, 6); // 10^6
      expect(result.toString()).toBe('1000000');
      const result2 = power('1.1', 2); // 1.1^2
      expect(result2.toString()).toBe('1.21');
    });

    it('should handle mixed number and string inputs', () => {
      const result = power('3', 2);
      expect(result.toString()).toBe('9');
      const result2 = power(4, '0.5');
      expect(result2.toString()).toBe('2');
    });
  });
});