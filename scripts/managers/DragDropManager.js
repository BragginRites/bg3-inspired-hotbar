// DragDropManager.js
import { BG3Hotbar } from '../bg3-hotbar.js';

export class DragDropManager {
    constructor(ui) {
        this.ui = ui;
        this.draggedItem = null;
        this.dragSourceElement = null;
    }

    isLocked() {
        return BG3Hotbar.controlsManager.isLockSettingEnabled('dragDrop') && 
               BG3Hotbar.controlsManager.isMasterLockEnabled();
    }

    async _isDuplicate(dragData) {
        // Get the UUID to check
        let uuid = dragData.uuid;
        
        // If it's a direct item drop, construct the UUID
        if (dragData.data?._id && dragData.actorId) {
            uuid = `${dragData.actorId}.Item.${dragData.data._id}`;
        }
        
        // If no UUID to check, it's not a duplicate
        if (!uuid) return false;

        // Check all containers for the UUID
        for (const container of this.ui.gridContainers) {
            for (const item of Object.values(container.data.items)) {
                if (item.uuid === uuid) {
                    return true;
                }
            }
        }
        
        return false;
    }

    async handleDrop(dragData, container, slotKey) {
        // Handle macro drops
        if (dragData.type === "Macro" || dragData.uuid?.startsWith("Macro.")) {
            return await this.handleMacroDrop(dragData, container, slotKey);
        }

        // For internal moves (items already on the hotbar), let GridContainer handle it
        if (dragData.containerIndex !== undefined && dragData.slotKey !== undefined) {
            return;
        }

        // Check for duplicates before proceeding with external drops
        if (await this._isDuplicate(dragData)) {
            ui.notifications.warn("This item is already on the hotbar.");
            return;
        }

        // Handle item drops from external sources
        try {
            // Get the item data, handling both direct items and UUID references
            let itemData = {
                uuid: dragData.uuid,
                name: dragData.name || dragData.label,
                icon: dragData.icon || dragData.img,
                type: dragData.type,
                activation: dragData.activation,
                sortData: dragData.sortData || {}
            };

            // If we have a UUID but no other data, try to fetch the item
            if (dragData.uuid && (!itemData.name || !itemData.icon)) {
                const item = await fromUuid(dragData.uuid);
                if (item) {
                    itemData = {
                        uuid: dragData.uuid,
                        name: item.name,
                        icon: item.img,
                        type: item.type,
                        activation: item.system?.activation,
                        sortData: dragData.sortData || {}
                    };
                }
            }
            // Handle direct item data (e.g., from character sheet)
            else if (dragData.data) {
                itemData = {
                    uuid: dragData.uuid || `${dragData.actorId}.Item.${dragData.data._id}`,
                    name: dragData.data.name,
                    icon: dragData.data.img,
                    type: dragData.data.type,
                    activation: dragData.data.system?.activation,
                    sortData: dragData.sortData || {}
                };
            }

            // Validate required data
            if (!itemData.name || !itemData.icon) {
                throw new Error("Invalid item data");
            }

            // Update the container
            container.data.items[slotKey] = itemData;
            await container.render();
            await this.ui.manager.persist();
        } catch (error) {
            console.error("Error handling item drop:", error);
            ui.notifications.error(game.i18n.localize("BG3.Hotbar.Errors.InvalidItem"));
        }
    }

    async handleMacroDrop(dragData, container, slotKey) {
        let macroId;
        if (dragData.uuid) {
            macroId = dragData.uuid.split('.')[1];
        } else if (dragData.id) {
            macroId = dragData.id;
        } else {
            console.warn("No valid macro ID found in drag data");
            return;
        }

        const macro = game.macros.get(macroId);
        if (!macro) {
            ui.notifications.error(game.i18n.localize("BG3.Hotbar.Errors.MacroNotFound"));
            return;
        }

        // Create macro item data
        const macroItem = {
            type: "Macro",
            macroId: macro.id,
            name: macro.name,
            icon: macro.img,
            uuid: `Macro.${macro.id}`
        };

        // Update the container
        container.data.items[slotKey] = macroItem;
        await container.render();
        await this.ui.manager.persist();
    }
} 