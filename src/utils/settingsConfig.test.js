import { describe, it, expect } from 'vitest';
import {
  validateSettings,
  DEFAULT_SETTINGS,
  THEMES,
  LANGUAGES,
} from './settingsConfig';

describe('Settings Config', () => {
  describe('validateSettings', () => {
    it('should return default settings if no input is provided', () => {
      const validated = validateSettings();
      expect(validated).toEqual(DEFAULT_SETTINGS);
    });

    it('should return default settings if an empty object is provided', () => {
      const validated = validateSettings({});
      expect(validated).toEqual(DEFAULT_SETTINGS);
    });

    it('should keep valid settings provided', () => {
      const customSettings = {
        theme: 'AMIGA',
        soundFx: false,
        music: false,
        language: 'DEUTSCH',
      };
      const validated = validateSettings(customSettings);
      expect(validated).toEqual(customSettings);
    });

    it('should override invalid theme with default', () => {
      const customSettings = { theme: 'INVALID_THEME' };
      const validated = validateSettings(customSettings);
      expect(validated.theme).toBe(DEFAULT_SETTINGS.theme);
      expect(validated.soundFx).toBe(DEFAULT_SETTINGS.soundFx); // Check others remain default
      expect(validated.music).toBe(DEFAULT_SETTINGS.music);
      expect(validated.language).toBe(DEFAULT_SETTINGS.language);
    });

    it('should override invalid language with default', () => {
      const customSettings = { language: 'INVALID_LANG' };
      const validated = validateSettings(customSettings);
      expect(validated.language).toBe(DEFAULT_SETTINGS.language);
      expect(validated.theme).toBe(DEFAULT_SETTINGS.theme); // Check others remain default
    });

    it('should keep valid boolean settings (true)', () => {
      const customSettings = { soundFx: true, music: true };
      const validated = validateSettings(customSettings);
      expect(validated.soundFx).toBe(true);
      expect(validated.music).toBe(true);
    });

     it('should keep valid boolean settings (false)', () => {
      const customSettings = { soundFx: false, music: false };
      const validated = validateSettings(customSettings);
      expect(validated.soundFx).toBe(false);
      expect(validated.music).toBe(false);
    });

    it('should override non-boolean soundFx with default', () => {
      const customSettings = { soundFx: 'not a boolean' };
      const validated = validateSettings(customSettings);
      expect(validated.soundFx).toBe(DEFAULT_SETTINGS.soundFx);
    });

    it('should override non-boolean music with default', () => {
      const customSettings = { music: null };
      const validated = validateSettings(customSettings);
      expect(validated.music).toBe(DEFAULT_SETTINGS.music);
    });

    it('should handle partial valid settings, applying defaults for missing ones', () => {
      const customSettings = {
        theme: 'ZX',
        soundFx: false,
        // music and language missing
      };
      const validated = validateSettings(customSettings);
      expect(validated).toEqual({
        theme: 'ZX',
        soundFx: false,
        music: DEFAULT_SETTINGS.music, // Default applied
        language: DEFAULT_SETTINGS.language, // Default applied
      });
    });

    it('should handle partial invalid settings, applying defaults', () => {
       const customSettings = {
        theme: 'INVALID',
        soundFx: 'true', // Invalid type
        music: true, // Valid
        language: 'DEUTSCH', // Valid
      };
      const validated = validateSettings(customSettings);
      expect(validated).toEqual({
        theme: DEFAULT_SETTINGS.theme, // Default applied
        soundFx: DEFAULT_SETTINGS.soundFx, // Default applied
        music: true, // Kept valid value
        language: 'DEUTSCH', // Kept valid value
      });
    });

     it('should not mutate the original settings object', () => {
      const originalSettings = { theme: 'AMIGA' };
      const validated = validateSettings(originalSettings);
      expect(validated).not.toBe(originalSettings); // Should be a new object
      expect(originalSettings).toEqual({ theme: 'AMIGA' }); // Original unchanged
    });
  });
});