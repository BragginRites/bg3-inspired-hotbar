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
        return null;
      }

      // For other items, ensure we have the full item data
      let itemData = item;
      
      // If this is a reference (like from a hotbar slot), get the full item
      if (item.uuid && !item.system) {
        itemData = await fromUuid(item.uuid);
        if (!itemData) {
          return null;
        }
      }

      // Create the appropriate tooltip based on item type
      let tooltip;
      switch (itemData.type) {
        case "weapon":
          tooltip = new WeaponTooltip(itemData);
          break;
        case "spell":
          tooltip = new SpellTooltip(itemData);
          break;
        case "feat":
          tooltip = new FeatureTooltip(itemData);
          break;
        case "effect":
        case "activeEffect":  // Handle both possible effect type names
          tooltip = new EffectTooltip(itemData);
          break;
        default:
          // Check if this is an ActiveEffect instance
          if (itemData instanceof ActiveEffect || itemData.documentName === "ActiveEffect") {
            tooltip = new EffectTooltip(itemData);
          } else {
            tooltip = new BaseTooltip(itemData);
          }
      }

      return tooltip;
    } catch (error) {
      return null;
    }
  }
}
