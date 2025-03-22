// Context Menu Component

import { CONFIG } from '../utils/config.js';
import { fromUuid } from '../utils/foundryUtils.js';
import { AutoPopulateDialog } from '../features/AutoPopulateContainer.js';
import { AutoSort } from '../features/AutoSort.js';

export class ContextMenu {
    constructor(ui) {
        this.ui = ui;
        this.element = null;
        this.currentContainer = null;
        this.currentSlot = null;
        this._documentClickHandler = this._handleDocumentClick.bind(this);
    }

    _handleDocumentClick(e) {
        if (!this.element) return;
        
        if (this.element.contains(e.target)) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        
        this.hide();
    }

    async show(e, container, slot) {
        e.preventDefault();
        e.stopPropagation();
        
        this.hide();
        this.currentContainer = container;
        this.currentSlot = slot;

        // Remove any existing menus
        const existingMenu = document.querySelector('.bg3-hud.menu-container');
        if (existingMenu) existingMenu.remove();

        this.element = document.createElement("div");
        this.element.id = "hotbar-context-menu";
        this.element.classList.add("bg3-hud", "menu-container");
        
        // Add the menu to the HUD container
        this.ui.element.appendChild(this.element);

        // Create menu items
        const menuItems = await this._createMenuItems();
        menuItems.forEach(item => this.element.appendChild(item));

        // Get the clicked cell's position
        const cell = container.element.querySelector(`[data-slot="${slot}"]`);
        if (!cell) return;
        
        // Get the cell and HUD container positions
        const cellRect = cell.getBoundingClientRect();
        const containerRect = this.ui.element.getBoundingClientRect();

        // Make menu visible to get its dimensions
        this.element.classList.add("visible");
        const menuRect = this.element.getBoundingClientRect();
        
        // Calculate position relative to the HUD container
        // Position menu so its bottom-left corner aligns with the cell's top-right corner
        let left = (cellRect.right - containerRect.left);
        let top = (cellRect.top - containerRect.top) - menuRect.height;

        // Apply position
        this.element.style.position = 'absolute';
        this.element.style.left = `${left}px`;
        this.element.style.top = `${top}px`;
        this.element.style.zIndex = '1000';

        // Add click handler
        document.addEventListener("click", this._documentClickHandler);
    }

    async _createMenuItems() {
        const menuItems = [];
        const storedItem = this.currentContainer.data.items[this.currentSlot];

        // Item-specific options
        if (storedItem) {
            const editOption = this._createMenuItem(
                '<i class="fas fa-edit"></i>',
                game.i18n.localize("BG3.Hotbar.ContextMenu.EditItem"),
                async () => {
                    try {
                        const itemData = await fromUuid(storedItem.uuid);
                        if (itemData?.sheet) itemData.sheet.render(true);
                    } catch (error) {
                        console.error("BG3 Inspired Hotbar | Error editing item:", error);
                        ui.notifications.error(`Error editing item: ${error.message}`);
                    }
                    this.hide();
                }
            );
            menuItems.push(editOption);

            // Configure Activities option
            const configureOption = this._createMenuItem(
                '<i class="fas fa-cog"></i>',
                game.i18n.localize("BG3.Hotbar.ContextMenu.ConfigureActivities"),
                async () => {
                    try {
                        const itemData = await fromUuid(storedItem.uuid);
                        if (itemData?.sheet) {
                            const sheet = itemData.sheet.render(true);
                            if (sheet?.activateTab) {
                                setTimeout(() => {
                                    try {
                                        sheet.activateTab("activities");
                                    } catch (err) {
                                        // No activities tab found
                                    }
                                }, 100);
                            }
                        }
                    } catch (error) {
                        console.error("BG3 Inspired Hotbar | Error configuring activities:", error);
                        ui.notifications.error(`Error configuring activities: ${error.message}`);
                    }
                    this.hide();
                }
            );
            menuItems.push(configureOption);

            // Remove option
            const removeOption = this._createMenuItem(
                '<i class="fas fa-trash"></i>',
                game.i18n.localize("BG3.Hotbar.ContextMenu.Remove"),
                async () => {
                    // Remove the item
                    delete this.currentContainer.data.items[this.currentSlot];
                    this.currentContainer.render();
                    
                    // Ensure we have UI and manager references before persisting
                    if (this.ui?.manager) {
                        await this.ui.manager.persist();
                    } else if (this.currentContainer.ui?.manager) {
                        await this.currentContainer.ui.manager.persist();
                    }
                    
                    this.hide();
                },
                true
            );
            menuItems.push(removeOption);

            // Add divider between item-specific and container-wide options
            const divider = document.createElement("div");
            divider.classList.add("menu-divider");
            menuItems.push(divider);
        }

        // Container-wide options
        const token = canvas.tokens.get(this.ui?.manager?.currentTokenId);
        if (token?.actor) {
            if(this.currentContainer.data?.delOnly !== true) {
                const autoPopulateOption = this._createMenuItem(
                    '<i class="fas fa-magic"></i>',
                    "Auto-Populate This Container",
                    () => {
                        const targetContainer = this.currentContainer;
                        // Ensure container and UI references exist
                        if (!this.ui) {
                            ui.notifications.error(game.i18n.localize("BG3.Hotbar.Errors.NoUIReference"));
                            return;
                        }
                        targetContainer.ui = this.ui;
                        this.hide();
                        const dialog = new AutoPopulateDialog(token.actor, targetContainer);
                        dialog.render(true);
                    }
                );
                menuItems.push(autoPopulateOption);
            }

            // Sort Items option
            if(this.currentContainer.data?.delOnly !== true) {
                const sortOption = this._createMenuItem(
                    '<i class="fas fa-sort"></i>',
                    "Sort Items In This Container",
                    async () => {
                        const targetContainer = this.currentContainer;
                        // Ensure container and UI references exist
                        if (!this.ui) {
                            ui.notifications.error(game.i18n.localize("BG3.Hotbar.Errors.NoUIReference"));
                            return;
                        }
                        targetContainer.ui = this.ui;
                        this.hide();
                        await AutoSort.sortContainer(targetContainer);
                    }
                );
                menuItems.push(sortOption);
            }

            // Clear Container option
            const clearOption = this._createMenuItem(
                '<i class="fas fa-trash-alt"></i>',
                "Clear Container",
                async () => {
                    const targetContainer = this.currentContainer;
                    // Ensure container and UI references exist
                    if (!this.ui) {
                        ui.notifications.error(game.i18n.localize("BG3.Hotbar.Errors.NoUIReference"));
                        return;
                    }
                    
                    // Clear all items
                    targetContainer.data.items = {};
                    targetContainer.render();
                    
                    // Persist changes
                    if (this.ui?.manager) {
                        await this.ui.manager.persist();
                    }
                    
                    ui.notifications.info("Container cleared successfully.");
                    this.hide();
                },
                true // Mark as dangerous action
            );
            menuItems.push(clearOption);
        }

        return menuItems;
    }

    _createMenuItem(icon, label, onClick, isDanger = false) {
        const item = document.createElement("div");
        item.classList.add("menu-item");
        if (isDanger) item.classList.add("danger");
        
        const iconEl = document.createElement("span");
        iconEl.classList.add("menu-item-icon");
        iconEl.innerHTML = icon;
        
        const labelEl = document.createElement("span");
        labelEl.classList.add("menu-item-label");
        labelEl.textContent = label;
        
        item.appendChild(iconEl);
        item.appendChild(labelEl);
        item.addEventListener("click", onClick);
        
        return item;
    }

    hide() {
        if (this.element) {
            document.removeEventListener("click", this._documentClickHandler);
            this.element.remove();
            this.element = null;
        }
        this.currentContainer = null;
        this.currentSlot = null;
    }

    destroy() {
        this.hide();
    }
} 