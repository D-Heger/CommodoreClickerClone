// Save data structure version for future compatibility using semantic versioning
const SAVE_VERSION = '2.0.0';

// Version compatibility check levels
const VERSION_COMPATIBILITY = {
  COMPATIBLE: 'compatible',
  WARNING: 'warning',
  INCOMPATIBLE: 'incompatible'
};

/**
 * Parses a semantic version string into its components
 * @param {string} version - Version string in format "major.minor.patch"
 * @returns {Object} Object with major, minor, and patch numbers
 */
const parseVersion = (version) => {
  try {
    // Handle non-standard version formats gracefully
    if (!version || typeof version !== 'string') {
      return { major: 0, minor: 0, patch: 0 };
    }
    
    const parts = version.split('.');
    return {
      major: parseInt(parts[0]) || 0,
      minor: parseInt(parts[1]) || 0, 
      patch: parseInt(parts[2]) || 0
    };
  } catch (error) {
    console.error('Failed to parse version:', error);
    return { major: 0, minor: 0, patch: 0 };
  }
};

/**
 * Checks if a save version is compatible with the current game version
 * @param {string} saveVersion - The version of the save file
 * @returns {string} Compatibility level from VERSION_COMPATIBILITY
 */
const checkVersionCompatibility = (saveVersion) => {
  // Parse both versions
  const currentVersion = parseVersion(SAVE_VERSION);
  const savedVersion = parseVersion(saveVersion);
  
  // If versions are identical, they're fully compatible
  if (saveVersion === SAVE_VERSION) {
    return VERSION_COMPATIBILITY.COMPATIBLE;
  }
  
  // Major version differences indicate breaking changes
  if (savedVersion.major !== currentVersion.major) {
    return VERSION_COMPATIBILITY.INCOMPATIBLE;
  }
  
  // Minor version increases indicate new features but backward compatibility
  if (savedVersion.minor < currentVersion.minor) {
    return VERSION_COMPATIBILITY.WARNING;
  }
  
  // If save has newer minor version than game, it might have data the game doesn't understand
  if (savedVersion.minor > currentVersion.minor) {
    return VERSION_COMPATIBILITY.WARNING;
  }
  
  // Patch differences are generally compatible
  if (savedVersion.patch !== currentVersion.patch) {
    // Patch level differences are typically for bug fixes and are compatible
    return VERSION_COMPATIBILITY.COMPATIBLE;
  }
  
  // Fallback - should never reach here
  return VERSION_COMPATIBILITY.COMPATIBLE;
};

//XXX: Don't forget to update the version in the game when you change the save structure.
// - Increment MAJOR version when you make incompatible API changes
// - Increment MINOR version when you add functionality in a backward compatible manner
// - Increment PATCH version when you make backward compatible bug fixes

// Maximum number of save slots
const MAX_SAVE_SLOTS = 5;

// Structure for a save file
const createSaveData = (gameState) => ({
  version: SAVE_VERSION,
  timestamp: Date.now(),
  settings: gameState.settings,
  pixels: gameState.pixels,
  totalPixels: gameState.totalPixels,
  spentPixels: gameState.spentPixels,
  upgrades: gameState.upgrades.map(upgrade => ({
    id: upgrade.id,
    level: upgrade.level,
    purchased: upgrade.purchased
  })),
  completedFrames: gameState.completedFrames || 0
});

// Save to local storage
export const saveToSlot = (slot, gameState) => {
  if (slot < 1 || slot > MAX_SAVE_SLOTS) {
    throw new Error(`Invalid save slot: ${slot}. Must be between 1 and ${MAX_SAVE_SLOTS}`);
  }

  const saveData = createSaveData(gameState);
  localStorage.setItem(`save_${slot}`, JSON.stringify(saveData));
  return saveData;
};

// Load from local storage
export const loadFromSlot = (slot) => {
  if (slot < 1 || slot > MAX_SAVE_SLOTS) {
    throw new Error(`Invalid save slot: ${slot}. Must be between 1 and ${MAX_SAVE_SLOTS}`);
  }

  const saveData = localStorage.getItem(`save_${slot}`);
  if (!saveData) {
    return null;
  }

  const parsedSave = JSON.parse(saveData);
  
  // Add version compatibility check
  if (parsedSave.version) {
    parsedSave.compatibility = checkVersionCompatibility(parsedSave.version);
  } else {
    // If no version is found, treat as potentially incompatible
    parsedSave.compatibility = VERSION_COMPATIBILITY.WARNING;
    parsedSave.version = 'unknown';
  }
  
  return parsedSave;
};

// Delete a save slot
export const deleteSaveSlot = (slot) => {
  if (slot < 1 || slot > MAX_SAVE_SLOTS) {
    throw new Error(`Invalid save slot: ${slot}. Must be between 1 and ${MAX_SAVE_SLOTS}`);
  }

  localStorage.removeItem(`save_${slot}`);
};

// List all save slots
export const listSaveSlots = () => {
  const saves = [];
  for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
    const save = loadFromSlot(i);
    if (save) {
      saves.push({
        slot: i,
        timestamp: save.timestamp,
        pixels: save.pixels,
        completedFrames: save.completedFrames
      });
    }
  }
  return saves;
};

// Export save data to file
export const exportSave = (gameState) => {
  const saveData = createSaveData(gameState);
  const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `commodore-save-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Import save data from file
export const importSave = async (file) => {
  try {
    const text = await file.text();
    const saveData = JSON.parse(text);
    
    // Basic validation
    if (!saveData.version || !saveData.pixels || !saveData.upgrades) {
      throw new Error('Invalid save file format');
    }
    
    // Add version compatibility check
    saveData.compatibility = checkVersionCompatibility(saveData.version);
    
    return saveData;
  } catch (error) {
    throw new Error('Failed to import save file: ' + error.message);
  }
};

// Reset all game data
export const resetAllData = () => {
  for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
    deleteSaveSlot(i);
  }
};

// Find the latest save across all slots
export const findLatestSave = () => {
  let latestSave = null;
  let latestTimestamp = 0;

  for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
    try {
      const saveData = loadFromSlot(i);
      if (saveData && saveData.timestamp > latestTimestamp) {
        latestTimestamp = saveData.timestamp;
        latestSave = { slot: i, data: saveData };
      }
    } catch {
      continue;
    }
  }

  return latestSave;
};