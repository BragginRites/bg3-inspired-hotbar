## [3.4.4] - 2025-08-19
### Portrait Extra Data
- Portrait info: You can now show two values in one line (like 3/5). Example:
  - Focus {{itemName:Focus Points:system.uses.value}}/{{itemName:Focus Points:system.uses.max}}
- Portrait info: Point to a feature by its name (itemName:...) or by its UUID (itemUuid:...).
- Portrait info updates right away when you change the character sheet.
- If a value is missing for the current selected actor, the portrait info will not show the value.

### Portrait Mask & Context Menu
- Health overlay now clips to the actual portrait image when Overlay Mode is enabled (no forced circular clipping).
- Token image scaling applies to the masked subcontainer so both the mask and HP overlay follow the expanded portrait.
- Right-click portrait menu no longer gets cut off when the portrait is masked; overflow is allowed and scaling is centered to prevent top-cropping.

### General
- Added setting: "Show Ability Button only on hover". When enabled, the ability button remains hidden until the BG3 Hotbar (or its children) are hovered.

### Active Effects
- Fixed an issue where removing an active effect could leave a duplicate-looking icon until reselecting the token. The active effects bar now refreshes cleanly on changes.

### Auto-Populate
- Auto-populate on token creation is now strictly disabled for player characters. Only NPC tokens will auto-populate, respecting the linked/unlinked token settings.

### Fixed
- **Hotbar Token Scoping**: When multiple tokens share the same base actor, item grants now update only the receiving token’s hotbar. Items granted to one token will no longer appear on another token’s hotbar.

## [3.4.3] - 2025-08-16
### Added
- **Portrait Extra Data**: Support custom flags in portrait extra data (e.g., `flags.custom-dnd5e.rdpg`) and literal values via `=15`. (Related Issue: [#229])

### Fixed
- **Auto Sort and Spell Sorting**: Spells sort by level (cantrip–9) then alphabetically; all other types sort alphabetically. (Related Issue: [#244])
- **Lock Button Icon**: Icon now correctly switches between locked and unlocked states.
- **Hotbar Auto-Update on Item Create**: Newly added items appear immediately on the hotbar for the current token without requiring a manual re-render.
- **Item Context Menu Visibility**: Edit/Configure/Remove options only show when a cell has an item.
- **NPC Common Actions**: Corrected typo preventing vehicle handling during autopopulate (`vehicule` -> `vehicle`).
- **Extended Filter Sync**: After item deletion via sheet, the extended filter updates to stay in sync.
- **Spell Prep Warning**: Removed deprecation warning by using `method`/`prepared` instead of `preparation`.

## [3.4.2] - 2025-08-08
### Fixed
- **Unlinked Tokens Autopopulate** - Fixed breaking bug getting caught with populating common actions container

## [3.4.1] - 2025-08-08
### Fixed
- **Active Effects** - Fixed active effects not re-enabling or able to be deleted if disabled

## [3.4.0] - 2025-08-07
### Added
- **Container Popovers** - Add bags, pouches, and other containers options to your hotbar to open them in a popover window showing their contents. Items in the container can be moved around the popover, but other features and items should not be placed here if they don't belong to the container itself

### Reworked
- **Target Selector** - Refactored, changed UI/UX, added keybindings for accept and roll (default Enter), added setting for skipping if target already selected (Issue: [#226 & #234])

### Fixed
- **Hotbar Auto-Update** - Items now automatically appear in hotbars when given to any character, even if their token and therefor hotbar isn't currently selected. Giving items to un/linked NPCs for example
- **Consumable Items** - Potions, scrolls, and other consumables now properly auto-populate to hotbars with autopopulate feature
- **Actor Duplication** - Duplicated actors now correctly reference their own items instead of the original actor's items when the hotbar is not already rendered (Issue: [#228])
- **Drag Bar Movement** - Fixed to move at the right speed with set scale
- **Common Actions Bug** - Common Actions would sometimes duplicate when the container was empty but the features were on the sheet and then the token was placed on the canvas again

## [3.3.1] - 2025-07-31
### Fixed
 - **Passive Features Auto-Populate** - NPCs should autopopulate their passive features when toekn is created. This function was lost in last update(s).
 - **Annoying Console Log** - Oops. Forgot to remove it.

## [3.3.0] - 2025-07-30
### Important
- **Foundry VTT v13 & D&D 5e v5.x Support** - This release officially supports Foundry VTT v13 and D&D 5e v5.0.4+. Updates for Foundry VTT v12 will cease with this release. Users on v12 can continue using v3.2.6 as the final v12-compatible release.

### Added
- **NPC Container Defaults Setting** - Added new setting "NPCs Use Container Defaults" that allows NPCs (linked or unlinked) to ignore weapon sets and use container auto-populate defaults instead. This provides more flexibility for NPC hotbar organization.

### Fixed
- **Passive Features Detection** - Fixed issue where active abilities (actions, bonus actions, reactions) were incorrectly appearing in the passive features bar. Now only truly passive features are displayed.
- **Passive Container Display** - Fixed issue where all available passive features were displayed when none were selected. Now the passive container shows no features when none are selected, while maintaining the invisible tab functionality for right-click configuration access.
- **Target Selector** - Complete rewrite of target selector logic for D&D 5e v5.x compatibility. Target selector now properly integrates with Foundry's activity system, allowing normal activity selection followed by intelligent target selection only when needed. Updated to use v13's new targeting API (`canvas.tokens.setTargets`) and scene controls API (`ui.controls.render`).
- **Auto-Population** - Fixed auto-population features to correctly detect items with activities using D&D5e v5.x Map-based activities structure instead of the old array-based structure.


## [3.2.6] - 2025-07-09
### Fixed
- **Target Selector (Beta)**
  - **Target Selector Range Calculation** - Fixed range calculation to use proper edge-to-edge distance measurement instead of center-to-center.
  - **Target Selector Right-Click** - Improved right-click behavior to only confirm target selection if mouse hasn't been dragged (allows camera panning without accidental target confirmation).

### Features
- **Target Selector (Beta)**
    - **Target Selector Keybindings** - Added `[` and `]` keybinds for decreasing/increasing target count during targeting. Configurable in Foundry's keybind settings under "BG3 Inspired Hotbar" section.
    - **Range Indicator Customization** - Added three new settings for range indicator appearance:
      - **Range Indicator Shape**: Choose between circle or square indicators (default: square)
      - **Range Indicator Animation**: Choose between pulsing or static indicators (default: pulse)
      - **Range Indicator Line Width**: Choose line thickness from 1-4px (default: 2px)
    - **Settings Organization** - Reorganized all Target Selector settings into logical order: Enable → Range Checking → Range Indicators → Shape → Animation → Line Width → Auto-Target Self.

## [3.2.5] - 2025-07-08
### Fixed
- **Passive Features Classification** - Fixed issue where active abilities (actions, bonus actions, reactions) were incorrectly appearing in the passive features bar. Updated the classification logic to only include feats that are explicitly marked as passive or have no activation capabilities. (Related Issue: [#220])
- **Auto-Sort Spell Level Ordering** - Fixed critical bugs in the auto-sort functionality where spells were not sorting correctly by level. The fallback logic was incorrectly defaulting all spells to level 99 instead of their actual spell levels. Now spells properly sort from cantrips (level 0) through 9th level spells with alphabetical sub-sorting within each level. (Related Issue: [#211])
- **Passive Features Bar Hiding** - Added ability to completely empty the passive features bar by unchecking all features in the configuration dialog. Previously, when no features were selected, all available passive features would be displayed. Now an empty selection results in an empty (but still interactive) container. (Related Issue: [#205])
- **Spell Tooltips Compatibility** - Fixed issue where spell tooltips were not working for users on D&D 5e system v3.x. The macro tooltip implementation was using a hook-based approach that failed with older system versions. Reverted to the v3.1.3 approach using direct prototype extension for better cross-version compatibility. (Related Issue: [#209])
- **Portrait Toggle Logic** - Fixed the "Hide Portrait Image" setting working backwards. (Related Issue: [#204])
  > **⚠️ IMPORTANT:** If your portraits are suddenly hidden after this update, check your **"Hide Portrait Image"** setting in the module configuration. Due to the previous backwards logic, this setting was enabled by default and many users may have it toggled on. **Disable this setting** to show portraits again. At the top, you can change this setting for all users simultaneously if you are the gamemaster.
- **Auto-Populate Container Selection** - Fixed issue where newly added items (e.g., potions, scrolls) were always defaulting to container 1 instead of respecting the configured container settings. The `_findAppropriateContainer` method in `ItemUpdateManager.js` now properly handles consumable subtypes when determining which container should receive new items. For example, if potions are configured for container 3, new potions will now correctly auto-populate there instead of defaulting to container 1.

### Features
- **Extended Auto-Populate Options** - Replaced the blanket "Consumables" option with individual consumable subtype chips: Potions, Scrolls, Ammunition, Food & Drink, Wands, Rods, Poisons, and Trinkets. The feature includes automatic migration for existing users - any containers previously set to "Consumables" will be updated to show "Potions" and "Scrolls" by default. (Related Issue: [#21])

## [3.2.4] - 2025-07-07
### Fixed
- Version 3.2.3 was not pointing to 3.2.3 manifest, so had to release a new version to keep installs clean.

## [3.2.3] - 2025-07-07
### Fixed
- **Show Secrets Module Compatibility** - Fixed compatibility issue with Show Secrets module by properly passing enrichment options through libWrapper and correcting module name registration. Thanks to @kaelad02 (Show Secrets module developer) for identifying the issue and providing the fix. (Related Issue: [#219])

## [3.2.2] - 2025-07-04
### Fixed
- **Target Selector (Beta)** - Fixed issue where AOE spells and abilities with templates (like Fireball, Cone of Cold, etc.) were incorrectly using the target selector instead of Foundry's native template placement system. Now only creature-targeted spells use the target selector, while AOE spells that place templates (cone, cube, cylinder, line, radius, sphere) use the standard template placement.

## [3.2.1] - 2025-07-04
### Fixed
- **Target Selector (Beta)** - Fixed issue where healing spells (like Healing Word, Mass Healing Word, Cure Wounds) were not applying healing when using the target selector. The target selector was clearing selected targets too quickly, preventing MidiQoL from properly detecting and applying the healing effects. Now targets are maintained during spell execution with a small delay before clearing.

## [3.2.0] - 2025-07-04
### Features (Beta)
- **Target Selector System** - Added interactive target selection for spells and abilities inspired by Argon Combat HUD. When enabled, clicking items that require targeting will show a crosshair cursor and allow you to select targets on the canvas with visual feedback.
  - **Visual Feedback**: Crosshair cursor, range indicators, and target count display
  - **Range Validation**: D&D 5e grid-based distance calculation with visual range circles
  - **Multi-targeting**: Support for spells that can target multiple creatures (e.g., Aid, Magic Missile)
  - **Dynamic Target Adjustment**: Use `[` and `]` keys during targeting to increase/decrease target count for spells that scale with level (e.g., Eldritch Blast at higher levels)
  - **Settings**: Dedicated "Target Selector settings" section with options to enable/disable the system, range indicators, auto-targeting, and range checking
  - **⚠️ Beta Warning**: This feature is in beta and requires more testing. If you encounter issues or prefer not to use it, you can disable it in the Target Selector settings.

## [3.1.6] - 2025-07-04
### Features
- Split "Show Rest/Turn buttons" setting into granular dropdown control with options: "Show Both (Rest & Turn)", "Show Rest Only", "Show Turn Only", and "Show Neither". This allows GMs to show the End Turn button to players without showing rest buttons, giving more precise control over which buttons are visible. (Related Issue: [#213])

## [3.1.5] - 2025-07-04
### Features
- Add toggle button to switch between GM Hotbar and Token Hotbar when GM Hotbar is enabled. It's above the row controls buttons on the far right. (Related Issues: [#212], PR [#215] - Thanks @gubacelar!)
- Extend action type filters to search activities - items with activities now highlight when their activity action types match the selected filter. (PR [#208] - Thanks @kgsherman!)

## [3.1.4] - 2025-05-22 
### Disclaimer
- To improve performances and avoid bugs, Auto-equip items feature will now only look for items found in weapons sets, any other items will be ignored. This way, it allows you to manually equip items and still switch between your sets without having those manually equipped to be unequipped (as long as they are not in a weapon set).

### Fixed
- Fix players not allowed to use common actions macros. (Related Issues: [#191])
- Fix CPR setting button displayed even without CPR module installed. (Related Issues: [#191])
- Open Journal pages added to the hotbar when you click on them. (Related Issues: [#192])
- Fix Passives & Actives not showing correctly. (Related Issues: [#194])
- Fix Ability Check/Save & Skill roll for D&D previous to v4. (Related Issues: [#195])
- Fix Common Actions macros (non-cpr) text to adapt to 2014/2024 rules. (Related Issues: [#199])
- When minimized, the toggle button should be displayed on top of Taskbar (theripper93 module). (Related Issues: [#200])
- Fix a bug with auto-equip weapons. (Related Issues: [#201])

### Features
- Handle Classes without a native tooltip when added to hotbar.
- Display quantity on items if there is more than 1. (Related Issues: [#196])
- Change the way minize/maximize UI is handled.

## [3.1.3] - 2025-05-13 
### Fixed
- Fix Hide Macrobar logic.
- Fix HP Controls removing temp HP. (Related Issues: [#184])
- Allow players with permission to see HP Controls. (Related Issues: [#184])

### Features
- Add a option in Controls Container to "lock" the GM Hotbar to keep it even after selecting a token. (Related Issues: [#185])

## [3.1.2] - 2025-05-11
### Fixed
- Fix UI sometimes displayed to the top of the screen (with camera activated for example). (Related Issues: [#179])
- Limit "Extra Filters" to items with the "feat" type. (Related Issues: [#182])

### Features
- Patch DnD 5e Tooltip method to display charges for items without the "identified" property. Also non-identified items won't display their charges in hotbar anymore. (Related Issues: [#180])

## [3.1.1] - 2025-05-10
### Fixed
- Auto select HP in HP Control input to allow faster editing.
- Fix a bug when deactivating "Show Damage as Ranges" setting.

### Features
- Add new parameter in Right-Click Portrait Menu to scale Token Image based of Token Scale (Ratio). (Related Issues: [#163])

## [3.1.0] - 2025-05-09
### Fixed
- [Foundry V13] Fix saving throw new method name. (Related Issues: [#173])
- [Foundry V13] Fix "Collapse Macro" setting, it can't be collapsed anymore since V13.
- Fix a bug on Item updates.
- Fix "undefined" filters.
- Few minor fixes.

### Features
- Add a new setting to control Token Health on Portrait. (Related Issues: [#163])

## [3.0.9] - 2025-05-07
### Fixed
- [Foundry V13] Fix duplicated weapons set on switch. (Related Issues: [#161])
- Fix bug with weapon container after drag & drop. (Related Issues: [#166])

### Features
- Add a setting to disable Weapon Sets auto-equip. (Related Issue: [#164])
- Add a setting to show extra "filters" based on items with limited uses. Those extra filters can't hightlight or grey out hotbars items. (Related Issue: [#168])

## [3.0.8] - 2025-05-06
### Fixed
- Fix potential bug with Weapon Container. (Related Issues: [#160])

### Features
- Add CTRL/ALT modifier on Initiative button. (Related Issue: [#158])

## [3.0.7] - 2025-05-06
### Fixed
- Fix "error" related to tidy5e-sheet flag. (Related Issue: [#151])
- First step on making the module compatible with Foundry V13.
- Fix Common Action Container not populated with CPR Actions if not automated with CPR. (Related Issue: [#153])

### Features
- Add a setting to show a special hotbar for GM when multiple or no token selected.
- Add 5 presets macros for the GM Hotbar. (Related Issue: [#148])

## [3.0.6] - 2025-05-02
### Fixed
- Fix CSS details conflicts. (Related Issue: [#141])
- Update socket synchro logic.
- Fix UI not showing on load if a token was selected.
- Fix CPR actions auto-populating for the common actions container. You may have to repopulate it. (Related Issue: [#147])
- Add compatibility with Monks Player Settings. (Related Issue: [#146])
- Fix display for Theme Settings menu for high font-size.

### Features
- Add tooltip on non-active weapon sets. (Related Issue: [#145])

## [3.0.5] - 2025-04-30
### Fixed
- Fix bug with Ability Container for D&D 3.3.1. (Related Issue: [#138])

### Features
- Add Right-Click on Portrait Dice to roll initiative. (Related Issue: [#118])git add .
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
