## [3.0.6] - 2025-05-02
### Fixed
- Fix CSS details conflicts. (Related Issue: [#141])
- Update socket synchro logic.
- Fix UI not showing on load if a token was selected.

### Features
- Add a tooltip on non-active weapon sets. (Related Issue: [#145])

## [3.0.5] - 2025-04-30
### Fixed
- Fix bug with Ability Container for D&D 3.3.1. (Related Issue: [#138])

### Features
- Add Right-Click on Portrait Dice to roll initiative. (Related Issue: [#118])
- Add setting submenu to choose which CPR Actions used when auto-populating Basic Actions Container.  (Related Issue: [#132])

## [3.0.4] - 2025-04-29
### Fixed
- Fix Configure Portrait Extra Datas not shown for players.

## [3.0.3] - 2025-04-27
### Fixed
- Fix Auto UI Scale wrong localization text. (Related Issue: [#134])

### Features
- Add on setting to add Advantage/Disadvantage buttons to add a source when using MidiQoL fast-forward. (Related Issue: [#124])
- Move settings to submenu to make it easier to read.
- Common Actions from CPR will be in Actions category. (Related Issue: [#133])

## [3.0.2] - 2025-04-27
### Fixed
- Optimize movable locked tooltip.

## [3.0.1] - 2025-04-24
### Fixed
- Fix CSS for control button locked state.
- Fix Opacity Lock Menu not working.
- Fix Basic Actions Container not hiding sometimes. (Related Issue: [#122])
- Fix players lacking "Use File Browser" permission not being able to customize their theme. (Related Issue: [#121])
- Fix a bug with Forge-vtt.com. (Related Issue: [#128])
- Fix a bug with Ability Check & Save roll. (Related Issue: [#127])
- Passives container will now be shown on hover even if empty. (Related Issue: [#126])
- Fix a css bug with cells border. (Related Issue: [#125])

### Features
- Locked Tooltips will now be movable and only dismissed with a right-click on it.
- Add an option to display the UI below the "Game Paused" label. (Related Issue: [#129])

## [3.0.0] - 2025-04-21
### Disclaimer
- BG3 Inspired Hotbar got a huge update ! We did a deep refactor of the module to make it more optimized, less laggy and easier for us to maintain. It includes a lot of bug fixes too. Let us know if you find new ones.

### New Features
- New setting: Customize Theme. Allows to change colors, grid size, etc. The theme can be set by the GM to be the same for every players or customizable for each of them. You can also export your theme and share it! (Related Issue: [#4])
- New setting: Customize Portrait. Allows to hide/show portrait elements, add border, display health overlay as mask for portrait with transparency, how death saving throws are displayed. (Related Issues: [#12], [#114])
- New setting: Customize Tooltip. Add a setting to display more or less informations in item's tooltip. (Related Issue: [#119])
- Added support for Custom Abilities & Skills and non-standard modifier. (Related Issues: [#51], [#67], [#117])
- Added support for Sebastian Crowe's Guide Apothecary spell slots. (Related Issue: [#56])
- MidiQoL Synchro: Auto set Bonus Action & Reaction as used when the token get the related Active Effect.

### Fixed
- Remove unnecessary inline css. (Related Issue: [#34])
- Use native 5e Tooltip. (Related Issues: [#41], [#59])
- Add "native" Activity/Macro Tooltip. Let us know if you want more informations inside. (Related Issue: [#54])
- Fix HUD not disapearing after combat. (Related Issue: [#101])
- Optimize weapons set auto-equip when a token is selected. (Related Issue: [#110])
- Fix filter right-click grey out feature. (Related Issue: [#115])
- Fix dragbar weird behaviors.

### And some other stuffs...

## [2.0.7] - 2025-04-09
### Fixed
- Fixed issue where shields weren't properly unequipped from loadout slots when switching weapon sets (Related Issue: [#107], Merged via PR [#108]).

### Added
- Added several new portrait customization settings (Shape, Border, Background, Health Overlay, HP Text, Overlay Mode) accessible via a new Portrait Settings submenu (Merged via PR [#108]). Size and other settings to come soon.

### Updated
- Updated Polish localization - PR [#109] Thanks @Lioheart!

## [2.0.6] - 2025-04-08

### Added
- Added setting to control Player List visibility ('Always Visible', 'Show on Hover', 'Hide Completely').

## [2.0.5] - 2025-04-08

### Fixed
Related Issue: [#58]
- Correctly display localized damage type(s) in Weapon tooltips.
- Fixed check for damage type(s) set using `.size` instead of `.length`.

## [2.0.4] - 2025-04-08

### Fixed
Revisited Issue: [#62] (oops)
- Resolved issue where Active Effect tooltips displayed raw `@Embed` strings instead of enriched content by adjusting the context passed to the text enricher.
Related Issue: [#64]
- Adjusted tooltip `z-index` to layer correctly below Foundry's core enricher tooltips but above other module elements.

### Improved
Related Issue: [#104]
- Refactored tooltip positioning to use CSS variables instead of inline styles, improving consistency.
- Removed throttling from tooltip `mousemove` updates for smoother tracking.
- Adjusted tooltip attachment and positioning logic to ensure initial placement occurs relative to the mouse cursor's position *after* the hover delay and content rendering, preventing initial misplacement. Still buggy, but doesn't go off screen.

## [2.0.3] - 2025-04-08

### Added
- Added initial localization files for French (`fr.json`), Dutch (`nl.json`), and Russian (`ru.json`).
- Added manifest support for French, Dutch, and Russian languages.

### Improved
- Updated Polish localization (`pl.json`) to include keys for tooltips (Issue [#37]).

## [2.0.2] - 2025-04-08

### Fixed
Related Issue: [#62]
- Improved context handling for enriching Active Effect descriptions in tooltips to better resolve embedded entities.

### Improved
Related Issue: [#37]
- Added localization support for tooltip labels (Action, Range, Target, Duration, Description, Status).
- Added localization support for tooltip status/duration text (Permanent, Active, Disabled, Rounds/Turns/Seconds Remaining).

### Added
Related PR: [#102] Thanks @Lioheart for the PR!
- Added manifest support for Polish language translation.

## [2.0.1] - 2025-03-28

### Fixed:
Related Issues: [#85] [#86]
- Fix Auto-Scale setting
- Allow Common Action Container to be unlocked
- Setting to Enable/Disable Common Action Container auto-populating
- Reorganize settings + categories

Related Issue: [#28]
- Extend "Collapse Foundry Macrobar" setting to Always/Never/When Hotbar visible

Related Issues: [29]
- Hide Spell Slots when https://foundryvtt.com/packages/dnd5e-spellpoints active and Spell Points item is found

Related Issue: [#80] [#15]
- Exclude Macros from cleanupInvalidItems

Related Issue: [#87]
- Fade out UI will now fade in when dragging over it

Related Issue: [#14]
- Add setting to show/hide hotbar controls menu on hover

Related Issue: [#92]
- Move getSceneControlButtons hook outside of init

Related Issue: [#61]
- When action type button is marked as "used" in filter container, associated skills will now be greyed out

Related Issue: [#97]
- Weapons will be auto-equipped only when switching sets, allowing to equip other weapons manually

### Improvements:

- Added settings to customize UI position and padding
- Added option to fully hide the macrobar

## [2.0.0] - 2025-03-25
**Thanks @Dapoulp for the PR's. Lots of great work while I was on holiday!**

## Optimisations
  - Remove Portrait Card from first container
  - Fix remaining code with 'enableUI' [#57]
  - Fix highlightStyle setting register module name
  - Fix deprecated ActiveEffect icon to img
  - Handle Auto Show/Hide Combat [#50]

## UI Scale
  - Added UI scale feature [#23-#49]
  - Add forced hidden css rule
  - Add 'align-items: end;' to #bg3-hotbar-container

## Filter Cantrip and Design
  - Add cantrip to filter
  - Opacity 0.25 to "excluded" items

## Rest & Turn Buttons
  - Added Rest & Turn buttons [#79]

## Weapon Sets and Common Actions Containers
  - Add weapons sets container
  - Auto-equip weapons when switching set
  - Disable "offhand" slot if 2-handed weapon equipped
  - Add common actions container (Dodge, Dash, etc)
  - Add option to hide common actions container
  - Common actions container: Use CPR items if installed, or chat message if not
  - Auto-populate weapons sets for non-character actors

## Auto-Populate Linked Token
  - Add Auto-populate Linked token option

## Portrait extra info
  - Add setting to display AC & Spell DC on Portrait as well as custom extra infos. Use Font Awesome icons.[#35-#18]

## Theme Settings
  - Add setting to change module Theme

## Client Synchronization
  - Add client synchronization. Now updates hotbar between clients looking at the same HUD. [#46]

## [1.8.0] - 2025-03-15
### Added
#### UI Toggle
- Added Scene Controls for toggling the hotbar UI with the gamepad icon (#50)
- Toggle state persists per client between refreshes
- Added keybinding support for toggling the hotbar UI
  - Default key: H
  - Can be customized in Foundry VTT's control settings if you have conflicts with other modules

### Improved
#### Code Organization
- Moved inline CSS from `ActiveEffectsContainer.js` to `effects.css` (#33)

## [1.7.1] - 2025-03-14
### Added
#### Activity Support
- Added support for dragging activities directly to the hotbar (#10)
- Activities are now recognized by their unique UUID format (Actor.id.Item.id.Activity.id)
- Activities bypass character sheet addition and are placed directly on the hotbar
- Improved handling of activity data to ensure proper display and functionality
- Added proper icon handling for activities:
  - Uses provided icon from data if available
  - Defaults to system activity type icons (attack.svg, heal.svg, etc.)

## [1.7.0] - 2025-03-14
### Added
#### Drag and Drop from other sources
- Items from compendiums and/or the items tab now correctly use Foundry's native item creation system if dropped directly onto the hotbar
- Added prevention of cross-actor item placement (can't add items from other characters)
- Improved error handling and user feedback for item placement
- Fixed activities not being populated when dropping items from compendiums

### Changed
#### Auto-Population Logic
- Simplified activity checks in auto-population to only consider actual activities
- Removed redundant item type checks from activity validation
- Made activity checks consistent between manual and automatic population when Creating a Token
- Items are now filtered purely by their selected type and whether they have activities
  - if an item does not have an activity, it will not be added to the hotbar. You can still manually add it to the hotbar.

#### Drag Bar
- Refactored `drag indicator` to be a child of `drag bar` for better inheritance and positioning
- Improved `drag indicator` transitions using opacity and transforms

### Fixed
#### Portrait Edge Artifacts
- Fixed black edge artifacts appearing around portrait images (#48)
- Moved inline styles to CSS for better rendering
- Improved border radius handling for health overlays
- Removed border artifact from portrait container by adding explicit border, outline, and box-shadow removal



## [1.6.3] - 2025-03-14
### Fixed
#### Passive Features Dialog
- Fixed css scoping to prevent style conflicts with other modules and fixed scoping with passives dialog

## [1.6.2] - 2025-03-14
### Fixed
#### CSS Variables and Organization
Included base.css file to include with `.bg3-hud` class to prevent style conflicts with other modules

## [1.6.1] - 2025-03-14
### Fixed
#### CSS Scoping
- Added proper `.bg3-hud` scoping to passives container CSS to prevent style conflicts with other modules
- Added proper `.bg3-hud` scoping to effects container CSS to prevent style conflicts with other modules
- Added proper `.bg3-hud` scoping to filter container CSS to prevent style conflicts with other modules
- Added proper `.bg3-hud` scoping to portrait container CSS to prevent style conflicts with other modules
- Added proper `.bg3-hud` scoping to base hotbar CSS to prevent style conflicts with other modules
- Replaced hardcoded z-index values with CSS variables for better stacking context management
- Removed redundant `bg3-hud` class from individual passive feature icons since they inherit parent scoping
- Removed redundant `bg3-hud` class from individual effect icons since they inherit parent scoping
- Removed redundant `bg3-hud` class from filter container elements since they inherit parent scoping
- Removed redundant `bg3-hud` class from portrait container elements since they inherit parent scoping
- Removed unused utilities.css file to reduce bundle size and prevent potential conflicts
- Fixed UI conflict with Monk's Active Tile Triggers module by properly scoping all CSS selectors (#24)

## [1.6.0] - 2025-03-14
### Fixed
#### Permissions UI Notification for Auto-Population
- Fixed issue where players would see "Unable to update actor token lack permission" warnings when DM places down actors with auto-populate enabled
- Added proper permission checks before attempting to modify token data during auto-population
- Added graceful handling of permission restrictions to prevent error messages
- Added debug logging for permission-related issues to help with troubleshooting

#### Macrobar Collapse Setting
- Fixed issue where the macrobar would repeatedly collapse on every render when the collapse setting was enabled
- Modified the collapse behavior to only trigger once on initial page load
- Improved performance by removing redundant collapse checks

### Improved
#### Passive Feature Tooltips
- Improved passive feature tooltips to be more streamlined and accurate to the core of what they are
- A feature is now correctly identified as passive if it has no action type (e.g., Darkvision, Damage Resistances)
- Passive features now only show icon, name, and description (labeled as "Passive Effect")
- Removed action details and uses from passive feature tooltips as they are not applicable
- Note: If a feature is not displaying in this container, verify the feature's configuration in your character sheet - a passive feature is one with no action type

### Added
#### Action Tracking in Filter Container
- Added ability to mark action filters as used via right-click in the filter container
- Used action filters are visually indicated with desaturation and darkening
- Used action filters cannot be selected for filtering until re-enabled
- Right-click again to re-enable a used action
- Action filters automatically reset on:
  - Combat token's turn starts
  - Combat ends

## [1.5.10] - 2025-03-13
### Fixed
#### Tooltips
- There's a difference between Foundry enrichers and DnD5e enrichers. I fixed it.
- Fixed material components setting not working due to incorrect module namespace reference
- Improved spell tooltip layout:
  - Moved Concentration and Ritual tags to a separate line for better readability
  - Added proper spacing between components and special properties

## [1.5.9] - 2025-03-13
### Fixed
#### Tooltips
- Finally understand how enrichers work and how to use them.
- Let me know if there are some that haven't been fixed.

## [1.5.8] - 2025-03-12
### Fixed
#### Tooltips
- Fixed tooltip enricher styling to be more consistent. Now I know how to do them, please post in issues if you find one that isn't changed
- Fixed some core functionality of the tooltip system by centralising logic

## [1.5.7] - 2025-03-12
### Fixed
#### Portrait Card
- Background container to be transparent and have no box shadow
- Centered the portrait card again

## [1.5.6] - 2025-03-11
### Changed
- Changed versioning to remove the "v" prefix
  - Removed all previous manifests versions from foundry releases page to start fresh with new versioning
  - The old versions can still be found on the github releases page

### Fixed
#### Auto-Population Spell Preparation
- Fixed the wording of spell preparation settings to be less confusing. Please check your settings to make sure they are correct
- Added ritual spells and always prepared spells to the list of special casting modes (alongside innate, at-will, and pact spells) that bypass preparation requirements
- Updated the macro logic to properly determine if a token's actor data is linked to its sheet using token.document.actorLink
- Moved the spell preparation check to a helper function in config.js to centralise its logic

#### Ability Card
- Fixed the positioning of the ability card popup panels sometimes not appearing in the correct location
- Fixed red border appearing on ability score hover due to menu item styles bleeding into ability card styles

#### Spell Tooltips
- Creatureobject now has whitespace

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