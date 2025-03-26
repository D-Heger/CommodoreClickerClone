# Changelog

All notable changes to this project will be documented in this file.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

- More Upgrades
- Potentially more upgrade paths
- Prestige System
- Different Images to Render
- Optional filters in upgrade menu
- More CRT effects
- UI improvements
  - Stats display needs to be reworked (partially done)
  - Improve mobile user experience
- Improved rendering performance? (to allow for higher auto clicker values ;) )
- [ ] Code Cleanup
  - [x] Refactor settings panel
  - [ ] Refactor upgrade panel
  - [ ] Refactor changelog popup
  - [ ] Refactor pixel canvas
  - [ ] Refactor main app component
- Actually implement settings and their effects
  - Additional themes including Amiga and ZX
  - Sound FX and Music
  - Support both English and German language
- Offline generation (maybe only through upgrades)

## 0.0.4 - 24.03.2025

### Added

- Settings are now saved as well
- Implemented Autoloading of the latest save
- More cool upgrade types!
- Fancy 'popup' on critical hits

### Changed

- Now sanitizing changelog
- Improved code formatting
- Improved handling of really big numbers
- Improved Sats Panel UI

### Fixed

- Fixed a bug where the About Section was not interactable anymore
- Fixed a bug where upgrade costs could reach 'Infinity' (Now up to at least one quadrillion levels should work)

### Removed

- Total Pixel count on the Pixel Canvas

## 0.0.3 - 24.03.2025

### Added

- Comprehensive save/load game state system
  - Added 5 save slots for storing game states
  - Implemented automatic saving functionality
  - Added ability to export save states as files
  - Added feature to load game states from files or save slots
  - Save states now preserve all upgrades, settings, progress and completed frames
- Game state management features
  - Added ability to delete specific save states from slots
  - Implemented hard reset functionality
    - Complete reset of all upgrades, settings, and progress
    - Option to confirm reset action
    - Reset now removes all saved game states

### Changed

- Significantly improved code structure and organization
  - Split SettingsPanel into modular components (SaveSlotManager, SettingsOptions, AboutSection, ConfirmationDialog)
  - Extracted common CSS styles to theme.css for better reusability
  - Created central configuration for settings options
  - Implemented composable pattern for confirmation dialog logic
- Reduced code duplication and enhanced maintainability
- Improved separation of concerns across components

## 0.0.2 - 23.03.2025

### Added

- Counter for complete rendered frames
- New Changelog popup when loading the game
- New Changelog button in the settings menu

### Changed

- Made the color shift upon completion of a frame more pronounced
- Moved the changelog to the public folder (to be included in the build)

### Fixed

- Fixed a bug where the canvas was not reset correctly upon completion of a frame
- Fixed styling issues with the settings and upgrades menus

## 0.0.1 - 23.03.2025

### Added

- Initial release of the Commodore Pixel Renderer
- Pixel rendering with retro CRT effects
- Multiple upgrade paths (CPU speed, multipliers, click power)
- 'Authentic' retro Commodore aesthetics
- Optimized for large numbers with Decimal.js
- (hopefully) Fully responsive design
