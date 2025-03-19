// GridContainer.js

import { CONFIG } from '../utils/config.js';
import { PortraitCard } from './PortraitCard.js';
import { TooltipFactory } from '../tooltip/TooltipFactory.js';
import { fromUuid } from '../utils/foundryUtils.js';

class GridContainer {
  constructor(ui, data, index) {
    this.ui = ui;
    this.data = data;
    this.index = index;
    this.element = null;
    this.items = new Map();
    this.portraitCard = null;
    this.lastKnownActorId = null;
    
    this._createContainer();
  }

  _createContainer() {
    this.element = document.createElement("div");
    this.element.classList.add("bg3-hud", "hotbar-subcontainer", "drag-cursor");
    this.element.setAttribute("data-container-index", this.index);
    
    // Set initial grid template via CSS variables.
    this.element.style.setProperty('--cols', this.data.cols);
    this.element.style.setProperty('--rows', this.data.rows);
    this.element.style.setProperty('--cell-size', `${CONFIG.CELL_SIZE}px`);
    
    this.render();
  }

  render() {
    // Clear existing grid cells while preserving the portrait card (if present).
    // We'll remove all children except the portrait card in container 0.
    if (this.index === 0 && this.portraitCard) {
      // Remove all cells except the portrait card.
      const children = Array.from(this.element.children).filter(
        (child) => child !== this.portraitCard.element
      );
      children.forEach(child => this.element.removeChild(child));
    } else {
      while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
      }
    }

    // Update grid template
    this.element.style.setProperty('--cols', this.data.cols);
    this.element.style.setProperty('--rows', this.data.rows);
    this.element.style.setProperty('--cell-size', `${CONFIG.CELL_SIZE}px`);
    
    // Force a reflow to update grid layout.
    this.element.offsetHeight;

    // Create grid cells.
    for (let r = 0; r < this.data.rows; r++) {
      for (let c = 0; c < this.data.cols; c++) {
        const cell = this._createCell(c, r);
        this.element.appendChild(cell);
      }
    }
  }

  _createCell(col, row) {
    const cell = document.createElement("div");
    cell.classList.add("bg3-hud", "hotbar-cell", "drag-cursor");
    const slotKey = `${col}-${row}`;
    cell.setAttribute("data-slot", slotKey);

    const item = this.data.items[slotKey];
    if (item) {
      this._setupItemCell(cell, item);
    }

    this._setupCellEvents(cell, slotKey);
    return cell;
  }

  async _setupItemCell(cell, item) {
    // Clear any existing content.
    while (cell.firstChild) {
      cell.removeChild(cell.firstChild);
    }
    
    // Set draggable state.
    if (item) {
      cell.setAttribute("draggable", "true");
      cell.classList.add("bg3-hud", "has-item");
    } else {
      cell.setAttribute("draggable", "false");
      cell.classList.remove("bg3-hud", "has-item");
    }
    
    if (item?.icon) {
      const img = document.createElement("img");
      img.src = item.icon;
      img.alt = item.name || "";
      img.classList.add("bg3-hud", "hotbar-item");
      img.style.borderRadius = '3px';
      // Make sure the image doesn't interfere with drag operations
      img.draggable = false;
      img.style.pointerEvents = "none";

      // Only check uses for non-macro items.
      if (item.type !== "Macro") {
        try {
          const itemData = await fromUuid(item.uuid);
          if (itemData?.system?.uses) {
            const uses = itemData.system.uses;
            const value = uses.value ?? 0;
            const max = uses.max ?? 0;

            // Only show uses if max > 0.
            if (max > 0) {
              if (value <= 0) {
                img.classList.add("bg3-hud", "depleted");
              }
              if (game.settings.get(CONFIG.MODULE_NAME, 'showItemUses')) {
                const usesDiv = document.createElement("div");
                usesDiv.classList.add("bg3-hud", "hotbar-item-uses");
                usesDiv.textContent = `${value}/${max}`;
                usesDiv.style.pointerEvents = "none"; // Prevent interference with drag
                if (value <= 0) {
                  usesDiv.classList.add("bg3-hud", "depleted");
                }
                cell.appendChild(usesDiv);
              }
            }
          }
        } catch (error) {
          console.warn("Error fetching item data for uses display:", error);
        }
      }
      
      cell.appendChild(img);

      if (item.name && game.settings.get(CONFIG.MODULE_NAME, 'showItemNames')) {
        const nameDiv = document.createElement("div");
        nameDiv.classList.add("bg3-hud", "hotbar-item-name");
        nameDiv.textContent = item.name;
        nameDiv.style.pointerEvents = "none"; // Prevent interference with drag
        cell.appendChild(nameDiv);
      }
    } else if (item) {
      const textDiv = document.createElement("div");
      textDiv.textContent = item.name || "";
      textDiv.style.pointerEvents = "none"; // Prevent interference with drag
      cell.appendChild(textDiv);
    }

    // Store drag data on the cell.
    cell._dragData = item ? { containerIndex: this.index, slotKey: cell.getAttribute("data-slot") } : null;
  }

  _setupCellEvents(cell, slotKey) {
    // Set up draggable state
    const item = this.data.items[slotKey];
    cell.setAttribute("draggable", item ? "true" : "false");
    cell.classList.toggle("bg3-hud", "has-item", !!item);

    // Basic dragstart: set dataTransfer with a simple JSON object
    cell.addEventListener("dragstart", (e) => {
      if (this.ui.dragDropManager.isLocked()) {
        e.preventDefault();
        return;
      }

      const item = this.data.items[slotKey];
      if (!item) {
        e.preventDefault();
        return;
      }

      document.body.classList.add('dragging-active');
      document.body.classList.add('drag-cursor');
      cell.classList.add("dragging");

      // Clear any tooltips
      if (cell._tooltipTimeout) {
        clearTimeout(cell._tooltipTimeout);
        cell._tooltipTimeout = null;
      }
      if (cell._hotbarTooltip) {
        cell._hotbarTooltip.remove();
        cell._hotbarTooltip = null;
      }

      // Allow movement
      e.dataTransfer.effectAllowed = "move";
      // Set a simple JSON payload containing the source slot key and the item
      e.dataTransfer.setData("text/plain", JSON.stringify({
        type: item.type,
        slotKey: slotKey,
        containerIndex: this.index,
        item: item
      }));
    });

    // Allow dropping by preventing default on dragover
    cell.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (this.ui.dragDropManager.isLocked()) return;
      e.dataTransfer.dropEffect = "move";
      cell.classList.add("dragover");
    });

    // On drop, parse the source data and update the target slot
    cell.addEventListener("drop", async (e) => {
      e.preventDefault();
      if (this.ui.dragDropManager.isLocked()) return;

      cell.classList.remove("dragover");

      // Parse the transferred data
      let dragData;
      try {
        dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
      } catch (err) {
        console.error("Failed to parse drop data:", err);
        return;
      }

      // Do nothing if dropped in the same slot
      if (dragData.slotKey === slotKey && dragData.containerIndex === this.index) return;

      // For a macro drop from Foundry or an item drop from an actor sheet
      if (dragData.type === "Macro" || dragData.uuid?.startsWith("Macro.") || dragData.uuid) {
        await this.ui.dragDropManager.handleDrop(dragData, this, slotKey);
        return;
      }

      // Handle internal moves (between slots/containers)
      // First, store the item that's currently in the target slot (if any)
      const targetItem = this.data.items[slotKey];
      const sourceContainer = this.ui.gridContainers[dragData.containerIndex];

      // Move the dragged item to the target slot
      this.data.items[slotKey] = dragData.item;

      // If there was an item in the target slot, move it to the source slot
      if (targetItem && sourceContainer) {
        sourceContainer.data.items[dragData.slotKey] = targetItem;
      } else if (sourceContainer) {
        // If there was no item in the target slot, clear the source slot
        delete sourceContainer.data.items[dragData.slotKey];
      }

      // Re-render and persist changes
      await this.render();
      if (dragData.containerIndex !== this.index) {
        await sourceContainer?.render();
      }
      await this.ui.manager.persist();
    });

    // Basic visual feedback on dragenter/dragleave
    cell.addEventListener("dragenter", (e) => {
      e.preventDefault();
      if (this.ui.dragDropManager.isLocked()) return;
      cell.classList.add("dragover");
    });

    cell.addEventListener("dragleave", (e) => {
      e.preventDefault();
      if (this.ui.dragDropManager.isLocked()) return;
      cell.classList.remove("dragover");
    });

    // Add dragend to clean up
    cell.addEventListener("dragend", (e) => {
      document.body.classList.remove('dragging-active');
      document.body.classList.remove('drag-cursor');
      cell.classList.remove("dragging");
      cell.classList.remove("dragover");
    });

    // Handle click events
    cell.addEventListener("click", async (e) => {
      if (e.button !== 0) return;
      const item = this.data.items[slotKey];
      if (!item) return;
      try {
        // Execute Macro if item is a macro.
        if (item.type === "Macro") {
          const macro = game.macros.get(item.macroId);
          if (!macro) {
            ui.notifications.error(game.i18n.localize("BG3.Hotbar.Errors.MacroNotFound"));
            return;
          }
          await macro.execute();
          return;
        }

        const itemData = await fromUuid(item.uuid);
        if (!itemData) {
          ui.notifications.error(game.i18n.localize("BG3.Hotbar.Errors.UnableToRetrieve"));
          return;
        }

        let actor = null;
        if (this.lastKnownActorId) {
          actor = game.actors.get(this.lastKnownActorId);
        }
        if (!actor) {
          const token = canvas.tokens.get(this.ui.manager.currentTokenId);
          if (token?.actor) {
            actor = token.actor;
            this.lastKnownActorId = actor.id;
          }
        }
        if (!actor) {
          ui.notifications.error(game.i18n.localize("BG3.Hotbar.Errors.NoActor"));
          return;
        }

        const options = {
          configureDialog: false,
          legacy: false,
          event: e
        };
        if (e.ctrlKey) {
          options.disadvantage = true;
        }
        if (e.altKey) {
          options.advantage = true;
        }

        const used = await itemData.use(options, { event: e });
        if (used) {
          await this.updateCell(slotKey);
        }
      } catch (error) {
        console.error("BG3 Inspired Hotbar | Error using item:", error);
        ui.notifications.error(`Error using item: ${error.message}`);
      }
    });

    cell.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.ui.contextMenu.show(e, this, slotKey);
    });

    // Tooltip events.
    cell.addEventListener("mouseenter", async (e) => {
      const item = this.data.items[slotKey];
      if (!item || document.body.classList.contains('dragging-active')) return;

      // Clear any existing timeout
      if (cell._tooltipTimeout) {
        clearTimeout(cell._tooltipTimeout);
        cell._tooltipTimeout = null;
      }

      // If tooltip is pinned and still exists, just highlight it
      if (cell._hotbarTooltip?._pinned && cell._hotbarTooltip.element) {
        cell._hotbarTooltip.highlight(true);
        return;
      }

      // Clear any existing unpinned tooltip
      if (cell._hotbarTooltip && !cell._hotbarTooltip._pinned) {
        cell._hotbarTooltip.remove();
        cell._hotbarTooltip = null;
      }

      // Get tooltip delay from settings
      const tooltipDelay = game.settings.get(CONFIG.MODULE_NAME, 'tooltipDelay') || CONFIG.TOOLTIP_DELAY;

      const createTooltip = async () => {
        try {
          if (item.type === "Macro") {
            const macro = game.macros.get(item.macroId);
            if (macro) {
              const tooltip = await TooltipFactory.create({
                name: macro.name,
                type: "Macro",
                img: macro.img,
                command: macro.command
              });
              if (tooltip) {
                cell._hotbarTooltip = tooltip;
                tooltip.attach(cell, e);
              }
            }
            return;
          }

          const fullItemData = await fromUuid(item.uuid);
          if (!fullItemData) {
            console.warn("Could not fetch full item data for tooltip");
            return;
          }

          let tooltipData = fullItemData;
          if (item.activityId && fullItemData.system?.activities?.[item.activityId]) {
            const activity = fullItemData.system.activities[item.activityId];
            tooltipData = foundry.utils.deepClone(fullItemData);
            tooltipData.selectedActivity = {
              id: item.activityId,
              data: activity
            };
          }

          const tooltip = await TooltipFactory.create(tooltipData);
          if (tooltip) {
            cell._hotbarTooltip = tooltip;
            tooltip.attach(cell, e);
          }
        } catch (error) {
          console.error("Error creating tooltip:", error);
        }
      };

      // If delay is 0, create tooltip immediately
      if (tooltipDelay === 0) {
        await createTooltip();
      } else {
        // Otherwise set timeout
        cell._tooltipTimeout = setTimeout(createTooltip, tooltipDelay);
      }
    });

    cell.addEventListener("mouseleave", () => {
      // Clear any pending tooltip timeout
      if (cell._tooltipTimeout) {
        clearTimeout(cell._tooltipTimeout);
        cell._tooltipTimeout = null;
      }

      // Handle tooltip cleanup
      if (cell._hotbarTooltip) {
        if (cell._hotbarTooltip._pinned && cell._hotbarTooltip.element) {
          cell._hotbarTooltip.highlight(false);
        } else {
          cell._hotbarTooltip.remove();
          cell._hotbarTooltip = null;
        }
      }
    });
  }

  async updateCell(slotKey) {
    const cell = this.element.querySelector(`[data-slot="${slotKey}"]`);
    const item = this.data.items[slotKey];
    if (cell && item) {
      while (cell.firstChild) {
        cell.removeChild(cell.firstChild);
      }
      await this._setupItemCell(cell, item);
    }
  }

  async _getMacro(data) {
    if (data.uuid?.startsWith("Macro.")) {
      return game.macros.get(data.uuid.split(".")[1]);
    }
    return game.macros.get(data.id || data._id);
  }
}

export { GridContainer };
