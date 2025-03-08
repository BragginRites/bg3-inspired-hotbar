// TooltipFactory.js

import { EffectTooltip } from "./EffectTooltip.js";
import { SpellTooltip } from "./SpellTooltip.js";
import { WeaponTooltip } from "./WeaponTooltip.js";
import { FeatureTooltip } from "./FeatureTooltip.js";
import { BaseTooltip } from "./BaseTooltip.js";
import { fromUuid } from "../utils/foundryUtils.js";

export class TooltipFactory {
  static async create(item) {
    try {
      // Handle UUID resolution if needed
      if (typeof item === "string") {
        item = await fromUuid(item);
      }

      if (!item) {
        console.warn("TooltipFactory: No item provided");
        return null;
      }

      // For other items, ensure we have the full item data
      let itemData = item;
      
      // If this is a reference (like from a hotbar slot), get the full item
      if (item.uuid && !item.system) {
        itemData = await fromUuid(item.uuid);
        if (!itemData) {
          console.warn(`TooltipFactory: Could not resolve item from UUID: ${item.uuid}`);
          return null;
        }
      }

      // Create the appropriate tooltip based on item type
      switch (itemData.type) {
        case "weapon":
          return new WeaponTooltip(itemData);
        case "spell":
          return new SpellTooltip(itemData);
        case "feat":
          return new FeatureTooltip(itemData);
        case "effect":
        case "activeEffect":  // Handle both possible effect type names
          return new EffectTooltip(itemData);
        default:
          // Check if this is an ActiveEffect instance
          if (itemData instanceof ActiveEffect || itemData.documentName === "ActiveEffect") {
            return new EffectTooltip(itemData);
          }
          // Log what we're getting for debugging
          console.debug("TooltipFactory: Using base tooltip for item:", {
            type: itemData.type,
            name: itemData.name,
            system: itemData.system
          });
          return new BaseTooltip(itemData);
      }
    } catch (error) {
      console.error("TooltipFactory: Error creating tooltip:", error);
      return null;
    }
  }
}
