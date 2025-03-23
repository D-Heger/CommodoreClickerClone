import { toDecimal } from './numbers';

// Save data structure version for future compatibility
const SAVE_VERSION = '1';

// Maximum number of save slots
const MAX_SAVE_SLOTS = 5;

// Structure for settings (placeholder for future settings)
const defaultSettings = {
  theme: 'C64',
  soundFx: true,
  music: true,
  language: 'ENGLISH'
};

// Structure for a save file
const createSaveData = (gameState) => ({
  version: SAVE_VERSION,
  timestamp: Date.now(),
  settings: { ...defaultSettings },
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

  return JSON.parse(saveData);
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