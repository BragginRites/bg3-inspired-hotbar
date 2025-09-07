# BG3 Inspired HUD

A Foundry VTT module that reimagines the hotbar interface with a design inspired by Baldur's Gate 3. It provides a persistent, token-specific interface for managing abilities, spells, and effects with modern UI/UX principles.

**Please check the Settings menu in Foundry VTT for options such as auto-populating actions for unlinked tokens, opacity adjustments, and fade out settings.**

<img width="1822" height="569" alt="image" src="https://github.com/user-attachments/assets/738b0f4d-b5cf-4fec-8002-9833f86cf211" />

Coffee helps me stay up to 2am to write these modules. Thank you for the lack of sleep in advance!

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/bragginrites)

## Other Modules

Check out my other module(s):

- [Token Loot](https://github.com/BragginRites/token-loot)
- [Surge Dice - A Narrative Dice Pool](https://github.com/BragginRites/surge-dice)
- [Inspect Statblock](https://github.com/BragginRites/inspect-statblock)

## Quick Usage

- **Installation**:
  1. Open Foundry VTT and navigate to **Add-on Modules**.
  2. Click **Install Module** and paste this manifest URL:
     ``` 
     https://github.com/BragginRites/bg3-inspired-hotbar/releases/latest/download/module.json
     ```
  3. Click **Install** and enable the module in your world settings.
- **Core Functionality**:
  - Select a token to reveal its customizable hotbar.
  - Click icons to activate abilities, roll checks, or toggle effects.
  - Use right-click for additional options and context menus.

## Keybinds

- **Portrait Controls**:
  - **Right-click on Portrait**: Switch between token image and character portrait.
  - **Death Saving Throws (PCs)**:
    - Left-click on success/failure boxes to set saves.
    - Left-click on the skull icon to roll a death save.
    - Right-click on the skull icon to reset saves.
- **HUD Controls**:
  - **Lock Button**:
    - Left-click to lock/unlock all HUD options.
    - Right-click for individual locking options.
  - **Settings Button**: Left-click to open the settings menu.
- **Grid and Container Interactions**:
  - **Grid Containers**:
    - Right-click to open a context menu.
    - Middle-click on tooltips to pin/unpin.
  - **Active Effects**:
    - Left-click an effect to toggle it.
    - Right-click to remove an effect.

## Troubleshooting: Unlinked tokens that were previously linked

If an unlinked token is missing actions or shows mismatched entries (e.g., common actions in the Combat container pointing to the base actor instead of the token), follow these steps to fully reset the token’s hotbar data:

1. Re-enable “Link Actor Data” for the actor’s base prototype token.
2. Drag a linked token for this actor onto the canvas.
3. Completely clear the BG3 hotbar for that token (all hotbar containers, Weapons, Combat/Common Actions) and ensure Passive and Active effects panels show nothing.
4. Delete the placed token.
5. Open the actor’s prototype token again and uncheck “Link Actor Data” to make tokens unlinked.
6. Place a new unlinked token onto the canvas. The module will auto-populate it cleanly.

## Acknowledgments

This module is an independent fan creation, drawing inspiration from the excellent UI/UX design of Baldur's Gate 3. Special thanks to:

- Larian Studios for creating such an intuitive interface in BG3.
- Wizards of the Coast for the D&D ecosystem that makes this possible.

*This module is not affiliated with, endorsed by, or connected to Larian Studios, Wizards of the Coast, or Baldur's Gate 3.*

## Support

For issues, bugs, or feature requests, please submit them via [GitHub Issues](https://github.com/BragginRites/bg3-inspired-hotbar/issues).