// Grid Container Component

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
        if (this.index === 0) {
            this.portraitCard = new PortraitCard(this);
            this.element.appendChild(this.portraitCard.element);
        }
    }

    _createContainer() {
        this.element = document.createElement("div");
        this.element.classList.add("hotbar-subcontainer");
        this.element.setAttribute("data-container-index", this.index);
        
        // Set initial grid template
        this.element.style.setProperty('--cols', this.data.cols);
        this.element.style.setProperty('--rows', this.data.rows);
        this.element.style.setProperty('--cell-size', `${CONFIG.CELL_SIZE}px`);
        
        this.render();
    }

    render() {
        // Clear existing grid cells
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }

        // Update grid template using CSS variables
        this.element.style.setProperty('--cols', this.data.cols);
        this.element.style.setProperty('--rows', this.data.rows);
        this.element.style.setProperty('--cell-size', `${CONFIG.CELL_SIZE}px`);
        
        // Force a reflow to ensure the grid updates immediately
        this.element.offsetHeight;

        // Create grid cells
        for (let r = 0; r < this.data.rows; r++) {
            for (let c = 0; c < this.data.cols; c++) {
                const cell = this._createCell(c, r);
                this.element.appendChild(cell);
            }
        }

        // Re-add portrait card if this is the first container
        if (this.index === 0) {
            if (!this.portraitCard) {
                this.portraitCard = new PortraitCard(this);
            }
            this.portraitCard.render();
            this.element.appendChild(this.portraitCard.element);
        }
    }

    _createCell(col, row) {
        const cell = document.createElement("div");
        cell.classList.add("hotbar-cell");
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
        // Set draggable attribute first
        cell.setAttribute("draggable", item ? "true" : "false");
        
        if (item.icon) {
            const img = document.createElement("img");
            img.src = item.icon;
            img.alt = item.name || "";
            img.classList.add("hotbar-item");
            img.setAttribute("draggable", "false"); // Prevent image from being draggable
            img.style.borderRadius = '3px'; // Slightly smaller radius to fit within the cell border

            // Get the actual item data to check uses
            try {
                const itemData = await fromUuid(item.uuid);
                if (itemData?.system?.uses) {
                    const uses = itemData.system.uses;
                    const value = uses.value ?? 0;
                    const max = uses.max ?? 0;

                    // Only show uses if max is greater than 0
                    if (max > 0) {
                        // Always apply depleted visual state if no uses remain
                        if (value <= 0) {
                            img.classList.add("depleted");
                        }

                        // Only create and show uses counter if the setting is enabled
                        if (game.settings.get(CONFIG.MODULE_NAME, 'showItemUses')) {
                            const usesDiv = document.createElement("div");
                            usesDiv.classList.add("hotbar-item-uses");
                            usesDiv.textContent = `${value}/${max}`;
                            
                            if (value <= 0) {
                                usesDiv.classList.add("depleted");
                            }
                            
                            cell.appendChild(usesDiv);
                        }
                    }
                }
            } catch (error) {
                console.warn("Error fetching item data for uses display:", error);
            }
            
            cell.appendChild(img);

            if (item.name && game.settings.get(CONFIG.MODULE_NAME, 'showItemNames')) {
                const nameDiv = document.createElement("div");
                nameDiv.classList.add("hotbar-item-name");
                nameDiv.textContent = item.name;
                nameDiv.setAttribute("draggable", "false"); // Prevent text from being draggable
                cell.appendChild(nameDiv);
            }
        } else {
            cell.textContent = item.name || "";
        }

        // Store drag data on the cell itself
        cell._dragData = item ? { containerIndex: this.index, slotKey: cell.getAttribute("data-slot") } : null;
    }

    _setupCellEvents(cell, slotKey) {
        // Drag and drop handlers
        cell.addEventListener("dragstart", (e) => {
            // Check if drag and drop is locked
            if (this.ui._lockSettings.dragDrop) {
                e.preventDefault();
                return;
            }

            const item = this.data.items[slotKey];
            if (!item) return;

            // Set global dragging state
            document.body.classList.add('dragging-active');

            // Clear any pending tooltip timeout and data
            if (cell._tooltipTimeout) {
                clearTimeout(cell._tooltipTimeout);
                cell._tooltipTimeout = null;
            }
            cell._tooltipEventData = null;

            // Remove any tooltip
            if (cell._hotbarTooltip) {
                cell._hotbarTooltip.remove();
                cell._hotbarTooltip = null;
            }

            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("application/json", JSON.stringify(item));
            e.dataTransfer.setData("source", JSON.stringify({ 
                containerIndex: this.index, 
                slotKey: slotKey 
            }));

            // Create drag image
            const dragImage = document.createElement("div");
            dragImage.style.width = `${CONFIG.CELL_SIZE}px`;
            dragImage.style.height = `${CONFIG.CELL_SIZE}px`;
            dragImage.style.position = "absolute";
            dragImage.style.top = "-1000px";
            dragImage.style.left = "-1000px";
            
            if (item.icon) {
                const img = document.createElement("img");
                img.src = item.icon;
                img.style.width = "100%";
                img.style.height = "100%";
                dragImage.appendChild(img);
            } else {
                dragImage.textContent = item.name || "";
            }

            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, CONFIG.CELL_SIZE / 2, CONFIG.CELL_SIZE / 2);
            setTimeout(() => {
                if (dragImage.parentNode) dragImage.parentNode.removeChild(dragImage);
            }, 0);

            cell.classList.add("dragging");
        });

        cell.addEventListener("dragend", async (e) => {
            // Check if drag and drop is locked
            if (this.ui._lockSettings.dragDrop) {
                e.preventDefault();
                return;
            }

            if (!cell._dragData) return;

            // Reset global dragging state
            document.body.classList.remove('dragging-active');

            // Remove dragging class
            cell.classList.remove("dragging");

            // Get the main hotbar container
            const mainContainer = document.getElementById("bg3-hotbar-container");
            if (!mainContainer) return;

            // Get drop coordinates
            const dropX = e.clientX;
            const dropY = e.clientY;

            // Check if drop location is within the main hotbar container
            const rect = mainContainer.getBoundingClientRect();
            const isInsideHotbar = dropX >= rect.left && dropX <= rect.right && 
                                dropY >= rect.top && dropY <= rect.bottom;

            // If dropped outside the main hotbar container, remove the item
            if (!isInsideHotbar) {
                delete this.data.items[cell._dragData.slotKey];
                this.render();
                await this.ui.manager.persist();
            }

            // Clean up drag data
            delete cell._dragData;
        });

        cell.addEventListener("dragenter", (e) => {
            // Check if drag and drop is locked
            if (this.ui._lockSettings.dragDrop) {
                e.preventDefault();
                return;
            }

            e.preventDefault();
            cell.classList.add("dragover");
        });

        cell.addEventListener("dragleave", (e) => {
            // Check if drag and drop is locked
            if (this.ui._lockSettings.dragDrop) {
                e.preventDefault();
                return;
            }

            e.preventDefault();
            cell.classList.remove("dragover");
        });

        cell.addEventListener("dragover", (e) => {
            // Check if drag and drop is locked
            if (this.ui._lockSettings.dragDrop) {
                e.preventDefault();
                return;
            }

            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            cell.classList.add("dragover");
        });

        cell.addEventListener("drop", async (e) => {
            // Check if drag and drop is locked
            if (this.ui._lockSettings.dragDrop) {
                e.preventDefault();
                return;
            }

            e.preventDefault();
            cell.classList.remove("dragover");

            // Try to get JSON data from the drop
            let jsonData = e.dataTransfer.getData("application/json");
            // Fallback: try text/plain if application/json is empty
            if (!jsonData) {
                jsonData = e.dataTransfer.getData("text/plain");
            }

            let parsed;
            try {
                parsed = JSON.parse(jsonData);
            } catch (err) {
                ui.notifications.error(game.i18n.localize("BG3.Hotbar.Errors.InvalidDrop"));
                return;
            }

            // Handle drops from character sheet
            if (!parsed || (!parsed.type && !parsed.uuid)) {
                ui.notifications.error(game.i18n.localize("BG3.Hotbar.Errors.InvalidItem"));
                return;
            }

            const itemData = await fromUuid(parsed.uuid);
            if (!itemData) {
                ui.notifications.error(game.i18n.localize("BG3.Hotbar.Errors.ItemNotFound"));
                return;
            }

            // Check if the item belongs to the current actor
            const token = canvas.tokens.get(this.ui.manager.currentTokenId);
            if (token && token.actor && itemData.actor && token.actor.id !== itemData.actor.id) {
                ui.notifications.warn(game.i18n.localize("BG3.Hotbar.Errors.WrongToken"));
                return;
            }

            // Create the new item data
            const newItem = { 
                name: itemData.name, 
                icon: itemData.img, 
                uuid: parsed.uuid,
                type: itemData.type,
                activation: itemData.system?.activation?.type
            };

            // Handle activities from DnD5e v4+
            if (itemData.system?.activities) {
                // If this is a specific activity being dropped
                if (parsed.activityId && itemData.system.activities[parsed.activityId]) {
                    // Store reference to both parent and activity
                    newItem.activityId = parsed.activityId;
                    // Store the parent UUID - we'll use this to fetch the full item later
                    newItem.uuid = parsed.uuid; // This is the parent item's UUID
                }
            }

            // Store the current item in the target slot (if any) for potential swapping
            const existingItem = this.data.items[slotKey];

            // Handle internal hotbar moves
            const sourceData = e.dataTransfer.getData("source");
            if (sourceData) {
                try {
                    const sourceInfo = JSON.parse(sourceData);
                    const sourceContainer = this.ui.gridContainers[sourceInfo.containerIndex];
                    if (sourceContainer) {
                        if (sourceInfo.containerIndex === this.index && sourceInfo.slotKey === slotKey) {
                            // Dropped on same slot, do nothing
                            return;
                        }

                        // If there's an item in the target slot, move it to the source slot
                        if (existingItem) {
                            sourceContainer.data.items[sourceInfo.slotKey] = existingItem;
                        } else {
                            delete sourceContainer.data.items[sourceInfo.slotKey];
                        }
                        sourceContainer.render();
                    }
                } catch (err) {
                    console.warn("Error parsing source data:", err);
                }
            }

            // Update the target cell
            this.data.items[slotKey] = newItem;
            this.render();
            await this.ui.manager.persist();
        });

        // Click handlers
        cell.addEventListener("click", async (e) => {
            if (e.button !== 0) return;
            const item = this.data.items[slotKey];
            if (!item) return;

            try {
                const itemData = await fromUuid(item.uuid);
                if (!itemData) {
                    ui.notifications.error(game.i18n.localize("BG3.Hotbar.Errors.UnableToRetrieve"));
                    return;
                }

                // Get actor from lastKnownActorId first, then fallback to token
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

                // Create options object with advantage/disadvantage based on modifier keys
                const options = {
                    configureDialog: false,
                    legacy: false,
                    event: e
                };
                
                // Handle disadvantage (Ctrl key)
                if (e.ctrlKey) {
                    options.disadvantage = true;
                }
                
                // Handle advantage (Alt key)
                if (e.altKey) {
                    options.advantage = true;
                }
                
                // Use the item with the correct method for Foundry v12
                const used = await itemData.use(options, {event: e});
                
                if (used) {
                    // Update the cell to reflect new uses state
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

        // Add tooltip events - using the new TooltipFactory
        cell.addEventListener("mouseenter", async (e) => {
            const item = this.data.items[slotKey];
            // Only proceed if we have an item and we're not currently dragging
            if (item && !document.body.classList.contains('dragging-active')) {
                if (cell._hotbarTooltip?._pinned) {
                    cell._hotbarTooltip.highlight(true);
                } else if (!cell._hotbarTooltip) {
                    // Get the tooltip delay from settings, or use the default
                    const tooltipDelay = game.settings.get(CONFIG.MODULE_NAME, 'tooltipDelay') || CONFIG.TOOLTIP_DELAY;
                    
                    // Clear any existing timeout
                    if (cell._tooltipTimeout) {
                        clearTimeout(cell._tooltipTimeout);
                    }
                    
                    // Only set up new tooltip if we're not dragging
                    if (!document.body.classList.contains('dragging-active')) {
                        // Store event data for delayed tooltip creation
                        cell._tooltipEventData = { cell, item, event: e };
                        
                        // If delay is 0, show tooltip immediately
                        if (tooltipDelay === 0) {
                            // Double check we're still not dragging
                            if (!document.body.classList.contains('dragging-active')) {
                                // Get the full item data first
                                const fullItemData = await fromUuid(item.uuid);
                                if (!fullItemData) {
                                    console.warn("Could not fetch full item data for tooltip");
                                    return;
                                }

                                // If this is an activity, get the parent item and enhance it with activity data
                                if (item.activityId && fullItemData.system?.activities?.[item.activityId]) {
                                    const activity = fullItemData.system.activities[item.activityId];
                                    // Clone the parent item data so we don't modify the original
                                    const enhancedItem = foundry.utils.deepClone(fullItemData);
                                    // Add activity-specific data
                                    enhancedItem.selectedActivity = {
                                        id: item.activityId,
                                        data: activity
                                    };
                                    const tooltip = await TooltipFactory.create(enhancedItem);
                                    if (tooltip) tooltip.attach(cell, e);
                                } else {
                                    const tooltip = await TooltipFactory.create(fullItemData);
                                    if (tooltip) tooltip.attach(cell, e);
                                }
                            }
                            return;
                        }
                        
                        // Set a timeout to show the tooltip after the delay
                        cell._tooltipTimeout = setTimeout(async () => {
                            // Only create tooltip if we're still hovering and not dragging
                            if (cell._tooltipEventData && !document.body.classList.contains('dragging-active')) {
                                // Get the full item data first
                                const fullItemData = await fromUuid(item.uuid);
                                if (!fullItemData) {
                                    console.warn("Could not fetch full item data for tooltip");
                                    return;
                                }

                                // If this is an activity, get the parent item and enhance it with activity data
                                if (item.activityId && fullItemData.system?.activities?.[item.activityId]) {
                                    const activity = fullItemData.system.activities[item.activityId];
                                    // Clone the parent item data so we don't modify the original
                                    const enhancedItem = foundry.utils.deepClone(fullItemData);
                                    // Add activity-specific data
                                    enhancedItem.selectedActivity = {
                                        id: item.activityId,
                                        data: activity
                                    };
                                    const tooltip = await TooltipFactory.create(enhancedItem);
                                    if (tooltip) tooltip.attach(cell, e);
                                } else {
                                    const tooltip = await TooltipFactory.create(fullItemData);
                                    if (tooltip) tooltip.attach(cell, e);
                                }
                                cell._tooltipEventData = null;
                            }
                        }, tooltipDelay);
                    }
                }
            }
        });

        cell.addEventListener("mouseleave", () => {
            // Clear any pending tooltip timeout
            if (cell._tooltipTimeout) {
                clearTimeout(cell._tooltipTimeout);
                cell._tooltipTimeout = null;
                cell._tooltipEventData = null;
            }
            
            if (cell._hotbarTooltip) {
                if (cell._hotbarTooltip._pinned) {
                    cell._hotbarTooltip.highlight(false);
                } else {
                    cell._hotbarTooltip.remove();
                    cell._hotbarTooltip = null;
                }
            }
        });
    }

    // Grid manipulation methods
    incrementCols() {
        this.data.cols++;
        this.render();
    }

    decrementCols() {
        if (this.data.cols <= 1) return;
        this.data.cols--;
        this.render();
    }

    async updateCell(slotKey) {
        const cell = this.element.querySelector(`[data-slot="${slotKey}"]`);
        const item = this.data.items[slotKey];
        if (cell && item) {
            // Clear existing content
            while (cell.firstChild) {
                cell.removeChild(cell.firstChild);
            }
            // Re-setup the cell
            await this._setupItemCell(cell, item);
        }
    }
}

export { GridContainer }; 