import { BG3CONFIG } from "../utils/config.js";
import { fromUuid } from "../utils/foundryUtils.js";
import { ContainerPopover } from "../components/containers/ContainerPopover.js";

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
     * Update hotbar data for any actor, regardless of current selection
     * @param {Actor} actor - The actor that received/lost the item
     * @param {Item} item - The item that was created/updated/deleted
     * @param {string} action - The action performed ('create', 'update', 'delete')
     */
    async _updateHotbarForActor(actor, item, action) {
        if (!actor) return;

        // Create a temporary hotbar manager to work with this actor's data
        const { HotbarManager } = await import('./HotbarManager.js');
        const tempManager = new HotbarManager();

        // Resolve token context: for unlinked (synthetic) actors, use their own token id
        if (actor.isToken && actor.token?.id) {
            tempManager.currentTokenId = actor.token.id;
        } else {
            // Linked actor: prefer a linked token, otherwise any matching token
            let targetToken = null;
            for (const token of canvas.tokens.placeables) {
                if (token.actor?.id === actor.id) {
                    targetToken = token;
                    if (token.actorLink) break; // Prefer linked tokens
                }
            }
            if (targetToken) {
                tempManager.currentTokenId = targetToken.id;
            }
        }

        // Load the actor's current hotbar data
        await tempManager._loadTokenData();

        if (action === 'create' && this._shouldAddItemToHotbar(item)) {
            await this._addItemToActorHotbar(tempManager, item, actor);
        } else if (action === 'delete') {
            await this._removeItemFromActorHotbar(tempManager, item, actor);
        } else if (action === 'update') {
            await this._updateItemInActorHotbar(tempManager, item, actor);
        }

        // Save the updated data back to the actor
        await tempManager.persist();

        console.log(`BG3 Hotbar | Updated hotbar data for actor "${actor.name}" (action: ${action}, item: "${item.name}")`);
    }

    /**
     * Add an item to an actor's hotbar data
     * @param {HotbarManager} manager - The temporary hotbar manager
     * @param {Item} item - The item to add
     * @param {Actor} actor - The actor
     */
    async _addItemToActorHotbar(manager, item, actor) {
        // Check if not already in combat container
        if (Object.values(manager.containers.combat[0].items).find(d => d.uuid === item.uuid)) {
            console.log(`BG3 Hotbar | Skipping "${item.name}" - already in combat container`);
            return;
        }

        // Check if the item already exists in any container
        let exists = false;
        for (const container of manager.containers.hotbar) {
            if (Object.values(container.items).some(i => i && i.uuid === item.uuid)) {
                exists = true;
                break;
            }
        }

        if (exists) {
            console.log(`BG3 Hotbar | Skipping "${item.name}" - already exists in hotbar`);
            return;
        }

        // Find the appropriate container for this item type
        const containerIndex = this._findAppropriateContainerForActor(item);
        const container = manager.containers.hotbar[containerIndex];

        // Find an available slot
        const slotKey = this._findNextAvailableSlotInContainer(container);

        if (slotKey) {
            // Add the item to the hotbar data
            container.items[slotKey] = {
                uuid: item.uuid
            };

            console.log(`BG3 Hotbar | Auto-added item "${item.name}" (${item.type}) to actor "${actor.name}" container ${containerIndex + 1} at slot ${slotKey}`);

            // Show notification if this is for the current user's character or if user is GM
            if (actor.hasPlayerOwner && actor.ownership[game.user.id] >= 3) {
                ui.notifications.info(`Added ${item.name} to hotbar container ${containerIndex + 1}`);
            } else if (game.user.isGM) {
                ui.notifications.info(`Added ${item.name} to ${actor.name}'s hotbar container ${containerIndex + 1}`);
            }
        } else {
            console.log(`BG3 Hotbar | No available slots in container ${containerIndex + 1} for "${item.name}" on actor "${actor.name}"`);
            if (game.user.isGM || (actor.hasPlayerOwner && actor.ownership[game.user.id] >= 3)) {
                ui.notifications.warn(`No available slots in container ${containerIndex + 1} for ${item.name}`);
            }
        }
    }

    /**
     * Remove an item from an actor's hotbar data
     * @param {HotbarManager} manager - The temporary hotbar manager
     * @param {Item} item - The item to remove
     * @param {Actor} actor - The actor
     */
    async _removeItemFromActorHotbar(manager, item, actor) {
        let removed = false;

        // Remove from all hotbar containers
        for (const container of manager.containers.hotbar) {
            for (const [slotKey, slotItem] of Object.entries(container.items)) {
                if (slotItem && slotItem.uuid === item.uuid) {
                    delete container.items[slotKey];
                    removed = true;
                    console.log(`BG3 Hotbar | Removed "${item.name}" from actor "${actor.name}" hotbar`);
                }
            }
        }

        // Remove from weapon containers
        for (const container of manager.containers.weapon) {
            for (const [slotKey, slotItem] of Object.entries(container.items)) {
                if (slotItem && slotItem.uuid === item.uuid) {
                    delete container.items[slotKey];
                    removed = true;
                    console.log(`BG3 Hotbar | Removed "${item.name}" from actor "${actor.name}" weapon container`);
                }
            }
        }

        return removed;
    }

    /**
     * Update an item in an actor's hotbar data
     * @param {HotbarManager} manager - The temporary hotbar manager
     * @param {Item} item - The item to update
     * @param {Actor} actor - The actor
     */
    async _updateItemInActorHotbar(manager, item, actor) {
        // For now, just ensure the item data is current - the UUID should remain the same
        // More complex update logic can be added here if needed
        console.log(`BG3 Hotbar | Updated item "${item.name}" in actor "${actor.name}" hotbar data`);
    }

    /**
     * Find appropriate container for an item when working with actor data directly
     * @param {Item} item - The item to place
     * @returns {number} - The index of the container (0, 1, or 2)
     */
    _findAppropriateContainerForActor(item) {
        // Get container auto-populate settings
        const container1Types = game.settings.get(BG3CONFIG.MODULE_NAME, 'container1AutoPopulate');
        const container2Types = game.settings.get(BG3CONFIG.MODULE_NAME, 'container2AutoPopulate');
        const container3Types = game.settings.get(BG3CONFIG.MODULE_NAME, 'container3AutoPopulate');

        // Helper function to check if item matches any of the selected types
        const itemMatchesTypes = (selectedTypes) => {
            if (!selectedTypes || !Array.isArray(selectedTypes) || selectedTypes.length === 0) {
                return false;
            }
            for (const selectedType of selectedTypes) {
                if (selectedType.includes(':')) {
                    // Handle subtype (e.g., "consumable:potion")
                    const [mainType, subType] = selectedType.split(':');
                    if (item.type === mainType && item.system?.type?.value === subType) {
                        return true;
                    }
                } else {
                    // Handle main type (e.g., "weapon")
                    if (item.type === selectedType) {
                        return true;
                    }
                }
            }
            return false;
        };

        // Check each container's preferred types using enhanced matching
        if (itemMatchesTypes(container1Types)) return 0;
        if (itemMatchesTypes(container2Types)) return 1;
        if (itemMatchesTypes(container3Types)) return 2;

        // Default to first container if no specific preference
        return 0;
    }

    /**
     * Find the next available slot in a container (working with raw container data)
     * @param {Object} container - The container to search
     * @returns {string|null} - The slot key (e.g., "0-0") or null if no slots available
     */
    _findNextAvailableSlotInContainer(container) {
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
     * Determine if an item should be added to the hotbar
     * @param {Item} item - The item to check
     * @returns {boolean} - Whether the item should be added
     */
    _shouldAddItemToHotbar(item) {
        // Check if the item has activities or activation type (consistent with other auto-populate logic)
        const activities = item.system?.activities;
        const hasActivities = (activities instanceof Map && activities.size > 0) ||
            (item.system?.activation?.type && item.system?.activation?.type !== "none");

        if (hasActivities || game.settings.get(BG3CONFIG.MODULE_NAME, 'noActivityAutoPopulate')) {
            return true;
        }

        return false;
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

    /**
     * Find the appropriate container for an item based on its type
     * @param {Item} item - The item to place
     * @returns {number} - The index of the container (0, 1, or 2)
     */
    _findAppropriateContainer(item) {
        // Get container auto-populate settings
        const container1Types = game.settings.get(BG3CONFIG.MODULE_NAME, 'container1AutoPopulate');
        const container2Types = game.settings.get(BG3CONFIG.MODULE_NAME, 'container2AutoPopulate');
        const container3Types = game.settings.get(BG3CONFIG.MODULE_NAME, 'container3AutoPopulate');

        // Helper function to check if item matches any of the selected types
        const itemMatchesTypes = (selectedTypes) => {
            if (!selectedTypes || !Array.isArray(selectedTypes) || selectedTypes.length === 0) {
                return false;
            }
            for (const selectedType of selectedTypes) {
                if (selectedType.includes(':')) {
                    // Handle subtype (e.g., "consumable:potion")
                    const [mainType, subType] = selectedType.split(':');
                    if (item.type === mainType && item.system?.type?.value === subType) {
                        return true;
                    }
                } else {
                    // Handle main type (e.g., "weapon")
                    if (item.type === selectedType) {
                        return true;
                    }
                }
            }
            return false;
        };

        // Check each container's preferred types using enhanced matching
        if (itemMatchesTypes(container1Types)) return 0;
        if (itemMatchesTypes(container2Types)) return 1;
        if (itemMatchesTypes(container3Types)) return 2;

        // If no preference found, return the first container with space
        for (let i = 0; i < ui.BG3HOTBAR.components.container.components.hotbar.length; i++) {
            if (this._findNextAvailableSlot(ui.BG3HOTBAR.components.container.components.hotbar[i])) {
                return i;
            }
        }

        // Default to first container if all else fails
        return 0;
    }

    async _handleItemUpdate(item, changes, options, userId) {

        const token = ui.BG3HOTBAR.manager.token;
        const itemActor = item.parent;
        if (!token || !itemActor) return;
        // Guard to ensure we only update UI for the token that actually owns the item
        if (itemActor.isToken) {
            if (token.id !== itemActor.token?.id) return;
        } else if (itemActor.id !== token.actor?.id) {
            return;
        }
        let needSave = false;

        if (changes.system && Object.keys(changes.system).length === 1 && changes.system.hasOwnProperty('equipped')) return;

        // Check if this is a spell and its preparation state changed (DnD5e 5.1+: method/prepared)
        if (item.type === "spell" && (changes.system?.method !== undefined || changes.system?.prepared !== undefined || changes.system?.preparation !== undefined)) {
            const method = item.system?.method ?? item.system?.preparation?.mode;
            const prepared = item.system?.prepared ?? item.system?.preparation?.prepared;
            // Remove if unprepared prepared-spell and not at-will/innate/etc
            if (!prepared && method === "prepared") {
                for (const container of ui.BG3HOTBAR.components.container.components.hotbar) {
                    let removed = false;
                    for (const [slotKey, slotItem] of Object.entries(container.data.items)) {
                        const itemId = slotItem?.uuid?.split('.').pop();
                        if (itemId === item.id) {
                            delete container.data.items[slotKey];
                            removed = true;
                            needSave = true;
                        }
                    }
                    if (removed) container.render();
                }
                for (const container of ui.BG3HOTBAR.components.weapon.components.weapon) {
                    let removed = false;
                    for (const [slotKey, slotItem] of Object.entries(container.data.items)) {
                        const itemId = slotItem?.uuid?.split('.').pop();
                        if (itemId === item.id) {
                            delete container.data.items[slotKey];
                            removed = true;
                            needSave = true;
                        }
                    }
                    if (removed) container.render();
                }
                await ui.BG3HOTBAR.manager.persist();
                return;
            }
            // Add if newly prepared or has other valid casting mode
            else if (prepared || ["pact", "apothecary", "atwill", "innate"].includes(method)) {
                // Check if it's already in any container
                let exists = false;
                for (const container of ui.BG3HOTBAR.components.container.components.hotbar) {
                    if (Object.values(container.data.items).some(i => i && i.uuid === item.uuid)) {
                        exists = true;
                        break;
                    }
                }

                if (!exists) {
                    // Find the appropriate container (likely container 2 for spells)
                    const containerIndex = this._findAppropriateContainer(item);
                    const container = ui.BG3HOTBAR.components.container.components.hotbar[containerIndex];

                    // Find an available slot
                    const slotKey = this._findNextAvailableSlot(container);

                    if (slotKey) {
                        // Add the spell to the hotbar
                        container.data.items[slotKey] = {
                            uuid: item.uuid,
                            // name: item.name,
                            // icon: item.img,
                            // type: item.type,
                            // activation: item.system.activation?.type || "action",
                            // sortData: {
                            //     spellLevel: item.system.level,
                            //     featureType: ""
                            // }
                        };

                        console.log(`BG3 Hotbar | Auto-added prepared spell "${item.name}" to container ${containerIndex + 1} at slot ${slotKey}`);

                        container.render();
                        needSave = true;
                        ui.notifications.info(`Added ${item.name} to hotbar as it is now prepared.`);
                        return;
                    }
                }
            }
        }

        // Find and update the item in all containers
        for (const container of ui.BG3HOTBAR.components.container.components.hotbar) {
            let updated = false;
            for (const [slotKey, slotItem] of Object.entries(container.data.items)) {
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
                            delete container.data.items[slotKey];
                            updated = true;
                            needSave = true;
                            continue;
                        }
                    }

                    // Update all properties from the source item
                    container.data.items[slotKey] = {
                        uuid: slotItem.uuid,
                        // name: updatedItemData.name,
                        // icon: updatedItemData.img,
                        // type: updatedItemData.type,
                        // activation: updatedItemData.system?.activation?.type,
                        // sortData: slotItem.sortData // Preserve sort data
                    };
                    updated = true;
                    needSave = true;
                }
            }
            if (updated) container.render();
        }

        // Find and update the item in all weapons containers
        for (const container of ui.BG3HOTBAR.components.weapon.components.weapon) {
            let updated = false;
            for (const [slotKey, slotItem] of Object.entries(container.data.items)) {
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
                            delete container.data.items[slotKey];
                            updated = true;
                            needSave = true;
                            continue;
                        }
                    }

                    // Update all properties from the source item
                    container.data.items[slotKey] = {
                        uuid: slotItem.uuid,
                        // name: updatedItemData.name,
                        // icon: updatedItemData.img,
                        // type: updatedItemData.type,
                        // activation: updatedItemData.system?.activation?.type,
                        // sortData: slotItem.sortData // Preserve sort data
                    };
                    updated = true;
                    needSave = true;
                }
            }
            if (updated) container.render();
        }

        if (needSave) {
            // Save the changes
            await ui.BG3HOTBAR.manager.persist();
            await ui.BG3HOTBAR.components.container.components.filterContainer.updateExtendedFilter();
        }

        // Always refresh portrait extra infos on item updates for the current actor
        try {
            const currentToken2 = ui.BG3HOTBAR.manager.token;
            if (currentToken2 && currentToken2.actor?.id === item.parent?.id && ui.BG3HOTBAR.rendered) {
                if (ui.BG3HOTBAR.components?.portrait) {
                    await ui.BG3HOTBAR.components.portrait._renderInner();
                }
            }
        } catch (e) {
            // No-op; portrait refresh is best-effort
        }
    }

    async _handleItemCreate(item, options, userId) {
        if (!ui.BG3HOTBAR.manager || game.user.id !== userId) return;
        // Skip auto-add when caller explicitly requests it (e.g., CPR common actions bootstrap)
        if (options?.noBG3AutoAdd) return;

        // Get the actor that received the item
        const itemActor = item.parent;
        if (!itemActor) return;

        console.log(`BG3 Hotbar | Item created: "${item.name}" (${item.type}) for actor ${itemActor.name}`);

        // Add a small delay to ensure the item is fully processed
        await new Promise(resolve => setTimeout(resolve, 50));

        // Update hotbar data for the actor that received the item (regardless of current selection)
        await this._updateHotbarForActor(itemActor, item, 'create');

        // If this is the currently selected token, also update the UI
        const currentToken = ui.BG3HOTBAR.manager.token;
        const targetTokenId = itemActor?.isToken ? itemActor?.token?.id : null;
        const isCurrentTarget = currentToken && ui.BG3HOTBAR.rendered && (
            (targetTokenId && currentToken.id === targetTokenId) ||
            (!targetTokenId && currentToken.document?.actorLink && currentToken.actor?.id === itemActor.id)
        );
        if (isCurrentTarget) {
            try {
                // First, check if it's already visible in any UI container
                const uiContainers = ui.BG3HOTBAR.components?.container?.components?.hotbar || [];
                const alreadyInUI = uiContainers.some((c) => Object.values(c.data.items || {}).some((i) => i?.uuid === item.uuid));
                if (alreadyInUI) {
                    await ui.BG3HOTBAR.refresh();
                    return;
                }

                // Place into the appropriate UI container at next available slot
                const containerIndex = this._findAppropriateContainer(item);
                const targetContainer = uiContainers[containerIndex];
                if (targetContainer) {
                    const slotKey = this._findNextAvailableSlot(targetContainer);
                    if (slotKey) {
                        targetContainer.data.items[slotKey] = { uuid: item.uuid };
                        await targetContainer.render();
                        if (ui.BG3HOTBAR.components.container.components.filterContainer) {
                            await ui.BG3HOTBAR.components.container.components.filterContainer.updateExtendedFilter();
                        }
                        // No need to persist here; flags were already updated above
                        return;
                    }
                }

                // Fallback: full regenerate to sync with flags if anything above failed
                await ui.BG3HOTBAR.generate(currentToken);
            } catch (e) {
                console.warn('BG3 Hotbar | UI update on item create failed, regenerating...', e);
                await ui.BG3HOTBAR.generate(currentToken);
            }
        }

    }

    async _handleItemDelete(item, options, userId) {
        if (!ui.BG3HOTBAR.manager || game.user.id !== userId) return;

        // Get the actor that lost the item
        const itemActor = item.parent;
        if (!itemActor) return;

        console.log(`BG3 Hotbar | Item deleted: "${item.name}" (${item.type}) from actor ${itemActor.name}`);

        // Update hotbar data for the actor that lost the item (regardless of current selection)
        await this._updateHotbarForActor(itemActor, item, 'delete');

        // If this is the currently selected token, also clean up the UI
        const currentToken = ui.BG3HOTBAR.manager.token;
        const targetTokenId = itemActor?.isToken ? itemActor?.token?.id : null;
        const isCurrentTarget = currentToken && ui.BG3HOTBAR.rendered && (
            (targetTokenId && currentToken.id === targetTokenId) ||
            (!targetTokenId && currentToken.document?.actorLink && currentToken.actor?.id === itemActor.id)
        );
        if (isCurrentTarget) {
            // Clean up invalid items and re-render for the current token
            await this.cleanupInvalidItems(currentToken.actor);
            await ui.BG3HOTBAR.refresh();
            if (ui.BG3HOTBAR.components?.container?.components?.filterContainer) {
                await ui.BG3HOTBAR.components.container.components.filterContainer.updateExtendedFilter();
            }
        }
    }

    async cleanupInvalidItems(actor) {

        // Check each container's items
        for (const container of ui.BG3HOTBAR.components.container.components.hotbar) {
            let hasChanges = false;
            for (const [slot, item] of Object.entries(container.data.items)) {
                if (!item?.uuid) continue;
                const itemData = await fromUuid(item.uuid);
                if (itemData?.documentName == 'Macro' || itemData?.documentName == 'Activity') continue;

                if (!itemData || !actor.items.has(itemData.id)) {
                    // Removing invalid item
                    delete container.data.items[slot];
                    hasChanges = true;
                }
            }
            if (hasChanges) container.render();
        }

        // Check each weapons container's items
        for (const container of ui.BG3HOTBAR.components.weapon.components.weapon) {
            let hasChanges = false;
            for (const [slot, item] of Object.entries(container.data.items)) {
                if (!item?.uuid) continue;
                const itemData = await fromUuid(item.uuid);
                if (itemData?.documentName == 'Macro' || itemData?.documentName == 'Activity') continue;

                if (!itemData || !actor.items.has(itemData.id)) {
                    // Removing invalid item
                    delete container.data.items[slot];
                    hasChanges = true;
                }
            }
            if (hasChanges) {
                container.render();
                await ui.BG3HOTBAR.manager.persist();
            }
        }

        // Clean up container popover layouts for deleted container items
        await this.cleanupContainerLayouts(actor);
    }

    /**
     * Clean up container popover layouts when their base container items are deleted from hotbar
     * @param {Actor} actor - The actor to clean up
     */
    async cleanupContainerLayouts(actor) {
        let hasChanges = false;

        // Check all hotbar containers for items with containerLayout property
        for (const [containerType, containers] of Object.entries(ui.BG3HOTBAR.manager.containers)) {
            if (containerType === 'containers') continue; // Skip any old structure

            if (Array.isArray(containers)) {
                for (let containerIndex = 0; containerIndex < containers.length; containerIndex++) {
                    const container = containers[containerIndex];
                    if (!container || !container.items) continue;

                    for (const [slotKey, item] of Object.entries(container.items)) {
                        if (item?.containerLayout) {
                            // This item has a container layout - check if the item still exists
                            const itemData = await fromUuid(item.uuid);
                            if (!itemData || !actor.items.has(itemData.id) || !ContainerPopover.isContainer(itemData)) {
                                // Container item was deleted or is no longer a container, remove its layout
                                delete item.containerLayout;
                                hasChanges = true;
                                console.log("BG3 Item Manager | Cleaned up container layout for removed item:", item.uuid);
                            }
                        }
                    }
                }
            }
        }

        // Persist changes if any were made
        if (hasChanges) {
            await ui.BG3HOTBAR.manager.persist();
        }
    }
}