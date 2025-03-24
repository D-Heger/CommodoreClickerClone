/**
 * Settings configuration file
 * Contains all settings options, default values, and validation rules
 */

export const THEMES = ['C64', 'AMIGA', 'ZX'];

export const LANGUAGES = [
  { code: 'ENGLISH', label: 'ENGLISH' },
  { code: 'DEUTSCH', label: 'DEUTSCH' }
];

export const TOGGLE_OPTIONS = [
  { value: true, label: 'ON' },
  { value: false, label: 'OFF' }
];

export const DEFAULT_SETTINGS = {
  theme: 'C64',
  soundFx: true,
  music: true,
  language: 'ENGLISH'
};

export const VERSION = '0.0.3'; // TODO: Update version dynamically

/**
 * Validates settings object against expected structure
 * @param {Object} settings - Settings object to validate
 * @returns {Object} Validated settings with defaults applied where needed
 */
export function validateSettings(settings = {}) {
  const validatedSettings = { ...DEFAULT_SETTINGS };
  
  // Theme validation
  if (settings.theme && THEMES.includes(settings.theme)) {
    validatedSettings.theme = settings.theme;
  }
  
  // Language validation
  if (settings.language && LANGUAGES.some(lang => lang.code === settings.language)) {
    validatedSettings.language = settings.language;
  }
  
  // Boolean settings validation
  if (typeof settings.soundFx === 'boolean') {
    validatedSettings.soundFx = settings.soundFx;
  }
  
  if (typeof settings.music === 'boolean') {
    validatedSettings.music = settings.music;
  }
  
  return validatedSettings;
}