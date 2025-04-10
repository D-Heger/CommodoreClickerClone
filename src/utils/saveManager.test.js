import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  saveToSlot,
  loadFromSlot,
  deleteSaveSlot,
  listSaveSlots,
  exportSave,
  importSave,
  resetAllData,
  findLatestSave,
  // Also need to test internal functions if possible/necessary, or test through public API
  // For checkVersionCompatibility, we can test it directly if exported, or indirectly via load/import
} from './saveManager';

// --- Mocks ---

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Date.now()
let dateNowSpy;
const mockTimestamp = 1678886400000; // Fixed timestamp for testing

// Mock DOM/URL/Blob for exportSave
const createObjectURLMock = vi.fn(() => 'blob:mockurl/12345');
const revokeObjectURLMock = vi.fn();
const appendChildMock = vi.fn();
const removeChildMock = vi.fn();
const clickMock = vi.fn();

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: createObjectURLMock,
    revokeObjectURL: revokeObjectURLMock,
  },
  writable: true
});

// Define a reusable mock link object
let mockLink = {
  href: '',
  download: '',
  click: clickMock,
};

Object.defineProperty(document, 'createElement', {
  value: vi.fn((tagName) => {
    if (tagName?.toLowerCase() === 'a') {
      // Reset properties for each 'a' creation if needed, or rely on beforeEach
      mockLink.href = '';
      mockLink.download = '';
      return mockLink;
    }
    // Basic mock for other elements if needed
    return { style: {} };
  }),
  writable: true,
  configurable: true // Allow redefinition
});

Object.defineProperty(document.body, 'appendChild', {
  value: appendChildMock,
  writable: true
});

Object.defineProperty(document.body, 'removeChild', {
  value: removeChildMock,
  writable: true
});

// Mock Blob
// We don't need a full Blob implementation, just check it's called
vi.stubGlobal('Blob', vi.fn((content, options) => ({ content, options })));


// --- Test Data ---
const mockGameState = {
  settings: { theme: 'C64', sound: true },
  pixels: '12345',
  totalPixels: '20000',
  spentPixels: '7655',
  upgrades: [
    { id: 'click-1', name: 'Click', level: 5, purchased: true, cost: '10', value: '1', costFactor: '1.1' }, // Include extra data to ensure it's filtered
    { id: 'rate-1', name: 'Rate', level: 2, purchased: true, cost: '50', value: '0.5', costFactor: '1.2' },
  ],
  completedFrames: 10,
};

// Expected structure after createSaveData filters upgrades
const expectedSaveStructure = {
  version: '2.0.0', // Matches SAVE_VERSION in saveManager.js
  timestamp: mockTimestamp,
  settings: mockGameState.settings,
  pixels: mockGameState.pixels,
  totalPixels: mockGameState.totalPixels,
  spentPixels: mockGameState.spentPixels,
  upgrades: [
    { id: 'click-1', level: 5, purchased: true },
    { id: 'rate-1', level: 2, purchased: true },
  ],
  completedFrames: mockGameState.completedFrames,
};

// --- Tests ---
describe('Save Manager', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear(); // Clear mock localStorage before each test
    dateNowSpy = vi.spyOn(Date, 'now').mockImplementation(() => mockTimestamp);
    // Reset mockLink state if needed (though the mock itself does it now)
    // mockLink.href = '';
    // mockLink.download = '';
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  // --- saveToSlot ---
  describe('saveToSlot', () => {
    it('should save game state to the specified slot', () => {
      const slot = 1;
      const savedData = saveToSlot(slot, mockGameState);

      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `save_${slot}`,
        JSON.stringify(expectedSaveStructure) // createSaveData is called internally
      );
      expect(savedData).toEqual(expectedSaveStructure);
    });

    it('should throw error for invalid slot number (< 1)', () => {
      expect(() => saveToSlot(0, mockGameState)).toThrow('Invalid save slot');
    });

    it('should throw error for invalid slot number (> MAX_SAVE_SLOTS)', () => {
      expect(() => saveToSlot(6, mockGameState)).toThrow('Invalid save slot');
    });
  });

  // --- loadFromSlot ---
  describe('loadFromSlot', () => {
    it('should load game state from the specified slot', () => {
      const slot = 2;
      localStorageMock.setItem(`save_${slot}`, JSON.stringify(expectedSaveStructure));

      const loadedData = loadFromSlot(slot);

      expect(localStorageMock.getItem).toHaveBeenCalledTimes(1);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(`save_${slot}`);
      // Compatibility check is added by loadFromSlot
      expect(loadedData).toEqual({
        ...expectedSaveStructure,
        compatibility: 'compatible' // Assuming SAVE_VERSION is 2.0.0
      });
    });

    it('should return null if slot is empty', () => {
      const slot = 3;
      const loadedData = loadFromSlot(slot);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(`save_${slot}`);
      expect(loadedData).toBeNull();
    });

    it('should throw error for invalid slot number', () => {
      expect(() => loadFromSlot(0)).toThrow('Invalid save slot');
      expect(() => loadFromSlot(6)).toThrow('Invalid save slot');
    });

    it('should add compatibility status (compatible)', () => {
      const slot = 1;
      const saveData = { ...expectedSaveStructure, version: '2.0.0' };
      localStorageMock.setItem(`save_${slot}`, JSON.stringify(saveData));
      const loaded = loadFromSlot(slot);
      expect(loaded?.compatibility).toBe('compatible');
    });

    it('should add compatibility status (warning - older minor)', () => {
      const slot = 1;
      const saveData = { ...expectedSaveStructure, version: '2.1.0' }; // Game is 2.0.0
      localStorageMock.setItem(`save_${slot}`, JSON.stringify(saveData));
      const loaded = loadFromSlot(slot);
      expect(loaded?.compatibility).toBe('warning');
    });

     it('should add compatibility status (warning - newer minor)', () => {
      const slot = 1;
      const saveData = { ...expectedSaveStructure, version: '2.1.0' }; // Game is 2.0.0
      // Re-checking logic: if savedVersion.minor > currentVersion.minor -> warning
      localStorageMock.setItem(`save_${slot}`, JSON.stringify(saveData));
      const loaded = loadFromSlot(slot);
      expect(loaded?.compatibility).toBe('warning');
    });

    it('should add compatibility status (incompatible - major diff)', () => {
      const slot = 1;
      const saveData = { ...expectedSaveStructure, version: '1.9.0' }; // Game is 2.0.0
      localStorageMock.setItem(`save_${slot}`, JSON.stringify(saveData));
      const loaded = loadFromSlot(slot);
      expect(loaded?.compatibility).toBe('incompatible');
    });

     it('should add compatibility status (compatible - patch diff)', () => {
      const slot = 1;
      const saveData = { ...expectedSaveStructure, version: '2.0.1' }; // Game is 2.0.0
      localStorageMock.setItem(`save_${slot}`, JSON.stringify(saveData));
      const loaded = loadFromSlot(slot);
      expect(loaded?.compatibility).toBe('compatible');
    });

    it('should add compatibility status (warning - no version)', () => {
      const slot = 1;
      const saveData = { ...expectedSaveStructure };
      delete saveData.version; // Remove version
      localStorageMock.setItem(`save_${slot}`, JSON.stringify(saveData));
      const loaded = loadFromSlot(slot);
      expect(loaded?.compatibility).toBe('warning');
      expect(loaded?.version).toBe('unknown');
    });
  });

  // --- deleteSaveSlot ---
  describe('deleteSaveSlot', () => {
    it('should delete the specified save slot', () => {
      const slot = 4;
      localStorageMock.setItem(`save_${slot}`, 'somedata'); // Pre-populate
      deleteSaveSlot(slot);
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(1);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(`save_${slot}`);
      expect(localStorageMock.getItem(`save_${slot}`)).toBeNull(); // Verify removal
    });

    it('should throw error for invalid slot number', () => {
      expect(() => deleteSaveSlot(0)).toThrow('Invalid save slot');
      expect(() => deleteSaveSlot(6)).toThrow('Invalid save slot');
    });
  });

  // --- listSaveSlots ---
  describe('listSaveSlots', () => {
    it('should return an empty array if no saves exist', () => {
      const saves = listSaveSlots();
      expect(saves).toEqual([]);
    });

    it('should return a list of existing saves with basic info', () => {
      const saveData1 = { ...expectedSaveStructure, timestamp: mockTimestamp - 1000, pixels: '100', completedFrames: 5 };
      const saveData2 = { ...expectedSaveStructure, timestamp: mockTimestamp, pixels: '5000', completedFrames: 15 };
      localStorageMock.setItem('save_1', JSON.stringify(saveData1));
      localStorageMock.setItem('save_3', JSON.stringify(saveData2));

      const saves = listSaveSlots();

      expect(localStorageMock.getItem).toHaveBeenCalledTimes(5); // Checks all slots
      expect(saves).toHaveLength(2);
      expect(saves).toEqual([
        { slot: 1, timestamp: saveData1.timestamp, pixels: saveData1.pixels, completedFrames: saveData1.completedFrames },
        { slot: 3, timestamp: saveData2.timestamp, pixels: saveData2.pixels, completedFrames: saveData2.completedFrames },
      ]);
    });
  });

  // --- exportSave ---
  describe('exportSave', () => {
    it('should create a blob, generate URL, and trigger download', () => {
      exportSave(mockGameState);

      // 1. Check Blob creation
      expect(Blob).toHaveBeenCalledTimes(1);
      expect(Blob).toHaveBeenCalledWith(
        [JSON.stringify(expectedSaveStructure, null, 2)],
        { type: 'application/json' }
      );

      // 2. Check URL creation
      expect(createObjectURLMock).toHaveBeenCalledTimes(1);

      // 3. Check link creation and properties
      expect(document.createElement).toHaveBeenCalledWith('a');
      // Check the properties of the shared mockLink object modified by exportSave
      expect(mockLink.href).toBe('blob:mockurl/12345');
      expect(mockLink.download).toMatch(/^commodore-save-\d{4}-\d{2}-\d{2}\.json$/);

      // 4. Check DOM manipulation and cleanup
      expect(appendChildMock).toHaveBeenCalledTimes(1);
      expect(clickMock).toHaveBeenCalledTimes(1);
      expect(removeChildMock).toHaveBeenCalledTimes(1);
      expect(revokeObjectURLMock).toHaveBeenCalledTimes(1);
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mockurl/12345');
    });
  });

  // --- importSave ---
  describe('importSave', async () => {
    const mockFileContent = JSON.stringify(expectedSaveStructure);
    const mockFile = {
      text: vi.fn().mockResolvedValue(mockFileContent),
    };

    it('should parse valid save file and add compatibility', async () => {
      const importedData = await importSave(mockFile);
      expect(mockFile.text).toHaveBeenCalledTimes(1);
      expect(importedData).toEqual({
        ...expectedSaveStructure,
        compatibility: 'compatible' // Assuming SAVE_VERSION is 2.0.0
      });
    });

    it('should throw error for invalid JSON', async () => {
      const invalidFile = { text: vi.fn().mockResolvedValue('{invalid json') };
      await expect(importSave(invalidFile)).rejects.toThrow('Failed to import save file:');
    });

    it('should throw error for missing required fields', async () => {
      const incompleteData = { ...expectedSaveStructure };
      delete incompleteData.pixels; // Remove a required field
      const incompleteFile = { text: vi.fn().mockResolvedValue(JSON.stringify(incompleteData)) };
      await expect(importSave(incompleteFile)).rejects.toThrow('Invalid save file format');
    });

     it('should throw error if file.text() rejects', async () => {
      const errorFile = { text: vi.fn().mockRejectedValue(new Error('Read error')) };
      await expect(importSave(errorFile)).rejects.toThrow('Failed to import save file: Read error');
    });

    it('should add compatibility status during import', async () => {
       const oldVersionData = { ...expectedSaveStructure, version: '1.0.0' };
       const oldVersionFile = { text: vi.fn().mockResolvedValue(JSON.stringify(oldVersionData)) };
       const imported = await importSave(oldVersionFile);
       expect(imported.compatibility).toBe('incompatible');
    });
  });

  // --- resetAllData ---
  describe('resetAllData', () => {
    it('should remove all save slots', () => {
      // Pre-populate some slots
      localStorageMock.setItem('save_1', 'data1');
      localStorageMock.setItem('save_3', 'data3');
      localStorageMock.setItem('save_5', 'data5');

      resetAllData();

      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(5); // Called for slots 1 through 5
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('save_1');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('save_2');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('save_3');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('save_4');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('save_5');

      // Verify store is empty (optional, depends on mock implementation)
      expect(localStorageMock.getItem('save_1')).toBeNull();
      expect(localStorageMock.getItem('save_3')).toBeNull();
      expect(localStorageMock.getItem('save_5')).toBeNull();
    });
  });

  // --- findLatestSave ---
  describe('findLatestSave', () => {
    it('should return null if no saves exist', () => {
      const latest = findLatestSave();
      expect(latest).toBeNull();
    });

    it('should find the latest save among multiple slots', () => {
      const saveDataOld = { ...expectedSaveStructure, timestamp: mockTimestamp - 2000 };
      const saveDataLatest = { ...expectedSaveStructure, timestamp: mockTimestamp }; // Uses the mocked current time
      const saveDataMiddle = { ...expectedSaveStructure, timestamp: mockTimestamp - 1000 };

      localStorageMock.setItem('save_2', JSON.stringify(saveDataOld));
      localStorageMock.setItem('save_4', JSON.stringify(saveDataLatest)); // Latest is in slot 4
      localStorageMock.setItem('save_5', JSON.stringify(saveDataMiddle));

      const latest = findLatestSave();

      expect(latest).not.toBeNull();
      expect(latest?.slot).toBe(4);
      expect(latest?.data).toEqual({
        ...saveDataLatest,
        compatibility: 'compatible' // Added by loadFromSlot
      });
    });

     it('should handle errors during loading individual slots gracefully', () => {
      const saveDataValid = { ...expectedSaveStructure, timestamp: mockTimestamp };
      localStorageMock.setItem('save_1', JSON.stringify(saveDataValid));
      localStorageMock.setItem('save_2', '{invalid json'); // Corrupted save

      const latest = findLatestSave();

      // Should still find the valid save in slot 1
      expect(latest).not.toBeNull();
      expect(latest?.slot).toBe(1);
      expect(latest?.data).toEqual({
        ...saveDataValid,
        compatibility: 'compatible'
      });
    });
  });

});