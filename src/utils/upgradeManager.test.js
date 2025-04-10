import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Decimal from 'decimal.js';
import * as numbers from './numbers'; // Import all to potentially spy later if needed
import {
  loadUpgrades,
  calculateUpgradeCost,
  purchaseUpgrade,
  calculatePixelRate,
  calculatePixelMultiplier,
  calculateClickPower,
  calculateClickMultiplier,
  calculateTotalPixelGeneration,
  calculateTotalClickPower,
  calculateClickCriticalChance,
  calculateClickCriticalMultiplier,
  applyClickWithCritical,
  calculateAutoClickRate,
} from './upgradeManager';

// Mock the upgradeSchema module
vi.mock('./upgradeSchema', () => ({
  validateUpgrade: vi.fn(),
}));
// Import the mocked function after mocking
import { validateUpgrade } from './upgradeSchema';

// --- Test Data ---
const mockUpgradesData = [
  { name: 'Basic Click', type: 'click', cost: '10', value: '1', costFactor: '1.1', maxLevel: 10 },
  { name: 'Basic Rate', type: 'rate', cost: '50', value: '0.5', costFactor: '1.2' },
  { name: 'Click Multi', type: 'click_multiplier', cost: '100', value: '0.1', costFactor: '1.5' },
  { name: 'Rate Multi', type: 'rate_multiplier', cost: '200', value: '0.2', costFactor: '1.6' },
  { name: 'Crit Chance', type: 'click_critical', cost: '500', value: '0.01', costFactor: '2' }, // 1% chance per level
  { name: 'Crit Multi', type: 'click_critical_multiplier', cost: '1000', value: '0.5', costFactor: '2.5' }, // Adds 0.5 to multiplier base per level
  { name: 'Automation', type: 'click_automation', cost: '5000', value: '0.1', costFactor: '3' }, // 0.1 clicks/sec per level
  { name: 'Invalid Upgrade', type: 'invalid', cost: '1', value: '1', costFactor: '1' }, // To test validation
];

// Helper to create a fresh copy of upgrades for tests
const getFreshUpgrades = () => JSON.parse(JSON.stringify(mockUpgradesData)).map(u => ({
  ...u,
  id: u.name.toLowerCase().replace(/\s+/g, '-'), // Simulate ID generation if needed
  level: 0,
  purchased: false,
}));

// --- Tests ---
describe('Upgrade Manager', () => {
  let upgrades;
  let mathRandomSpy;

  beforeEach(() => {
    // Reset mocks and data before each test
    vi.clearAllMocks();
    upgrades = getFreshUpgrades();
    // Default mock for validateUpgrade: return true for valid types, false for invalid
    validateUpgrade.mockImplementation(upgrade => upgrade.type !== 'invalid');
    // Mock Math.random
    mathRandomSpy = vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    // Restore original Math.random
    mathRandomSpy.mockRestore();
  });

  // --- loadUpgrades ---
  describe('loadUpgrades', () => {
    it('should load and validate upgrades, adding default properties', () => {
      const loaded = loadUpgrades(JSON.parse(JSON.stringify(mockUpgradesData))); // Use copy

      expect(validateUpgrade).toHaveBeenCalledTimes(mockUpgradesData.length);
      expect(loaded.length).toBe(mockUpgradesData.length - 1); // Excludes invalid one

      loaded.forEach(upgrade => {
        expect(upgrade).toHaveProperty('id');
        expect(upgrade).toHaveProperty('level', 0);
        expect(upgrade).toHaveProperty('purchased', false);
        expect(upgrade.id).toBe(upgrade.name.toLowerCase().replace(/\s+/g, '-'));
      });
    });

    it('should filter out upgrades failing validation', () => {
      validateUpgrade.mockReturnValue(false); // Make all fail
      const loaded = loadUpgrades(JSON.parse(JSON.stringify(mockUpgradesData)));
      expect(loaded.length).toBe(0);
    });
  });

  // --- calculateUpgradeCost ---
  describe('calculateUpgradeCost', () => {
    it('should return base cost for level 0', () => {
      const upgrade = upgrades.find(u => u.name === 'Basic Click');
      expect(calculateUpgradeCost(upgrade)).toBe('10');
    });

    it('should calculate cost for level 1 using the complex formula', () => {
      const upgrade = upgrades.find(u => u.name === 'Basic Click');
      upgrade.level = 1;
      // Formula: base * (factor^3^level) * (1.5^(level^2)) * (1.1^(level^3))
      // 10 * (1.1^3^1) * (1.5^(1^2)) * (1.1^(1^3))
      // 10 * (1.331^1) * (1.5^1) * (1.1^1)
      // 10 * 1.331 * 1.5 * 1.1 = 21.9615
      const expectedCost = numbers.multiply(numbers.multiply(numbers.multiply('10', '1.331'), '1.5'), '1.1');
      expect(calculateUpgradeCost(upgrade)).toBe(expectedCost.toString());
    });

    it('should calculate cost for higher levels', () => {
      const upgrade = upgrades.find(u => u.name === 'Basic Rate'); // cost 50, factor 1.2
      upgrade.level = 3;
      // factor^3 = 1.2^3 = 1.728
      // baseScaling = 1.728^3 = 5.159780352
      // squared = 3^2 = 9
      // cubed = 3^3 = 27
      // additionalScaling1 = 1.5^9 = 38.443359375
      // additionalScaling2 = 1.1^27 = ~13.10969
      // cost = 50 * 5.15978 * 38.44336 * 13.10969 = ~129849.5
      const cubedFactor = numbers.power(upgrade.costFactor, 3);
      const baseScaling = numbers.power(cubedFactor, upgrade.level);
      const squared = numbers.multiply(upgrade.level, upgrade.level);
      const cubed = numbers.multiply(squared, upgrade.level);
      const additionalScaling1 = numbers.power('1.5', squared);
      const additionalScaling2 = numbers.power('1.1', cubed);
      const expectedCost = numbers.multiply(numbers.multiply(numbers.multiply(upgrade.cost, baseScaling), additionalScaling1), additionalScaling2);

      // Use Decimal for comparison due to potential precision differences
      expect(new Decimal(calculateUpgradeCost(upgrade)).toFixed(5))
        .toBe(new Decimal(expectedCost).toFixed(5));
    });
  });

  // --- purchaseUpgrade ---
  describe('purchaseUpgrade', () => {
    let upgrade;
    beforeEach(() => {
      upgrade = upgrades.find(u => u.name === 'Basic Click'); // cost 10
    });

    it('should succeed if pixels are sufficient and not max level', () => {
      const pixelsAvailable = '100';
      const cost = calculateUpgradeCost(upgrade); // Should be 10
      const result = purchaseUpgrade(upgrade, pixelsAvailable);

      expect(result.success).toBe(true);
      expect(upgrade.level).toBe(1);
      expect(upgrade.purchased).toBe(true);
      expect(result.newPixelsTotal).toBe(numbers.subtract(pixelsAvailable, cost).toString());
      expect(result.spentPixels.toString()).toBe(cost.toString());
    });

    it('should fail if pixels are insufficient', () => {
      const pixelsAvailable = '5';
      const initialLevel = upgrade.level;
      const result = purchaseUpgrade(upgrade, pixelsAvailable);

      expect(result.success).toBe(false);
      expect(upgrade.level).toBe(initialLevel);
      expect(upgrade.purchased).toBe(false);
      expect(result.newPixelsTotal).toBe(pixelsAvailable);
      expect(result.spentPixels).toBeUndefined();
    });

    it('should fail if upgrade is at max level', () => {
      upgrade.level = 10; // Max level is 10
      const pixelsAvailable = '1000000'; // More than enough cost
      const result = purchaseUpgrade(upgrade, pixelsAvailable);

      expect(result.success).toBe(false);
      expect(upgrade.level).toBe(10);
      expect(result.newPixelsTotal).toBe(pixelsAvailable);
      expect(result.spentPixels).toBeUndefined();
    });
  });

  // --- Calculation Functions ---
  describe('Calculation Functions', () => {
    beforeEach(() => {
      // Set some levels for testing calculations
      upgrades.find(u => u.name === 'Basic Click').level = 5; // value 1
      upgrades.find(u => u.name === 'Basic Rate').level = 10; // value 0.5
      upgrades.find(u => u.name === 'Click Multi').level = 2; // value 0.1
      upgrades.find(u => u.name === 'Rate Multi').level = 3; // value 0.2
      upgrades.find(u => u.name === 'Crit Chance').level = 15; // value 0.01 -> 0.15 (15%)
      upgrades.find(u => u.name === 'Crit Multi').level = 4; // value 0.5 -> base 2 * (1+0.5*4) = 6
      upgrades.find(u => u.name === 'Automation').level = 20; // value 0.1 -> 2 clicks/sec
    });

    it('calculatePixelRate: should sum rates correctly', () => {
      // Basic Rate: 0.5 * 10 = 5
      expect(calculatePixelRate(upgrades)).toBe('5');
    });

    it('calculatePixelMultiplier: should multiply multipliers correctly', () => {
      // Rate Multi: (1 + 0.2*3) = 1.6
      // Total = 1 (default) * 1.6 = 1.6
      expect(calculatePixelMultiplier(upgrades)).toBe('1.6');
    });

    it('calculateClickPower: should sum click powers correctly', () => {
      // Base 1 + Basic Click: 1 * 5 = 5. Total = 1 + 5 = 6
      expect(calculateClickPower(upgrades)).toBe('6');
    });

    it('calculateClickMultiplier: should multiply click multipliers correctly', () => {
      // Click Multi: (1 + 0.1*2) = 1.2
      // Total = 1 (default) * 1.2 = 1.2
      expect(calculateClickMultiplier(upgrades)).toBe('1.2');
    });

    it('calculateTotalPixelGeneration: should combine rate and multiplier', () => {
      // Rate (5) * Multiplier (1.6) = 8
      expect(calculateTotalPixelGeneration(upgrades)).toBe('8');
    });

    it('calculateTotalClickPower: should combine click power and multiplier', () => {
      // Power (6) * Multiplier (1.2) = 7.2
      expect(calculateTotalClickPower(upgrades)).toBe('7.2');
    });

    it('calculateClickCriticalChance: should sum crit chances', () => {
      // Crit Chance: 0.01 * 15 = 0.15
      expect(calculateClickCriticalChance(upgrades)).toBe('0.15');
    });

     it('calculateClickCriticalMultiplier: should calculate crit multiplier based on code logic', () => {
      // Code logic: base * reduce((total, upg) => mult(total, add('1', mult(upg.value, upg.level))))
      // Level 4, value 0.5 -> contribution = 0.5 * 4 = 2. Multiplier = (1 + 2) = 3.
      // Total = 2 (base) * 3 = 6.
      expect(calculateClickCriticalMultiplier(upgrades)).toBe('6');
    });

    it('calculateAutoClickRate: should sum auto click rates', () => {
      // Automation: 0.1 * 20 = 2
      expect(calculateAutoClickRate(upgrades)).toBe('2');
    });
  });

  // --- applyClickWithCritical ---
  describe('applyClickWithCritical', () => {
    beforeEach(() => {
      // Setup upgrades for critical tests
      upgrades = getFreshUpgrades();
      upgrades.find(u => u.name === 'Basic Click').level = 1; // Power: 1 + 1*1 = 2
      upgrades.find(u => u.name === 'Click Multi').level = 1; // Multi: 1 * (1 + 0.1*1) = 1.1
      // Total Base Click Power = 2 * 1.1 = 2.2
    });

    it('should return base power if no crit chance upgrades', () => {
      const result = applyClickWithCritical(upgrades);
      expect(result.clickPower).toBe('2.2');
      expect(result.critical.happened).toBe(false);
      expect(result.critical.hits).toBe(0);
      expect(result.critical.multiplier).toBe('1');
    });

    it('should return base power if crit chance < 100% and random roll fails', () => {
      upgrades.find(u => u.name === 'Crit Chance').level = 10; // 10% chance (0.1)
      mathRandomSpy.mockReturnValue(0.5); // Fail (0.5 > 0.1)

      const result = applyClickWithCritical(upgrades);
      expect(result.clickPower).toBe('2.2');
      expect(result.critical.happened).toBe(false);
    });

    it('should return multiplied power if crit chance < 100% and random roll succeeds', () => {
      upgrades.find(u => u.name === 'Crit Chance').level = 10; // 10% chance (0.1)
      upgrades.find(u => u.name === 'Crit Multi').level = 1; // Multiplier: base 2 * (1 + 0.5*1) = 3
      mathRandomSpy.mockReturnValue(0.05); // Success (0.05 < 0.1)

      const result = applyClickWithCritical(upgrades);
      // Expected power = 2.2 * 3 = 6.6
      expect(result.clickPower).toBe('6.6');
      expect(result.critical.happened).toBe(true);
      expect(result.critical.hits).toBe(1);
      expect(result.critical.multiplier).toBe('3'); // Crit Multiplier value
    });

    it('should guarantee one hit and calculate power if crit chance is 150%', () => {
      upgrades.find(u => u.name === 'Crit Chance').level = 150; // 150% chance (1.5)
      upgrades.find(u => u.name === 'Crit Multi').level = 1; // Multiplier = 3
      mathRandomSpy.mockReturnValue(0.8); // First hit guaranteed (0.8 < 1), second fails (0.8 > 0.5)

      const result = applyClickWithCritical(upgrades);
      // Expected power = 2.2 * 3 = 6.6
      expect(result.clickPower).toBe('6.6');
      expect(result.critical.happened).toBe(true);
      expect(result.critical.hits).toBe(1);
      expect(result.critical.multiplier).toBe('3');
    });

    it('should stack hits and calculate power if crit chance > 100% and random rolls succeed', () => {
      upgrades.find(u => u.name === 'Crit Chance').level = 250; // 250% chance (2.5)
      upgrades.find(u => u.name === 'Crit Multi').level = 1; // Multiplier = 3
      // First hit guaranteed (random < 1)
      // Second hit check: remaining chance = 1.5. Check random < 1.
      // Third hit check: remaining chance = 0.5. Check random < 0.5.
      mathRandomSpy.mockReturnValueOnce(0.7); // Guarantees first hit
      mathRandomSpy.mockReturnValueOnce(0.4); // Guarantees second hit (0.4 < 1)
      mathRandomSpy.mockReturnValueOnce(0.2); // Guarantees third hit (0.2 < 0.5)

      const result = applyClickWithCritical(upgrades);
      // Expected multiplier = 3^3 = 27
      // Expected power = 2.2 * 27 = 59.4
      expect(result.clickPower).toBe('59.4');
      expect(result.critical.happened).toBe(true);
      expect(result.critical.hits).toBe(3);
      expect(result.critical.multiplier).toBe('27');
    });
  });
});