# Changelog

## [1.1.0] - 2025-03-08
### Fixed
#### Hotbar Visibility
- Fixed issues where the hotbar would sometimes get stuck while fading in/out
- Improved how the hotbar responds to mouse movement
- Fixed inconsistent transparency when hovering over the hotbar
- Fixed issue where deleting NPC tokens when you have 
NOT locked a tokens HUD keeps the HUD on screen after deletion.
- Passive Features container (top left) will no longer display if the token has no passive features to populate with, cleanining up the UI.

#### Active Effects
- Fixed active effects not displaying for NPC tokens
- Fixed active effects container visibility logic for all actor types

#### Auto-Populate Improvements
- Added filtering to only include prepared spells when auto-populating containers
- Improved spell handling to prevent unprepared spells from being added to hotbar
- Added automatic removal of spells from hotbar when they become unprepared
- Added automatic addition of spells to hotbar when they become prepared
- Added support for at-will, innate, and pact spells to remain in hotbar
- Added notifications when spells are added or removed due to preparation changes

#### Player Character Data
- Fixed preserve player character data when HUD is locked to stay on and the token is deleted
  - Active effects now update correctly from character sheet rather than from token
  - Ability scores and skills remain accessible
  - HUD stays visible when intended
- NPCs and unlocked characters clean up properly when deleted

#### Character Sheet Integration
- Fixed skill checks not working properly with Cauldron of Plentiful things
- Fixed ability scores sometimes not displaying when opening the ability scores card

## [1.0.1] - 2025-03-07
### Fixed
- Fixed auto-populate functionality for unlinked tokens
  - Improved item filtering to properly include passive feats
  - Fixed data structure initialization for new token hotbars
  - Removed unnecessary UI creation that could cause issues
  - Added proper container size limits to prevent overflow

## [1.0.0] - 2025-03-07
- Initial release

### Features
- Basic hotbar functionality
- Customizable grid containers
- Token-specific persistent layouts
- Portrait card integration
- Settings menu 

### Active Effects
- Active Effects Container for managing token effects
- Tooltip system for displaying detailed information
- Improved UI responsiveness and visual feedback

### Passive Features
- Passive Features Container for displaying forgettable features

### Ability Management
- Ability Card for saving throws, skill checks, and ability checks

### Item Management
- Auto-sort capabilities for item management
- Auto-populate on premade tokens within a container option with auto-sort
- Auto-populate on token creation for unlinked tokens