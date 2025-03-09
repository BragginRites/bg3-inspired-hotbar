// Auto Populate Container Feature
// Handles populating containers via context menu dialog

import { CONFIG } from '../utils/config.js';
import { AutoSort } from './AutoSort.js';

export class AutoPopulateContainer {
  static async populateContainer(actor, container, itemTypes = []) {
    const dialog = new AutoPopulateDialog(actor, container);
    return dialog._populateContainer(itemTypes);
  }

  static _sortItems(items) {
    // Use the centralized sorting from AutoSort
    return AutoSort._sortItems(items);
  }

  static _getExistingUuids(ui) {
    const existingUuids = new Set();
    if (!ui?.gridContainers) return existingUuids;
    
    for (const gridContainer of ui.gridContainers) {
      for (const slotKey in gridContainer.data.items) {
        const item = gridContainer.data.items[slotKey];
        if (item && item.uuid) {
          existingUuids.add(item.uuid);
        }
      }
    }
    return existingUuids;
  }

  static async _addItemsToContainer(items, container) {
    let addedCount = 0;
    
    try {
      addedCount = await this._addItemsExpandingContainer(items, container);
      
      // Ensure we're working with the correct data structure
      if (!container.data) {
        container.data = { items: container.items || {}, cols: container.cols, rows: container.rows };
      }
      
      // Render container and persist changes
      if (container.render) {
        container.render();
      }
      if (container.ui?.manager?.persist) {
        await container.ui.manager.persist();
      }
      
      return addedCount;
    } catch (error) {
      console.error("Error adding items to container:", error);
      return 0;
    }
  }

  static async _addItemsExpandingContainer(items, container) {
    let addedCount = 0;
    const cols = container.data?.cols || container.cols;
    const rows = container.data?.rows || container.rows;
    
    // Ensure container has proper data structure
    if (!container.data) {
      container.data = { items: {}, cols, rows };
    }
    if (!container.data.items) {
      container.data.items = {};
    }
    
    let r = 0;
    let c = 0;
    
    while (addedCount < items.length) {
      const slotKey = `${c}-${r}`;
      
      if (!container.data.items[slotKey]) {
        container.data.items[slotKey] = items[addedCount];
        addedCount++;
      }
      
      // Move right first, then down (rows first)
      c++;
      if (c >= cols) {
        c = 0;
        r++;
      }
    }
    
    return addedCount;
  }
}

export class AutoPopulateDialog extends Dialog {
  constructor(actor, container) {
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
              await this._populateContainer(selectedTypes);
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
      template: "modules/bg3-inspired-hotbar/templates/auto-populate-container.html"
    };

    super(dialogData, options);
    this.actor = actor;
    this.container = container;
  }

  getData(options={}) {
    const data = super.getData(options);
    data.itemTypes = [
      { value: "weapon", label: game.i18n.localize("BG3.Settings.ContainerAutoPopulate.Weapons") },
      { value: "feat", label: game.i18n.localize("BG3.Settings.ContainerAutoPopulate.Features") },
      { value: "spell", label: game.i18n.localize("BG3.Settings.ContainerAutoPopulate.Spells") },
      { value: "consumable", label: game.i18n.localize("BG3.Settings.ContainerAutoPopulate.Consumables") },
      { value: "equipment", label: game.i18n.localize("BG3.Settings.ContainerAutoPopulate.Equipment") },
      { value: "tool", label: game.i18n.localize("BG3.Settings.ContainerAutoPopulate.Tools") },
      { value: "loot", label: game.i18n.localize("BG3.Settings.ContainerAutoPopulate.Loot") }
    ];
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    
    // Handle chip clicks
    html.find('.chip').on('click', function() {
      $(this).toggleClass('active');
    });
  }

  async _populateContainer(selectedTypes) {
    if (!this.actor) return;

    try {
      // Get all items from the actor that match the selected types
      const itemsWithActivities = [];
      
      // Process all items from the actor
      for (const item of this.actor.items) {
        // Skip if item type is not in the selected types
        if (selectedTypes.length > 0 && !selectedTypes.includes(item.type)) continue;
        
        // For spells, check preparation state unless bypassed by setting
        if (item.type === "spell" && !game.settings.get(CONFIG.MODULE_NAME, 'bypassSpellPreparationCheck')) {
          const prep = item.system?.preparation;
          // Skip if it's an unprepared "prepared" spell
          if (!prep?.prepared && prep?.mode === "prepared") continue;
          // Include if it's prepared or has a valid casting mode
          if (!prep?.prepared && !["pact", "atwill", "innate"].includes(prep?.mode)) continue;
        }
        
        // Check if the item has activities or is usable
        const hasActivities = item.system?.activities?.length > 0 ||
                              (item.system?.activation?.type && item.system?.activation?.type !== "none") ||
                              item.type === "consumable" ||
                              item.type === "spell"; // Include valid spells (now filtered above)
        
        if (hasActivities) {
          itemsWithActivities.push({
            uuid: item.uuid,
            name: item.name,
            icon: item.img,
            type: item.type,
            activation: item.system?.activation?.type || "action",
            sortData: {
              spellLevel: item.type === "spell" ? item.system?.level ?? 99 : 99,
              featureType: item.type === "feat" ? item.system?.type?.value ?? "" : "",
              name: item.name
            }
          });
        }
      }
      
      if (itemsWithActivities.length === 0) {
        ui.notifications.warn("No items found matching the selected criteria.");
        return;
      }

      // Sort items by type order
      AutoPopulateContainer._sortItems(itemsWithActivities);
      
      // Get existing UUIDs to prevent duplicates
      const existingUuids = AutoPopulateContainer._getExistingUuids(this.container.ui);
      
      // Filter out items that already exist in the hotbar
      const newItems = itemsWithActivities.filter(item => !existingUuids.has(item.uuid));
      
      if (newItems.length === 0) {
        ui.notifications.warn("All matching items are already in the hotbar.");
        return;
      }

      // Clear the container if requested
      if (this.container.data.items === undefined) {
        this.container.data = { items: {}, cols: this.container.cols, rows: this.container.rows };
      }
      
      // Add items to container
      const addedCount = await AutoPopulateContainer._addItemsToContainer(newItems, this.container);
      
      if (addedCount > 0) {
        ui.notifications.info(`Added ${addedCount} items to the hotbar.`);
      } else {
        ui.notifications.warn("No items could be added to the hotbar.");
      }
      
    } catch (error) {
      console.error("BG3 Inspired Hotbar | Error auto-populating hotbar:", error);
      ui.notifications.error("Error populating hotbar. See console for details.");
      throw error;
    }
  }
}
