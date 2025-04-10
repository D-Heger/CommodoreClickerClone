import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateUpgrade } from './upgradeSchema'; // Import the function to test

// --- Test Data ---

const validUpgradeBase = {
  name: 'Test Upgrade',
  description: 'A test description',
  cost: '100',
  costFactor: '1.5',
  type: 'click', // Valid type
  value: '10',
};

// --- Tests ---
describe('Upgrade Schema Validation', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    // Spy on console.error before each test
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); // Suppress actual console output
  });

  afterEach(() => {
    // Restore console.error after each test
    consoleErrorSpy.mockRestore();
  });

  it('should return true for a valid upgrade object', () => {
    const upgrade = { ...validUpgradeBase };
    expect(validateUpgrade(upgrade)).toBe(true);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return true for a valid upgrade object with optional fields', () => {
    const upgrade = {
      ...validUpgradeBase,
      id: 'test-upgrade-1',
      maxLevel: 50,
    };
    expect(validateUpgrade(upgrade)).toBe(true);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return false and log error if required field "name" is missing', () => {
    const upgrade = { ...validUpgradeBase };
    delete upgrade.name;
    expect(validateUpgrade(upgrade)).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid upgrade:', expect.any(Array));
  });

  it('should return false and log error if required field "cost" is missing', () => {
    const upgrade = { ...validUpgradeBase };
    delete upgrade.cost;
    expect(validateUpgrade(upgrade)).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

   it('should return false and log error if required field "type" is missing', () => {
    const upgrade = { ...validUpgradeBase };
    delete upgrade.type;
    expect(validateUpgrade(upgrade)).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

   it('should return false and log error if required field "value" is missing', () => {
    const upgrade = { ...validUpgradeBase };
    delete upgrade.value;
    expect(validateUpgrade(upgrade)).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should return false and log error if "cost" has incorrect type (number instead of string)', () => {
    const upgrade = {
      ...validUpgradeBase,
      cost: 100, // Invalid type
    };
    expect(validateUpgrade(upgrade)).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should return false and log error if "costFactor" has incorrect type', () => {
    const upgrade = {
      ...validUpgradeBase,
      costFactor: 1.5, // Invalid type
    };
    expect(validateUpgrade(upgrade)).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

   it('should return false and log error if "value" has incorrect type', () => {
    const upgrade = {
      ...validUpgradeBase,
      value: 10, // Invalid type
    };
    expect(validateUpgrade(upgrade)).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should return false and log error if "type" is not in the enum', () => {
    const upgrade = {
      ...validUpgradeBase,
      type: 'invalid_type', // Not in enum
    };
    expect(validateUpgrade(upgrade)).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should return false and log error if optional "maxLevel" has incorrect type', () => {
    const upgrade = {
      ...validUpgradeBase,
      maxLevel: 'fifty', // Invalid type
    };
    expect(validateUpgrade(upgrade)).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

   it('should return false and log error if optional "id" has incorrect type', () => {
    const upgrade = {
      ...validUpgradeBase,
      id: 123, // Invalid type
    };
    expect(validateUpgrade(upgrade)).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should allow valid types from the enum', () => {
    const types = [
      'click', 'click_multiplier', 'click_automation', 'click_critical',
      'click_critical_multiplier', 'rate', 'rate_multiplier',
      'click_autobuy', 'rate_autobuy' // Include TODO types as they are in schema
    ];
    types.forEach(type => {
      const upgrade = { ...validUpgradeBase, type: type };
      expect(validateUpgrade(upgrade), `Type "${type}" should be valid`).toBe(true);
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});