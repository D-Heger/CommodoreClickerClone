import { validateUpgrade } from './upgradeSchema';
import { add, multiply, subtract, gte, power } from './numbers';

// Default initial state for the multiplier
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

// Calculate the current cost of an upgrade based on its level with extremely aggressive exponential scaling
export function calculateUpgradeCost(upgrade) {
  if (upgrade.level === 0) {
    return upgrade.cost;
  }
  
  // Cube the cost factor for dramatically more aggressive scaling
  const cubedCostFactor = multiply(
    multiply(upgrade.costFactor, upgrade.costFactor),
    upgrade.costFactor
  );
  
  // Apply extremely aggressive exponential scaling:
  // base_cost * (cubed_factor^level) * (1.5^(level^2)) * (1.1^(level^3))
  const baseScaling = power(cubedCostFactor, upgrade.level).toString();
  const squared = multiply(upgrade.level, upgrade.level);
  const cubed = multiply(squared, upgrade.level);
  
  const additionalScaling1 = power('1.5', squared).toString();
  const additionalScaling2 = power('1.1', cubed).toString();
  
  return multiply(
    multiply(
      multiply(upgrade.cost, baseScaling),
      additionalScaling1
    ),
    additionalScaling2
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

// Calculate the current rate multiplier based on all rate multiplier upgrades
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

// Calculate the critical chance from click critical upgrades. A singular critical hit should cause double pixel per click on that specific click.
// Returns a value between 0 and 1 if critical chance is between 0% and 100%
// Returns a value greater than 1 if critical chance is above 100%, guaranteeing a critical hit and making a double or more critical hits possible
// Every successful critical hit on a individual click will cause a further doubling of the pixel per click
export function calculateClickCriticalChance(upgrades) {
  return upgrades
    .filter(upgrade => upgrade.type === 'click_critical' && upgrade.level > 0)
    .reduce((totalChance, upgrade) => {
      const upgradeContribution = multiply(upgrade.value, upgrade.level.toString());
      return add(totalChance, upgradeContribution).toString();
    }, '0'); // Start with 0% chance if no critical upgrades
}

export function calculateClickCriticalMultiplier(upgrades) {
  return upgrades
    .filter(upgrade => upgrade.type === 'click_critical_multiplier' && upgrade.level > 0)
    .reduce((total, upgrade) => {
      const upgradeContribution = multiply(upgrade.value, upgrade.level.toString());
      return multiply(total, add('1', upgradeContribution)).toString();
    }, '2'); // Start with a base multiplier of 2 for critical hits
}

// Apply critical hit chance calculation to a click and return the adjusted click power
// along with information about the critical hit for displaying a popup
export function applyClickWithCritical(upgrades) {
  // Calculate the base click power without criticals
  const baseClickPower = calculateTotalClickPower(upgrades);
  
  // Calculate the critical hit chance
  const criticalChance = calculateClickCriticalChance(upgrades);
  
  // If there's no critical chance, return the base click power with no critical info
  if (criticalChance === '0') {
    return {
      clickPower: baseClickPower,
      critical: {
        happened: false,
        multiplier: '1',
        hits: 0
      }
    };
  }
  
  // Determine if a critical hit occurs and how many times it stacks
  const randomValue = Math.random(); // Value between 0 and 1
  let criticalHits = 0;
  let remainingChance = parseFloat(criticalChance);
  
  // First hit: check if random value < critical chance
  if (randomValue < Math.min(remainingChance, 1)) {
    criticalHits = 1;
    remainingChance -= 1;
    
    // For chances > 100%, determine additional critical hits
    while (remainingChance > 0 && Math.random() < Math.min(remainingChance, 1)) {
      criticalHits += 1;
      remainingChance -= 1;
    }
  }
  
  // No critical hit occurred
  if (criticalHits === 0) {
    return {
      clickPower: baseClickPower,
      critical: {
        happened: false,
        multiplier: '1',
        hits: 0
      }
    };
  }
  
  // Calculate critical multiplier: clickCriticalMultiplier^criticalHits (each hit doubles the previous)
  const clickCriticalMultiplier = calculateClickCriticalMultiplier(upgrades);
  const criticalMultiplier = power(clickCriticalMultiplier, criticalHits).toString();
  
  // Apply critical multiplier to base click power
  const adjustedClickPower = multiply(baseClickPower, criticalMultiplier).toString();
  
  return {
    clickPower: adjustedClickPower,
    critical: {
      happened: true,
      multiplier: criticalMultiplier,
      hits: criticalHits
    }
  };
}

// Calculate how often the autoclicker should click per second
export function calculateAutoClickRate(upgrades) {
  return upgrades
    .filter(upgrade => upgrade.type === 'click_automation' && upgrade.level > 0)
    .reduce((total, upgrade) => {
      const upgradeContribution = multiply(upgrade.value, upgrade.level.toString());
      return add(total, upgradeContribution).toString();
    }, '0'); // Start with 0 clicks per second if no autoclicker upgrades
}