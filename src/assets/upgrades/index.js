/**
 * Upgrades index file
 * 
 * This file imports and combines all upgrade types from separate files
 * to maintain compatibility with the existing game logic while 
 * improving code organization.
 */

import clickUpgrades from './click.json'
import rateUpgrades from './rate.json'
import clickAutomationUpgrades from './click_automation.json'
import clickCriticalUpgrades from './click_critical.json'
import clickMultiplierUpgrades from './click_multiplier.json'
import clickCriticalMultiplierUpgrades from './click_critical_multiplier.json'
import rateMultiplierUpgrades from './rate_multiplier.json'

// Combine all upgrades into a single array
const allUpgrades = [
  ...clickUpgrades,
  ...rateUpgrades,
  ...clickAutomationUpgrades,
  ...clickCriticalUpgrades,
  ...clickMultiplierUpgrades,
  ...clickCriticalMultiplierUpgrades,
  ...rateMultiplierUpgrades
]

export default allUpgrades