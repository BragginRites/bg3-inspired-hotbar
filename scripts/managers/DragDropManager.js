import { BG3UTILS } from "../utils/utils.js";

export class DragDropManager {
    constructor() {
        this.draggedItem = null;
        this.dragSourceCell = null;
    }

    get locked() {}

    async _isDuplicate(data) {
        // Check all containers for the UUID
        for (const container of ui.BG3HOTBAR.manager.containers.hotbar) {
            for (const item of Object.values(container.items)) {
                if (item?.uuid === data.uuid) {
                    return true;
                }
            }
        }
        
        return false;
    }

    async proceedDrop(target, event) {
        if(this.dragSourceCell === target) return;
        let hasUpdate = false,
            fullUpdate = false;
        try {
            const savedItem = foundry.utils.deepClone(target.data.item);
            let newItem = null;
            if(this.dragSourceCell) {
                newItem = foundry.utils.deepClone(this.dragSourceCell.data.item);
                this.dragSourceCell.data.item = savedItem;

                // Update manager stored data
                ui.BG3HOTBAR.manager.containers[this.dragSourceCell._parent.id][this.dragSourceCell._parent.index].items[this.dragSourceCell.slotKey] = savedItem;
                hasUpdate = true;
    
                await this.dragSourceCell._renderInner();    
                this.dragSourceCell = null;
            } else {
                // Construct Item
                // Parse the transferred data
                let dragData;
                try {
                    dragData = JSON.parse(event.dataTransfer.getData("text/plain"));
                    if(dragData.uuid || dragData.actorUUID) {
                        // Prevent cross-actor item placement
                        const splitUUID = dragData.uuid?.split('.') ?? [];
                        if(splitUUID.indexOf('Actor') > -1 || dragData.actorUUID) {
                            const actorUUID =  dragData.actorUUID ?? splitUUID.slice(0,splitUUID.indexOf('Actor') + 2).join('.');
                            if(actorUUID && actorUUID !== ui.BG3HOTBAR.manager.actor.uuid) {
                                ui.notifications.warn("You cannot add items from other characters.");
                                return;
                            }
                        }
                        [newItem, hasUpdate] = await ui.BG3HOTBAR.itemUpdateManager.retrieveNewItem(dragData, target);
                        // Check for duplicates if not allowed for this container
                        if(target._parent.data.allowDuplicate !== true && await this._isDuplicate(newItem)) {
                            ui.notifications.warn("This item is already on the hotbar.");
                            return;
                        }
                        console.log(newItem)
                    };
                } catch (err) {
                    console.error("Failed to parse drop data:", err);
                    return;
                }
            }
            if(newItem) {
                // Handle 2 Handed weapon specific case
                if(target._parent.id === 'weapon') {
                    const item = await BG3UTILS.getItem(newItem, ui.BG3HOTBAR.manager.actor);
                    if(item) {
                        if(target.slotKey === '1-0' && BG3UTILS.check2Handed(item)) {
                            ui.notifications.warn('You can\'t assign a 2-handed weapon to an offhand slot.')
                            return;
                        }
                    }
                }
                
                target.data.item = newItem;
    
                // Update manager stored data
                ui.BG3HOTBAR.manager.containers[target._parent.id][target._parent.index].items[target.slotKey] = newItem;
                hasUpdate = true;

                if(fullUpdate) await target._parent.render();
                else await target._renderInner();
            }
        } catch (error) {
            console.error("Error during drop process:", error);
            ui.notifications.error("Failed to process drop");
            this.dragSourceCell = null;
        }
        if(hasUpdate) await ui.BG3HOTBAR.manager.persist();

    }
}