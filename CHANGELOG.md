# Changelog

## [1.4.0] - 2025-03-09
### Fixed
- Complete refactor of the tooltips for improved performance and maintainability
- Improved text enrichment in tooltips for better compatibility
  - Added consistent enrichment options across all tooltip types
  - Added proper context resolution for lookups and inline rolls
  - Added support for links and entity references
  - Added roll data support for dynamic values
  - Fixed enrichment in effect tooltips
  - Fixed enrichment in weapon tooltips
  - Fixed enrichment in feature tooltips
  - Fixed enrichment in spell tooltips

## [1.3.1] - 2025-03-08
### Fixed
- Fixed ability card positioning to properly display above portrait
  - Moved ability card element to document body for better stacking context
  - Updated positioning logic to correctly calculate location relative to portrait
  - Improved z-index handling to ensure proper layering

## [1.3.0] - 2025-03-08
### Added
- Added global default setting for portrait display preferences
  - Choose between token image or character portrait as default
  - Setting can still be overridden per-token via right-click menu
  - Accessible through module settings

### Fixed
- Improved passive features dialog UI and CSS organization
  - Added scrollbar for long lists of passive features with custom styling
  - Added blue border hover effect for better visual feedback
  - Moved all inline CSS to dedicated file @passives.css
  - Moved dialog template to dedicated file @passives-dialog.html
  - Fixed dialog width and made it non-resizable
  - Improved empty state handling for passive features container
  - Added consistent styling for dialog scrollbars

## [1.2.0] - 2025-03-08
### Added
- Added death saving throws UI to the left of portrait cards for player characters
  - Vertical column with 3 success boxes, skull icon, and 3 failure boxes
  - Click skull icon to roll death saving throw
  - Visual feedback with green/red highlighting for successes/failures
  - Only appears for player characters at 0 HP or below
  - Automatically updates character sheet when death saves change or HP changes
  - Success boxes remain visible for 5 seconds after stabilization for visual feedback
  - Failure boxes remain visible until character is healed (for resurrection cases)
- Added portrait image selection feature
  - Right-click on portrait to choose between token image or character portrait
  - Token image is the default option
  - Selection persists per-actor between sessions
  - Visual indicator shows current selection in context menu
- Added client-side setting to enable/disable the module's UI
  - Allows individual players to choose whether to use the BG3-style hotbar
  - Persists between sessions
  - Accessible through module settings

### Fixed
- Changed the setting for Autopopulating unlinked NPC tokens to true by default

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