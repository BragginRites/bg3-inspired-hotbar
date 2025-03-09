# BG3 Inspired HUD

A Foundry VTT module that reimagines the hotbar interface, drawing inspiration from Baldur's Gate 3's elegant design. This module provides a persistent, token-specific interface for managing abilities, spells, and effects with modern UI/UX principles.

**Please check the Settings menu in FoundryVTT for more options for this module such as Auto-Populating actions for unlinked tokens or changing your opacity and fade out settings.**

![image](https://github.com/user-attachments/assets/373cfafb-377a-46dc-a619-a91e6b6f4e89)

## Installation

1. Open Foundry VTT and navigate to **Add-on Modules**
2. Click **Install Module**
3. Paste the following manifest URL:
   ```
   https://github.com/BragginRites/bg3-inspired-hotbar/releases/latest/download/module.json
   ```
4. Click **Install**
5. Enable the module in your world settings

## Core Interface

### Keybinds and Events

#### Portrait Controls
- **Portrait Image**
  - `Right-click` on portrait: Choose between token image or character portrait

- **Death Saving Throws** (Player Characters)
  - `Left-click` on success/failure boxes: Set the number of saves
  - `Left-click` on skull icon: Roll death saving throw
  - `Right-click` on skull icon: Reset all death saves
  
- **Ability Card**
  - `Left-click` on d20 button: Toggle ability card
  - `Left-click` on ability score: Show skills and saves
  - `Left-click` on skill/save: Roll check

#### Container Controls
- **Grid Containers**
  - `Right-click` on container: Open context menu for that space
  - `Middle-click` on tooltips: Pin/unpin

- **Passive Features**
  - `Right-click` on passive icon: Open features selection menu

- **Active Effects**
  - `Left-click` on effect: Toggle effect on/off
  - `Right-click` on effect: Remove effect

#### HUD Controls
- **Lock Button**
  - `Left-click`: Lock/Unlock all HUD options
  - `Right-click`: Open menu for separate locking options

- **Settings Button**
  - `Left-click`: Open settings menu

### Main Hotbar
The primary interface consists of a customizable grid system that persists between sessions.

- **Layout**
  - Multiple resizable containers
  - Adjustable column counts
  - Drag handles for container resizing
  - Lock toggle to prevent accidental changes

- **Visibility**
  - Automatic show/hide with token selection
  - Opacity controls
  - Position persistence
  - Lock toggle for permanent display

### Grid System

#### Containers
- Independently configurable grid layouts
- Drag-and-drop support between containers
- Visual feedback during interactions
- Token-specific configurations
- Automatic layout saving

#### Grid Items
- Support for spells, items, and features
- Uses indicators toggle in settings
- Names toggle in settings
- Drag-and-drop organization
- Right-click context menu

#### Divider Bars
- Interactive resize handles
- Visual feedback during resizing
- Column count adjustment
- Persistent size settings

### Portrait Integration

#### Portrait Card
- Character/token image display with right-click menu to switch between them
  - Token image (default)
  - Character portrait
  - Per-actor preference that persists between sessions
- Current / max hp display
- Temp hp display
- Health status overlay
- Quick access to character info
- Dynamic updates with token changes

#### Ability Card
- Ability score quick reference
- One-click ability checks
- Saving throw shortcuts
- Skill check integration
- Collapsible design

## Feature Components

### Active Effects Management
- Real-time effect tracking
- Toggle effects with left click
- Remove effects with right click
- Duration tracking
- Status indicators
- Automatically updates

### Filter System
- **Action Types**
  - Action
  - Bonus Action
  - Reaction

- **Spell Levels**
  - Individual level filtering
  - Pact magic support
  - Spell slot tracking
  - Visual slot indicators

- **Features**
  - Type-based (Class, Race, Monster, etc)
  - Category organization
  - Custom highlight styles

### Passive Features
- Automatic passive features detection (Darkvision, etc)
- Configure which ones to display or hide with a right click menu
- Tooltips on hover
- Output to chat on left click

### Tooltip System
- **Information**
  - Level and school
  - Components (V, S, M (no costs or material names)), Concentration and Ritual tags
  - Casting time
  - Range 
  - Target
  - Duration
  - Full description with a scrollbar if too big

- **Interactive Features**
  - Pin functionality with middle-mouse
  - Hide if pinned with middle-mouse
  - Draggable positioning
  - Highlighting if you hover over an item with a tooltip already pinned
  - Rich text support with clickable links (if pinned)

## Advanced Features

### Auto-population
- Automatically populates containers when creating an unlinked token
- Configurable settings to define which items to include during auto-population and where

### Context Menu
- Item edit opener
- Activity config opener
- Auto-populate per container (Use this inside the container you wish to populate) which follows Automatic Sorting rules
- Automatic Sorting in the following format and heirarchy:
  - **Type Order**: 
    - weapon
    - equipment
    - consumable
    - feat
    - spell
    - tool
    - loot
  - **Spell Sorting**: 
    - Sorted by spell level (cantrips, then 1st-9th) and then alphabetically by name
  - **Feature Sorting**: 
    - Sorted by feature type first, then alphabetically by name
  - **Other Items**: 
    - Sorted alphabetically within their type
- Quick removal

### Settings Column
- Add or Remove rows configuration
- Lock the HUD to always display and prevent drag & drop of items. Left click toggles lock on all. Right click menu to customise which settings.
- Reset layout to go back to 5 columns x 3 rows
- Clear all items on the entire hotbar
- Import/export functionality

### Data Management
- Token-specific storage
- Layout persistence
- Configuration backup
- Import/export support

## Technical Integration

### Token System
- Ownership validation
- Actor data integration
- Multi-token support
- Permission handling

## Compatibility

- Foundry VTT v12
- D&D5e system 4.3.5+ (other versions untested)
- Probably compatible with most token/combat modules
- Compatible with DAE and MidiQOL in mind

## Acknowledgments

This module is an independent fan creation, drawing inspiration from the excellent UI/UX design of Baldur's Gate 3. Special thanks to:
- Larian Studios for creating such an intuitive and user-friendly interface in BG3
- Wizards of the Coast for the D&D ecosystem that makes all of this possible

*This module is not affiliated with, endorsed by, or connected to Larian Studios, Wizards of the Coast, or Baldur's Gate 3.*

### Support
Please direct all issues, bugs, feature enhancements or to complain about how I wrote the code to: [GitHub Issues](https://github.com/BragginRites/bg3-inspired-hotbar/issues)

