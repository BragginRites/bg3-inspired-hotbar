// Auto Populate Feature

import { BG3CONFIG } from '../utils/config.js';
import { HotbarManager } from '../managers/HotbarManager.js';
import { AutoSort } from './AutoSort.js';
import { BG3UTILS } from '../utils/utils.js';

export class AutoPopulateFeature {
    static async populateUnlinkedToken(token, force = false) {
        if (!token?.actor) return;

        try {
            // Check if user has permission to modify this token
            if (!token.actor.canUserModify(game.user, "update")) {
                console.debug("BG3 Inspired Hotbar | User lacks permission to modify token actor");
                return;
            }

            // Create a temporary hotbar manager for this token
            const tempManager = new HotbarManager();
            tempManager.currentTokenId = token.id;
            await tempManager._loadTokenData();
            
            // Auto-populate combat container if setting on true
            if(!(!tempManager.containers.combat[0]?.items || Object.values(tempManager.containers.combat[0].items).length > 0)) {
                if((game.settings.get(BG3CONFIG.MODULE_NAME, 'autoPopulateCombatContainer') || force) && token.actor.type !== 'vehicle') {
                    if(force) tempManager.containers.combat[0].items = {};
                    await this._populateCommonActions(token.actor, tempManager);
                }
            }

            if(token.actor.type !== 'character' && ((!token.actorLink && (game.settings.get(BG3CONFIG.MODULE_NAME, 'autoPopulateUnlinkedTokens') || force)) || (token.actorLink && (game.settings.get(BG3CONFIG.MODULE_NAME, 'autoPopulateLinkedTokens') || force)))) {
                // Get settings for each container
                const container1Setting = game.settings.get(BG3CONFIG.MODULE_NAME, 'container1AutoPopulate');
                const container2Setting = game.settings.get(BG3CONFIG.MODULE_NAME, 'container2AutoPopulate');
                const container3Setting = game.settings.get(BG3CONFIG.MODULE_NAME, 'container3AutoPopulate');
      
                // Process each weapon & combat containers
                if(force) {
                    tempManager.containers.weapon[0].items = {};
                    tempManager.containers.weapon[1].items = {};
                    tempManager.containers.weapon[2].items = {};
                }
                await this._populateWeaponsToken(token.actor, tempManager);
    
                // Process each container
                if(force) {
                    tempManager.containers.hotbar[0].items = {};
                    tempManager.containers.hotbar[1].items = {};
                    tempManager.containers.hotbar[2].items = {};
                }
                await this._populateContainerWithSettings(token.actor, tempManager, 0, container1Setting);
                await this._populateContainerWithSettings(token.actor, tempManager, 1, container2Setting);
                await this._populateContainerWithSettings(token.actor, tempManager, 2, container3Setting);
            }

            // Save the changes only if we still have permission
            if (token.actor.canUserModify(game.user, "update")) await tempManager.persist();

        } catch (error) {
            console.error("BG3 Inspired Hotbar | Error auto-populating unlinked token hotbar:", error);
        }
    }

    static checkExtraConditions(item) {
      return game.settings.get(BG3CONFIG.MODULE_NAME, 'noActivityAutoPopulate') || !BG3UTILS.itemIsPassive(item);;
    }

    static getItemsList(actor, itemTypes) {
        return [];
    }

    static constructItemData(item) {
        return {uuid: item.uuid};
    }

    static async _populateContainerWithSettings(actor, manager, containerIndex, itemTypes) {
        if (!actor?.items || !manager?.containers?.hotbar || !itemTypes?.length) return;
        
        const container = manager.containers.hotbar[containerIndex];
        if (!container) return;

        try {
            // Get all items from the actor that match the selected types
            const itemsWithActivities = [];

            // const itemList = AutoPopulateFeature.getItemsList(actor, itemTypes, BG3UTILS.shouldEnforceSpellPreparation(actor, manager.currentTokenId));
            const itemList = AutoPopulateFeature.getItemsList(actor, itemTypes, manager);
            // Process all items from the actor
            for (const item of itemList) {
                // Skip if item type is not in the selected types
                if (Object.values(manager.containers.combat[0].items).find(d => d.uuid === item.uuid)
                    || manager.containers.weapon.reduce((acc, curr) => acc.concat(Object.values(curr.items)), []).find(i => i.uuid === item.uuid)
                ) continue;
                
                const itemData = AutoPopulateFeature.constructItemData(item);
                itemsWithActivities.push(itemData);
            }
            
            if (itemsWithActivities.length === 0 && actor === ui.BG3HOTBAR.manager?.actor) {
                ui.notifications.warn("No items found matching the selected criteria.");
                return;
            }

            // Sort items
            AutoSort._sortItems(itemsWithActivities);
            
            // Get existing UUIDs to prevent duplicates
            const existingUuids = AutoPopulateFeature._getExistingUuids();
            
            // Filter out items that already exist in the hotbar
            const newItems = itemsWithActivities.filter(item => !existingUuids.has(item.uuid));
            
            if (itemsWithActivities.length && newItems.length === 0) {
                ui.notifications.warn("All matching items are already in the hotbar.");
                return;
            }

            // Place items in grid format (rows first: left to right, then down)
            let x = 0;
            let y = 0;

            for (const item of newItems) {
                if (y >= container.rows) break; // Stop if we exceed container rows

                const gridKey = `${x}-${y}`;
                container.items[gridKey] = item;

                // Move right first, then down (rows first)
                x++;
                if (x >= container.cols) {
                    x = 0;
                    y++;
                }
            }

            if (newItems.length > 0) ui.notifications.info(`Added ${newItems.length} items to the hotbar.`);
            else if(actor === ui.BG3HOTBAR.manager?.actor) ui.notifications.warn("No items could be added to the hotbar.");
            
        } catch (error) {
            console.error("BG3 Inspired Hotbar | Error auto-populating container:", error);
        }
    }

    static async _populateWeaponsToken(actor, manager) {
        return [];
    }

    static async _getCombatActionsList(actor) {
        return [];
    }

    static async _populateCommonActions(actor, manager) {
        if(actor.type == 'vehicule') return;
        try {
            const ids = await this._getCombatActionsList(actor);
            let count = 0;
            for(let i = 0; i < 3; i++) {
                for(let j = 0; j < 3; j++) {
                    if(ids[count]) manager.containers.combat[0].items[`${i}-${j}`] = $.isPlainObject(ids[count]) ? ids[count] : {uuid: ids[count]};
                    count++;
                }
            }
        } catch (error) {
            console.error("BG3 Inspired Hotbar | Error auto-populating common actions token hotbar:", error);
        }
    }

    static _getExistingUuids() {
        const existingUuids = new Set();
        if (!ui.BG3HOTBAR?.components?.container?.components?.hotbar) return existingUuids;
        
        for (const gridContainer of ui.BG3HOTBAR.components.container.components.hotbar) {
        for (const slotKey in gridContainer.data.items) {
            const item = gridContainer.data.items[slotKey];
            if (item && item.uuid) {
            existingUuids.add(item.uuid);
            }
        }
        }
        return existingUuids;
    }
}

export class AutoPopulateSettings extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "bg3-hotbar-auto-populate-defaults",
            title: game.i18n.localize("BG3.Settings.ContainerAutoPopulate.DefaultsTitle"),
            template: `modules/${BG3CONFIG.MODULE_NAME}/templates/dialog/auto-populate-defaults.html`,
            width: 800,
            height: "auto",
            closeOnSubmit: true,
            submitOnClose: false
        });
    }

    getData() {
        // Get current settings for each container
        const containerSettings = {
            container1: game.settings.get(BG3CONFIG.MODULE_NAME, 'container1AutoPopulate'),
            container2: game.settings.get(BG3CONFIG.MODULE_NAME, 'container2AutoPopulate'),
            container3: game.settings.get(BG3CONFIG.MODULE_NAME, 'container3AutoPopulate'),
            allowPassive: game.settings.get(BG3CONFIG.MODULE_NAME, 'noActivityAutoPopulate')
        };

        return {
            containerSettings,
            choices: BG3CONFIG.ITEM_TYPES
        };
    }

    async _updateObject(event, formData) {
        try {
            // Update all container settings
            const containers = ['container1', 'container2', 'container3'];
            for (const container of containers) {
                const selectedTypes = Array.from(this.element[0].querySelectorAll(`.container-chips[data-container="${container}"] .chip.active`))
                    .map(chip => chip.dataset.value);
                
                await game.settings.set(BG3CONFIG.MODULE_NAME, `${container}AutoPopulate`, selectedTypes);
            }
            await game.settings.set(BG3CONFIG.MODULE_NAME, `noActivityAutoPopulate`, this.element[0].querySelector("#passive-populate-checkbox").checked);
            ui.notifications.info(game.i18n.localize("BG3.Settings.ContainerAutoPopulate.SaveSuccess"));
        } catch (error) {
            console.error("Error saving container settings:", error);
            ui.notifications.error("Error saving container settings");
        }
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Handle chip clicks
        html.find('.chip').on('click', event => {
            event.preventDefault();
            const chip = event.currentTarget;
            chip.classList.toggle('active');
        });
    }
}


export class AutoPopulateDialog extends Dialog {
    constructor(container) {
        const dialogData = {
            title: game.i18n.localize("BG3.Settings.ContainerAutoPopulate.DialogTitle"),
            content: "",
            buttons: {
            submit: {
                icon: '<i class="fas fa-save"></i>',
                label: game.i18n.localize("BG3.Settings.ContainerAutoPopulate.Populate"),
                callback: async (html) => {
                const selectedTypes = Array.from(html.find('.chip.active')).map(chip => chip.dataset.value);
                
                if (selectedTypes.length === 0) {
                    ui.notifications.warn("Please select at least one item type to populate.");
                    return;
                }
    
                try {
                    ui.notifications.info("Populating container...");
                    await AutoPopulateFeature._populateContainerWithSettings(this.actor, ui.BG3HOTBAR.manager, container.index, selectedTypes);
                    ui.BG3HOTBAR.manager.persist();
                    container.render();
                    ui.notifications.info("Container populated successfully.");
                } catch (error) {
                    console.error("Error populating container:", error);
                    ui.notifications.error("Failed to populate container. See console for details.");
                }
                }
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: game.i18n.localize("BG3.Settings.ContainerAutoPopulate.Cancel")
            }
            },
            default: "submit"
        };
    
        const options = {
            classes: ["bg3-hotbar-dialog", "auto-populate-dialog"],
            width: 800,
            height: "auto",
            jQuery: true,
            template: `modules/${BG3CONFIG.MODULE_NAME}/templates/dialog/auto-populate-container.html`
        };

        super(dialogData, options);
        this.actor = ui.BG3HOTBAR.manager.actor;
        this.container = container;
    }

    getData(options={}) {
        const data = super.getData(options);
        data.containerSettings = game.settings.get(BG3CONFIG.MODULE_NAME, `container${this.container.index + 1}AutoPopulate`);
        data.itemTypes = BG3CONFIG.ITEM_TYPES;
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
        
        // Handle chip clicks
        html.find('.chip').on('click', function() {
            $(this).toggleClass('active');
        });
    }
}