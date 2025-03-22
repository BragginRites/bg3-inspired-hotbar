import { CONFIG } from '../utils/config.js';
import { fromUuid } from '../utils/foundryUtils.js';

export class ItemUpdateManager {
    constructor(hotbarManager) {
        this.manager = hotbarManager;
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
        const rows = container.rows;
        const cols = container.cols;
        
        // Check each position in the container
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const slotKey = `${col}-${row}`;
                if (!container.items[slotKey]) {
                    return slotKey;
                }
            }
        }
        return null;
    }

    /**
     * Find the appropriate container for an item based on its type
     * @param {Item} item - The item to place
     * @returns {number} - The index of the container (0, 1, or 2)
     */
    _findAppropriateContainer(item) {
        // Get container auto-populate settings
        const container1Types = game.settings.get(CONFIG.MODULE_NAME, 'container1AutoPopulate');
        const container2Types = game.settings.get(CONFIG.MODULE_NAME, 'container2AutoPopulate');
        const container3Types = game.settings.get(CONFIG.MODULE_NAME, 'container3AutoPopulate');

        // Check each container's preferred types
        if (container1Types.includes(item.type)) return 0;
        if (container2Types.includes(item.type)) return 1;
        if (container3Types.includes(item.type)) return 2;

        // If no preference found, return the first container with space
        for (let i = 0; i < this.manager.containers.length; i++) {
            if (this._findNextAvailableSlot(this.manager.containers[i])) {
                return i;
            }
        }

        // Default to first container if all else fails
        return 0;
    }

    async _handleItemUpdate(item, changes, options, userId) {
        if (!this.manager || game.user.id !== userId) return;
        
        const token = canvas.tokens.get(this.manager.currentTokenId);
        if (!token || token.actor?.items.get(item.id) !== item) return;
        
        // Check if this is a spell and its preparation state changed
        if (item.type === "spell" && changes.system?.preparation !== undefined) {
            const prep = item.system.preparation;
            // Remove if unprepared and not at-will/innate/etc
            if (!prep.prepared && prep.mode === "prepared") {
                let removed = false;
                for (const container of this.manager.containers) {
                    for (const [slotKey, slotItem] of Object.entries(container.items)) {
                        const itemId = slotItem?.uuid?.split('.').pop();
                        if (itemId === item.id) {
                            delete container.items[slotKey];
                            removed = true;
                        }
                    }
                }
                for (const container of this.manager.weaponsContainers) {
                    for (const [slotKey, slotItem] of Object.entries(container.items)) {
                        const itemId = slotItem?.uuid?.split('.').pop();
                        if (itemId === item.id) {
                            delete container.items[slotKey];
                            removed = true;
                        }
                    }
                }
                if (removed) {
                    await this.manager.persist();
                    if (this.manager.ui) {
                        this.manager.ui.render();
                    }
                    ui.notifications.info(`Removed ${item.name} from hotbar as it is no longer prepared.`);
                }
                return;
            }
            // Add if newly prepared or has other valid casting mode
            else if (prep.prepared || ["pact", "atwill", "innate"].includes(prep.mode)) {
                // Check if it's already in any container
                let exists = false;
                for (const container of this.manager.containers) {
                    if (Object.values(container.items).some(i => i.uuid === item.uuid)) {
                        exists = true;
                        break;
                    }
                }

                if (!exists) {
                    // Find the appropriate container (likely container 2 for spells)
                    const containerIndex = this._findAppropriateContainer(item);
                    const container = this.manager.containers[containerIndex];
                    
                    // Find an available slot
                    const slotKey = this._findNextAvailableSlot(container);
                    
                    if (slotKey) {
                        // Add the spell to the hotbar
                        container.items[slotKey] = {
                            uuid: item.uuid,
                            name: item.name,
                            icon: item.img,
                            type: item.type,
                            activation: item.system.activation?.type || "action",
                            sortData: {
                                spellLevel: item.system.level,
                                featureType: ""
                            }
                        };
                        
                        await this.manager.persist();
                        if (this.manager.ui) {
                            this.manager.ui.render();
                        }
                        ui.notifications.info(`Added ${item.name} to hotbar as it is now prepared.`);
                        return;
                    }
                }
            }
        }
        
        // Check all containers for the item
        let updated = false;
        
        // Find and update the item in all containers
        for (const container of this.manager.containers) {
            for (const [slotKey, slotItem] of Object.entries(container.items)) {
                // Extract the item ID from the UUID
                const itemId = slotItem?.uuid?.split('.').pop();
                
                if (slotItem && itemId === item.id) {
                    // Get the latest item data
                    const updatedItemData = await fromUuid(slotItem.uuid);
                    if (!updatedItemData) continue;

                    // For spells, check if it's prepared or has valid casting mode
                    if (updatedItemData.type === "spell") {
                        const prep = updatedItemData.system?.preparation;
                        if (!prep?.prepared && prep?.mode === "prepared") {
                            delete container.items[slotKey];
                            updated = true;
                            continue;
                        }
                    }

                    // Update all properties from the source item
                    container.items[slotKey] = {
                        uuid: slotItem.uuid,
                        name: updatedItemData.name,
                        icon: updatedItemData.img,
                        type: updatedItemData.type,
                        activation: updatedItemData.system?.activation?.type,
                        sortData: slotItem.sortData // Preserve sort data
                    };
                    updated = true;
                }
            }
        }        
          
        // Find and update the item in all weapons containers
        for (const container of this.manager.weaponsContainers) {
            for (const [slotKey, slotItem] of Object.entries(container.items)) {
                // Extract the item ID from the UUID
                const itemId = slotItem?.uuid?.split('.').pop();
                
                if (slotItem && itemId === item.id) {
                    // Get the latest item data
                    const updatedItemData = await fromUuid(slotItem.uuid);
                    if (!updatedItemData) continue;

                    // For spells, check if it's prepared or has valid casting mode
                    if (updatedItemData.type === "spell") {
                        const prep = updatedItemData.system?.preparation;
                        if (!prep?.prepared && prep?.mode === "prepared") {
                            delete container.items[slotKey];
                            updated = true;
                            continue;
                        }
                    }

                    // Update all properties from the source item
                    container.items[slotKey] = {
                        uuid: slotItem.uuid,
                        name: updatedItemData.name,
                        icon: updatedItemData.img,
                        type: updatedItemData.type,
                        activation: updatedItemData.system?.activation?.type,
                        sortData: slotItem.sortData // Preserve sort data
                    };
                    updated = true;
                }
            }
        }
        
        if (updated) {
            // Save the changes
            await this.manager.persist();
        }

        // Update UI components
        if (this.manager.ui) {
            // Update passives if this is a feat with activation changes
            if (item.type === "feat" && (changes.system?.activation?.type !== undefined || !item.system.activation?.type)) {
                await this.manager.ui.passivesContainer?.update();
            }
            
            // Always re-render the UI to reflect changes
            this.manager.ui.render();
        }
    }

    async _handleItemCreate(item, options, userId) {
        if (!this.manager || game.user.id !== userId) return;

        // Check if not already in combat container
        if(Object.values(CONFIG.COMBATACTIONDATA).find(d => d.name === item.name)) return;
        
        const token = canvas.tokens.get(this.manager.currentTokenId);
        if (!token) return;

        // Check if the created item is on the actor's sheet
        if (token.actor?.items.get(item.id) !== item) return;
        
        // Determine if the item should be added to the hotbar
        // Check for activation type or other activity indicators
        if (item.system?.activation?.type) {
            // Check if the item already exists in any container
            let exists = false;
            for (const container of this.manager.containers) {
                if (Object.values(container.items).some(i => i.uuid === item.uuid)) {
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                // Find the appropriate container for this item type
                const containerIndex = this._findAppropriateContainer(item);
                const container = this.manager.containers[containerIndex];
                
                // Find an available slot
                const slotKey = this._findNextAvailableSlot(container);
                
                if (slotKey) {
                    // Add the item to the hotbar
                    container.items[slotKey] = {
                        uuid: item.uuid,
                        name: item.name,
                        icon: item.img,
                        type: item.type,
                        activation: item.system.activation.type,
                        sortData: {
                            spellLevel: item.type === "spell" ? item.system.level : 99,
                            featureType: item.type === "feat" ? item.system.type?.value || "" : ""
                        }
                    };
                    
                    // Save changes
                    await this.manager.persist();
                    
                    // Notify the user
                    ui.notifications.info(`Added ${item.name} to hotbar container ${containerIndex + 1}`);
                } else {
                    ui.notifications.warn(`No available slots in container ${containerIndex + 1} for ${item.name}`);
                }
            }
        }
        
        // Update UI components
        if (this.manager.ui) {
            // Update passives if this is a passive feat
            if (item.type === "feat" && (!item.system.activation?.type || item.system.activation.type === "passive")) {
                await this.manager.ui.passivesContainer?.update();
            }
            
            // Re-render UI to show new items
            this.manager.ui.render();
        }
    }

    async _handleItemDelete(item, options, userId) {
        if (!this.manager || game.user.id !== userId) return;
        
        const token = canvas.tokens.get(this.manager.currentTokenId);
        if (!token) return;
        
        // Clean up invalid items and re-render
        await this.cleanupInvalidItems(token.actor);
        
        // Update UI components
        if (this.manager.ui) {
            // Update passives if this was a passive feat
            if (item.type === "feat" && (!item.system.activation?.type || item.system.activation.type === "passive")) {
                await this.manager.ui.passivesContainer?.update();
            }
            
            this.manager.ui.render();
        }
    }

    async cleanupInvalidItems(actor) {
        let hasChanges = false;
        
        // Check each container's items
        for (const container of this.manager.containers) {
            for (const [slot, item] of Object.entries(container.items)) {
                const itemData = await fromUuid(item.uuid);
                
                if (!itemData || !actor.items.has(itemData.id)) {
                    // Removing invalid item
                    delete container.items[slot];
                    hasChanges = true;
                }
            }
        }
          
        // Check each weapons container's items
        for (const container of this.manager.weaponsContainers) {
            for (const [slot, item] of Object.entries(container.items)) {
                const itemData = await fromUuid(item.uuid);
                
                if (!itemData || !actor.items.has(itemData.id)) {
                    // Removing invalid item
                    delete container.items[slot];
                    hasChanges = true;
                }
            }
        }

        if (hasChanges) {
            await this.manager.persist();
            if (this.manager.ui) {
                this.manager.ui.render();
            }
        }
    }
} 