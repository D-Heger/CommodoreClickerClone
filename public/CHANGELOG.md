# Changelog

All notable changes to this project will be documented in this file.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

- Save/Load game state
  - Saved game state includes all upgrades, settings, and progress
  - Ability to save the game state at any time and automatically
  - Save state should be exportable as a file
  - Serve 5 save slots for the user
  - Load game state from a file or one of the slots
  - Loaded game state should restore all upgrades, settings, and progress including correct render progress as well as completed frames
- Delete specific save state from the save slots
- Hard reset game state
  - Reset all upgrades, settings, and progress
  - Reset the game state to the initial state
  - Option to confirm the reset action
  - Reset should also remove every saved game state
- Additional themes including Amiga and ZX
- Sound FX and Music
- Support both English and German language
- More Upgrades
- Potentially more upgrade paths
- Prestige System
- Different Images to Render
- Optional filters in upgrade menu
- More CRT effects

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
