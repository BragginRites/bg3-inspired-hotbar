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

        // Get current token's actor
        const currentToken = canvas.tokens.get(this.ui.manager.currentTokenId);
        if (!currentToken?.actor) {
            ui.notifications.warn("No active token selected.");
            return;
        }

        try {
            let sourceActor = null;
            let item = null;

            // Check if this is an activity UUID (Actor.id.Item.id.Activity.id)
            if (dragData.uuid && dragData.uuid.split('.').length === 6 && dragData.uuid.includes('.Activity.')) {
                console.log("Processing activity drop:", dragData); // Debug log

                try {
                    // First get the parent item UUID by removing the Activity part
                    const itemUUID = dragData.uuid.split('.Activity.')[0];
                    console.log("Looking up item with UUID:", itemUUID);
                    
                    // Get the source item using fromUuid
                    const sourceItem = await fromUuid(itemUUID);
                    if (!sourceItem) {
                        ui.notifications.error("Could not find parent item");
                        return;
                    }

                    // Get the activity ID from the UUID
                    const activityId = dragData.uuid.split('.Activity.')[1];
                    console.log("Looking for activity:", activityId);
                    
                    // Get the activity from the item's activities
                    console.log("Activities collection:", sourceItem.system.activities); // Debug log
                    const activity = sourceItem.system.activities?.get(activityId);
                    if (!activity) {
                        console.log("Item data:", sourceItem); // Debug log to see item structure
                        ui.notifications.error("Could not find activity in parent item");
                        return;
                    }

                    console.log("Found activity:", activity); // Debug log

                    // For activities, we want to capture all relevant activity data
                    let itemData = {
                        uuid: dragData.uuid,
                        name: activity.name || sourceItem.name,
                        icon: dragData.icon || dragData.img || activity.img || `systems/dnd5e/icons/svg/activity/${activity.type}.svg`,
                        type: "Activity",
                        activityType: activity.type, // Add the specific activity type (attack, heal, etc)
                        // Capture important activity data
                        activation: activity.activation || {
                            type: "action",
                            value: null,
                            override: false
                        },
                        duration: activity.duration || {
                            units: "inst",
                            concentration: false,
                            override: false
                        },
                        target: activity.target || {
                            template: {
                                contiguous: false,
                                units: "ft"
                            },
                            affects: {
                                choice: false
                            },
                            override: false,
                            prompt: true
                        },
                        range: activity.range || {
                            override: false
                        },
                        uses: activity.uses || {
                            spent: 0,
                            recovery: []
                        },
                        consumption: activity.consumption || {
                            scaling: {
                                allowed: false
                            },
                            spellSlot: true,
                            targets: []
                        },
                        effects: activity.effects || [],
                        description: activity.description || {},
                        // Add activity-specific data based on type
                        attack: activity.type === "attack" ? activity.attack : undefined,
                        damage: activity.type === "attack" ? activity.damage : undefined,
                        healing: activity.type === "heal" ? activity.healing : undefined,
                        // Add MIDI-QOL properties if they exist
                        ignoreTraits: activity.ignoreTraits || {},
                        midiProperties: activity.midiProperties || {},
                        isOverTimeFlag: activity.isOverTimeFlag || false,
                        overTimeProperties: activity.overTimeProperties || {},
                        // Add any other activity-specific data
                        useConditionText: activity.useConditionText || "",
                        useConditionReason: activity.useConditionReason || "",
                        effectConditionText: activity.effectConditionText || "",
                        macroData: activity.macroData || {
                            name: "",
                            command: ""
                        },
                        sortData: dragData.sortData || {}
                    };

                    // Validate required data with specific error messages
                    if (!itemData.name) {
                        ui.notifications.error("Activity name is missing");
                        return;
                    }
                    if (!itemData.icon) {
                        ui.notifications.error("Activity icon is missing");
                        return;
                    }

                    console.log("Activity data prepared:", itemData); // Debug log

                    // Update the container
                    container.data.items[slotKey] = itemData;
                    await container.render();
                    await this.ui.manager.persist();
                    return;
                } catch (error) {
                    console.error("Error processing activity:", error);
                    ui.notifications.error("Failed to process activity");
                    return;
                }
            }

            // If we have a UUID, try to get the item and its owner
            if (dragData.uuid) {
                item = await fromUuid(dragData.uuid);
                if (item?.parent instanceof Actor) {
                    sourceActor = item.parent;
                }
            }
            // If we have actor ID and item data
            else if (dragData.actorId && dragData.data) {
                sourceActor = game.actors.get(dragData.actorId);
                item = dragData.data;
            }

            // Prevent cross-actor item placement
            if (sourceActor && sourceActor.id !== currentToken.actor.id) {
                ui.notifications.warn("You cannot add items from other characters.");
                return;
            }

            // If item doesn't belong to any actor, add it to current actor's sheet using Foundry's native method
            if (!sourceActor && item) {
                try {
                    // Let Foundry handle the item creation - it will fire the proper hooks for our auto-populate
                    await Item.implementation.create(item, {parent: currentToken.actor});
                    ui.notifications.info(`Added ${item.name} to character sheet.`);
                    return;
                } catch (error) {
                    console.error("Error creating item:", error);
                    ui.notifications.error("Failed to add item to character sheet.");
                    return;
                }
            }

            // For items that already belong to the actor, proceed with normal hotbar placement
            if (sourceActor && sourceActor.id === currentToken.actor.id) {
                // Check for duplicates if not allowed for this container
                if (container.data.allowDuplicate !== true && await this._isDuplicate(dragData)) {
                    ui.notifications.warn("This item is already on the hotbar.");
                    return;
                }

                let itemData = {
                    uuid: dragData.uuid || `${dragData.actorId}.Item.${dragData.data._id}`,
                    name: dragData.name || dragData.label || item?.name,
                    icon: dragData.icon || dragData.img || item?.img,
                    type: dragData.type || item?.type,
                    activation: dragData.activation || item?.system?.activation,
                    sortData: dragData.sortData || {}
                };

                // Validate required data
                if (!itemData.name || !itemData.icon) {
                    throw new Error("Invalid item data");
                }

                // Update the container
                container.data.items[slotKey] = itemData;
                await container.render();
                await this.ui.manager.persist();
            }
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