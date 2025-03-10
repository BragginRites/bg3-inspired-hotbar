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
        
        // Add the menu to the BG3 HUD container instead of document.body
        this.ui.element.appendChild(this.element);

        // Create menu items
        const menuItems = await this._createMenuItems();
        menuItems.forEach(item => this.element.appendChild(item));

        // Get the position relative to the BG3 HUD container
        const containerRect = this.ui.element.getBoundingClientRect();
        const x = e.clientX - containerRect.left + 20;
        const y = e.clientY - containerRect.top - 40;
        
        // Make menu visible to get its dimensions
        this.element.classList.add("visible");
        
        // Position menu, ensuring it stays within the container bounds
        const rect = this.element.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        let left = x;
        let top = y;
        
        // If menu would go off right edge, position to left of cursor
        if (left + rect.width > containerWidth) {
            left = e.clientX - containerRect.left - rect.width - 20; // Position 20px to the left of cursor
        }
        
        // If menu would go off bottom edge, position above cursor
        if (top + rect.height > containerHeight) {
            top = e.clientY - containerRect.top - rect.height + 20; // Position 20px below cursor
        }
        
        // Ensure menu doesn't go off the left or top edges
        left = Math.max(0, left);
        top = Math.max(0, top);
        
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

        // Edit Item option
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
        }

        // Auto-populate option
        const token = canvas.tokens.get(this.ui?.manager?.currentTokenId);
        if (token?.actor) {
            const autoPopulateOption = this._createMenuItem(
                '<i class="fas fa-magic"></i>',
                "Auto-Populate with Activities",
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

            // Sort Items option
            const sortOption = this._createMenuItem(
                '<i class="fas fa-sort"></i>',
                "Sort Items",
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

        // Add divider if we have items above
        if (menuItems.length > 0) {
            const divider = document.createElement("div");
            divider.classList.add("menu-divider");
            menuItems.push(divider);
        }

        // Remove option
        const removeOption = this._createMenuItem(
            '<i class="fas fa-trash"></i>',
            game.i18n.localize("BG3.Hotbar.ContextMenu.Remove"),
            async () => {
                // Ensure we have valid references
                if (!this.currentContainer || !this.currentSlot) {
                    this.hide();
                    return;
                }

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