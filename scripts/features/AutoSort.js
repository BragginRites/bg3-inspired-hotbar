// Auto Sort Feature
// Handles sorting items in containers

import { fromUuid } from '../utils/foundryUtils.js';

export class AutoSort {
    static async sortContainer(container) {
        if (!container?.data?.items) return;
console.log('sortContainer')
        try {
            // Convert items object to array for sorting
            const items = Object.values(container.data.items);
            console.log(items)
            
            // Second pass: fetch fresh data for each item
            for (const item of items) {
                try {
                    const itemData = await fromUuid(item.uuid);
                    if (itemData) {
                        item.sortData = {
                            spellLevel: item.type === "spell" ? (item.override.level ?? itemData.system?.level ?? 0) : 99,
                            featureType: item.type === "feat" ? itemData.system?.type?.value ?? "" : "",
                            name: item.name
                        };
                    } else {
                        // Fallback to stored sortData if we can't fetch fresh data
                        item.sortData = item.sortData || {
                            spellLevel: item.type === "spell" ? 99 : 99,
                            featureType: item.type === "feat" ? "" : "",
                            name: item.name
                        };
                    }
                } catch (error) {
                    console.warn(`Failed to fetch fresh data for item ${item.name}:`, error);
                    // Use stored sortData as fallback
                    item.sortData = item.sortData || {
                        spellLevel: item.type === "spell" ? 99 : 99,
                        featureType: item.type === "feat" ? "" : "",
                        name: item.name
                    };
                }
            }

            // Sort items
            this._sortItems(items);

            // Clear container
            container.data.items = {};

            // Re-add items in sorted order
            let r = 0;
            let c = 0;
            const cols = container.data.cols || container.data.cols || 5;
            const rows = container.data.rows || container.data.rows || 3;

            for (const item of items) {
                const slotKey = `${c}-${r}`;
                container.data.items[slotKey] = item;

                // Move to next position
                c++;
                if (c >= cols) {
                    c = 0;
                    r++;
                }

                // Stop if we've filled all rows
                if (r >= rows) break;
            }

            // Render container and persist changes
            if (container.render) container.render();
            
            if (ui.BG3HOTBAR?.manager?.persist) await ui.BG3HOTBAR.manager.persist();

            ui.notifications.info("Container sorted successfully.");
        } catch (error) {
            console.error("Error sorting container:", error);
            ui.notifications.error("Failed to sort container. See console for details.");
        }
    }

    static _sortItems(items) {
        // Define type order (first to last)
        const typeOrder = ["weapon", "equipment", "consumable", "feat", "spell", "tool", "loot"];
        
        items.sort((a, b) => {
            // First, sort by item type according to our defined order
            const typeIndexA = typeOrder.indexOf(a.type);
            const typeIndexB = typeOrder.indexOf(b.type);
            
            // Handle different type priorities
            if (typeIndexA !== typeIndexB) {
                if (typeIndexA === -1) return 1;  // Unknown types go to the end
                if (typeIndexB === -1) return -1;
                return typeIndexA - typeIndexB;
            }
            
            // Then apply type-specific sorting
            switch (a.type) {
                case "spell":
                    // Sort by spell level first (cantrips = 0, then 1-9)
                    const levelA = a.sortData?.spellLevel ?? 99;
                    const levelB = b.sortData?.spellLevel ?? 99;
                    if (levelA !== levelB) {
                        return levelA - levelB;
                    }
                    // If same level, sort alphabetically
                    return (a.name || "").localeCompare(b.name || "");

                case "feat":
                    // Sort by feature type first
                    const typeA = a.sortData?.featureType || "";
                    const typeB = b.sortData?.featureType || "";
                    const typeCompare = typeA.localeCompare(typeB);
                    if (typeCompare !== 0) {
                        return typeCompare;
                    }
                    // If same type, sort alphabetically
                    return (a.name || "").localeCompare(b.name || "");

                default:
                    // All other items sort alphabetically within their type
                    return (a.name || "").localeCompare(b.name || "");
            }
        });
    }
}