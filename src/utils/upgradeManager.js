import { validateUpgrade } from './upgradeSchema';
import { add, multiply, subtract, gte, power } from './numbers';

// Default initial state for the pixel multiplier
const DEFAULT_MULTIPLIER = '1';

// Load and validate upgrades from a JSON file
export function loadUpgrades(upgradesData) {
  return upgradesData.filter(upgrade => {
    // Add an id if not provided
    if (!upgrade.id) {
      upgrade.id = upgrade.name.toLowerCase().replace(/\s+/g, '-');
    }
    
    // Add level and purchased properties
    upgrade.level = 0;
    upgrade.purchased = false;
    
    return validateUpgrade(upgrade);
  });
}

// Calculate the current cost of an upgrade based on its level
export function calculateUpgradeCost(upgrade) {
  return multiply(
    upgrade.cost,
    upgrade.level > 0 ? power(upgrade.costFactor, upgrade.level).toString() : '1'
  ).toString();
}

// Apply an upgrade purchase
export function purchaseUpgrade(upgrade, pixelsAvailable) {
  const currentCost = calculateUpgradeCost(upgrade);
  
  // Check if player can afford the upgrade
  if (!gte(pixelsAvailable, currentCost)) {
    return { success: false, newPixelsTotal: pixelsAvailable };
  }
  
  // Check if upgrade is at max level
  if (upgrade.maxLevel && upgrade.level >= upgrade.maxLevel) {
    return { success: false, newPixelsTotal: pixelsAvailable };
  }
  
  // Subtract cost from pixels
  const newPixelsTotal = subtract(pixelsAvailable, currentCost).toString();
  
  // Update upgrade
  upgrade.level += 1;
  upgrade.purchased = true;
  
  return { 
    success: true, 
    newPixelsTotal,
    spentPixels: currentCost
  };
}

// Calculate the current rate based on all rate upgrades
export function calculatePixelRate(upgrades) {
  return upgrades
    .filter(upgrade => upgrade.type === 'rate' && upgrade.level > 0)
    .reduce((total, upgrade) => {
      const upgradeContribution = multiply(upgrade.value, upgrade.level.toString());
      return add(total, upgradeContribution).toString();
    }, '0');
}

// Calculate the current multiplier based on all multiplier upgrades
export function calculatePixelMultiplier(upgrades) {
  return upgrades
    .filter(upgrade => upgrade.type === 'rate_multiplier' && upgrade.level > 0)
    .reduce((total, upgrade) => {
      const upgradeContribution = multiply(
        upgrade.value, 
        upgrade.level.toString()
      );
      return multiply(total, add('1', upgradeContribution)).toString();
    }, DEFAULT_MULTIPLIER);
}

// Calculate the click power from click upgrades
export function calculateClickPower(upgrades) {
  return upgrades
    .filter(upgrade => upgrade.type === 'click' && upgrade.level > 0)
    .reduce((total, upgrade) => {
      const upgradeContribution = multiply(upgrade.value, upgrade.level.toString());
      return add(total, upgradeContribution).toString();
    }, '1'); // Base click power is 1
}

// Calculate the click multiplier from click multiplier upgrades
export function calculateClickMultiplier(upgrades) {
  return upgrades
    .filter(upgrade => upgrade.type === 'click_multiplier' && upgrade.level > 0)
    .reduce((total, upgrade) => {
      const upgradeContribution = multiply(
        upgrade.value, 
        upgrade.level.toString()
      );
      return multiply(total, add('1', upgradeContribution)).toString();
    }, DEFAULT_MULTIPLIER);
}

// Calculate the total pixel generation rate
export function calculateTotalPixelGeneration(upgrades) {
  const rate = calculatePixelRate(upgrades);
  const multiplier = calculatePixelMultiplier(upgrades);
  return multiply(rate, multiplier).toString();
}

// Calculate the total click power
export function calculateTotalClickPower(upgrades) {
  const clickPower = calculateClickPower(upgrades);
  const clickMultiplier = calculateClickMultiplier(upgrades);
  return multiply(clickPower, clickMultiplier).toString();
}