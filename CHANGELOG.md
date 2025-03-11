## [1.5.6] - 2025-03-11
### Fixed
#### Auto-Population Spell Preparation
- Fixed the wording of spell preparation settings to be less confusing. Please check your settings to make sure they are correct
- Added ritual spells and always prepared spells to the list of special casting modes (alongside innate, at-will, and pact spells) that bypass preparation requirements
- Updated the macro logic to properly determine if a token's actor data is linked to its sheet using token.document.actorLink
- Moved the spell preparation check to a helper function in config.js to centralise its logic

#### Ability Card
- Fixed the positioning of the ability card popup panels sometimes not appearing in the correct location
- Fixed red border appearing on ability score hover due to menu item styles bleeding into ability card styles

### Updated
#### Context Menu
- Improved context menu organization with clearer item-specific vs container-wide options
- Renamed "Auto-Populate" to "Auto-Populate This Container" and "Sort Items" to "Sort Items in This Container" for clarity
- Added "Clear Container" option to quickly remove all items from a container
- Moved "Remove Item" option to only show when right-clicking on an item
- Added visual divider between item-specific and container-wide options in context menus
- Fixed context menu positioning to properly anchor to grid cells and stay within viewport bounds

#### Tooltips
- Added setting to show full material components description in spell tooltips (off by default)
- (Beta) Added setting to display damage as ranges instead of dice notation (e.g., "1-8 fire" instead of "1d8 fire") (off by default)
  - Initial implementation for spells, weapons, and features
  - Needs additional work for handling more complex damage formulas, modifiers and multiple activities
- Readded spell component display (verbal (vocal?), somatic & material) in tooltips
- Fixed tooltip positioning to stay within viewport bounds

## [1.5.5] - 2025-03-11
### Fixed
#### Spell Population Logic
- Fixed spell preparation check in `AutoPopulateCreateToken.js` to properly handle linked vs unlinked tokens
- Added proper token linkage detection using actor data instead of undefined token reference

#### Tooltip Enrichment
- Changed enricher backgrounds and styling in tooltips for enricher types. Might still be some that slipped through. Why did they make them this way?


## [1.5.4] - 2025-03-10
### Fixed
#### HUD Controls
- Fixed opacity inheritance for ability button and card to properly fade with parent containers
- Fixed ability card popup panels to be flush with card edges instead of overlapping
- Removed custom opacity handling from AbilityButton.js to use CSS transitions
- Standardized menu styling across all context menus
- Moved all inline styles from AbilityButton.js to ability-card.css
- Fixed settings menu to use common menu container styles for consistency

### Updated
#### CSS Organization
- Improved CSS organization by centralizing styles in appropriate files: ability-card.css, menus.css, portrait.css, and added controls.css for controls menu
- Removed redundant settings menu styles from menus.css
- Added proper opacity inheritance through the component hierarchy:
  - Hotbar → Portrait Card → Ability Button → Ability Card/Skills/Saves

## [1.5.3] - 2025-03-09
### Fixed
#### Lock System
- Fixed issue where lock settings would not persist after unlocking
- Added warning notification when attempting to lock without selecting any options
- Improved lock button UX by preserving selected options between lock/unlock cycles

### Updated
#### File Structure
- Changed main CSS entry point from `hotbar.css` to `index.css` for better organization
- Moved death saving throw UI to a 'portrait.css' file for better organization with its parent

## [1.5.2] - 2025-03-09
### Fixed
- Fixed issue where multiple effect tooltips could stack if moving between effects during the tooltip delay timer
- Fixed issue where tooltips would duplicate when toggling effect states (enabled/disabled)
- Fixed issue where some items could not be dragged onto the hotbar from character sheets and other sources
- Added prevention of duplicate items being added to the hotbar
- Improved drag and drop handling to better support various item data formats
- Fixed tooltip system initialization errors
  - Added missing imports for TooltipFactory
  - Fixed module name reference in tooltip delay settings
  - Improved tooltip creation reliability

### Updated
- Updated my github actions workflow as I was always giving the "latest" manifests from module.json regardless of version number
- Pinned active effects tooltips should now correctly update their data if pinned

## [1.5.1] - 2025-03-09
### Added
- Added setting to bypass spell preparation checks when auto-populating hotbar
- Split spell preparation check into two separate settings:
  - Player Characters + Unlinked NPCs: Default to requiring spell preparation
  - Unlinked NPCs: Default to showing all spells
- Improved lock button functionality
  - Right-click menu now selects which options to control
  - Left-click toggles only the selected options
  - Unselected options remain unchanged when toggling lock state

## [1.5.0] - 2025-03-09
### Fixed
- Fixed issue where drag and drop only worked from cell borders
- Fixed pointer events interfering with drag operations from item images and text
- Fixed cursor feedback during drag operations
- Fixed macro drag-and-drop support to properly handle Foundry's UUID format
- Improved macro ID resolution to support both direct UUIDs and legacy formats
- Fixed context menu error when trying to access null UI reference
- Fixed items not being removed from hotbar when using context menu Remove option
- Fixed UI not initially loading for players. Issue was on init, players auto-select tokens by default. My lazy way was to force unselection at startup.
- Refactored drag and drop functionality to a manager and restored functionality

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