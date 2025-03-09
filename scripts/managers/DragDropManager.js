// DragDropManager.js

export class DragDropManager {
    constructor(ui) {
        this.ui = ui;
        this.draggedItem = null;
        this.dragSourceElement = null;
    }

    isLocked() {
        return this.ui._isLocked || this.ui._lockSettings?.dragDrop;
    }

    async handleDrop(dragData, container, slotKey) {
        // Handle macro drops
        if (dragData.type === "Macro" || dragData.uuid?.startsWith("Macro.")) {
            return await this.handleMacroDrop(dragData, container, slotKey);
        }

        // Handle item drops
        if (dragData.uuid) {
            try {
                // Create item data
                const itemData = {
                    uuid: dragData.uuid,
                    name: dragData.name,
                    icon: dragData.icon || dragData.img,
                    type: dragData.type,
                    activation: dragData.activation,
                    sortData: dragData.sortData || {}
                };

                // Update the container
                container.data.items[slotKey] = itemData;
                await container.render();
                await this.ui.manager.persist();
            } catch (error) {
                console.error("Error handling item drop:", error);
                ui.notifications.error(game.i18n.localize("BG3.Hotbar.Errors.InvalidItem"));
            }
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