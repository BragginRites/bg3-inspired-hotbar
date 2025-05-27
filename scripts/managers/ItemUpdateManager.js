import { BG3CONFIG } from "../utils/config.js";

export class ItemUpdateManager {
    constructor() {
        this._registerHooks();
    }

    _registerHooks() {
        // Item updates
        Hooks.on("updateItem", this._handleItemUpdate.bind(this));
        
        // Item creation
        Hooks.on("createItem", this._handleItemCreate.bind(this));
        
        // Item deletion
        Hooks.on("deleteItem", this._handleItemDelete.bind(this));
    }

    /**
     * Find the next available slot in a container
     * @param {Object} container - The container to search
     * @returns {string|null} - The slot key (e.g., "0-0") or null if no slots available
     */
    _findNextAvailableSlot(container) {
        const rows = container.data.rows;
        const cols = container.data.cols;
        
        // Check each position in the container
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const slotKey = `${col}-${row}`;
                if (!container.data.items[slotKey]) {
                    return slotKey;
                }
            }
        }
        return null;
    }
    
    async retrieveNewItem(data, cell) {
        return [{uuid: data.uuid}, true];
    }
    
    /**
     * Find the appropriate container for an item based on its type
     * @param {Item} item - The item to place
     * @returns {number} - The index of the container (0, 1, or 2)
     */
    _findAppropriateContainer(item) {
        // Check each container's preferred types
        for(let index of [0,1,2]) {
            const itemList = CONFIG.BG3HUD.FEATURES.POPULATE.getItemsList(ui.BG3HOTBAR.manager.actor, game.settings.get(BG3CONFIG.MODULE_NAME, `container${index + 1}AutoPopulate`), ui.BG3HOTBAR.manager);
            if(itemList.find(i => i.uuid === item.uuid)) return index;
        }
        return -1;
    }
    
    async _handleItemUpdate(item, changes, options, userId) {
        if(game.user.id !== userId) return;
        const actor = item?.actor;
        if (ui.BG3HOTBAR.manager.actor !== actor || !actor?.items.get(item.id)) return;
        let needSave = false;

        const isValid = CONFIG.BG3HUD.FEATURES.POPULATE.checkExtraConditions(item, actor, ui.BG3HOTBAR.manager);
        for(const containerData of [ui.BG3HOTBAR.components.container.components.hotbar, ui.BG3HOTBAR.components.weapon.components.weapon]) {
            for (const container of containerData) {
                let containerUpdate = false;
                for (const [slotKey, slotItem] of Object.entries(container.data.items)) {
                    if(slotItem && slotItem.uuid === item.uuid) {
                        containerUpdate = true;
                        needSave = true;
                        if(!isValid) delete container.data.items[slotKey];
                    }
                }
                if(containerUpdate) container.render();
            }
        }
        if(!needSave) needSave = this._handleItemCreate(item, options, userId, true);
        if(needSave){
            await ui.BG3HOTBAR.manager.persist();
            await ui.BG3HOTBAR.components.container.components.filterContainer.updateExtendedFilter();
        }
    }
    
    async _handleItemCreate(item, options, userId, isUpdate = false) {
        if(game.user.id !== userId) return;
        const actor = item?.actor;
        if (ui.BG3HOTBAR.manager.actor !== actor || !actor?.items.get(item.id)) return;
        let needSave = false;

        const containerIndex = this._findAppropriateContainer(item),
            container = ui.BG3HOTBAR.components.container.components.hotbar[containerIndex];
        if(container && !Object.values(container.data.items).find(i => i.uuid === item.uuid) && (!isUpdate || game.settings.get(BG3CONFIG.MODULE_NAME, `container${containerIndex + 1}AutoPopulate`).includes('spell'))) {
            const slotKey = this._findNextAvailableSlot(container);                
            if (slotKey) {
                container.data.items[slotKey] = CONFIG.BG3HUD.FEATURES.POPULATE.constructItemData(item);
                container.render();
                needSave = true;
            }
        }
        
        if(needSave && !isUpdate){
            await ui.BG3HOTBAR.manager.persist();
            await ui.BG3HOTBAR.components.container.components.filterContainer.updateExtendedFilter();
        }

        return needSave;
    }

    async _handleItemDelete(item, options, userId) {
        if (!ui.BG3HOTBAR.manager || game.user.id !== userId) return;
        
        const token = ui.BG3HOTBAR.manager.token;;
        if (!token) return;
        
        // Clean up invalid items and re-render
        await this.cleanupInvalidItems(token.actor);
    }
    
    async cleanupInvalidItems(actor) {
        
        // Check each container's items
        for (const container of ui.BG3HOTBAR.components.container.components.hotbar) {
            let hasChanges = false;
            for (const [slot, item] of Object.entries(container.data.items)) {
                if(!item?.uuid) continue;
                const itemData = await fromUuid(item.uuid);
                if(itemData?.documentName == 'Macro' || itemData?.documentName == 'Activity') continue;
                
                if (!itemData || !actor.items.has(itemData.id)) {
                    // Removing invalid item
                    delete container.data.items[slot];
                    hasChanges = true;
                }
            }
            if(hasChanges) container.render();
        }
            
        // Check each weapons container's items
        for (const container of ui.BG3HOTBAR.components.weapon.components.weapon) {
            let hasChanges = false;
            for (const [slot, item] of Object.entries(container.data.items)) {
                const itemData = await fromUuid(item.uuid);
                if(itemData?.documentName == 'Macro' || itemData?.documentName == 'Activity') continue;
                
                if (!itemData || !actor.items.has(itemData.id)) {
                    // Removing invalid item
                    delete container.data.items[slot];
                    hasChanges = true;
                }
            }
            if(hasChanges) {
                container.render();
                await ui.BG3HOTBAR.manager.persist();
            }
        }
    }
}