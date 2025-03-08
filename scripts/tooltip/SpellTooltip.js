// SpellTooltip.js

import { BaseTooltip } from "./BaseTooltip.js";
import { getSpellLevelString, getSpellSchool, getItemDetails } from "../utils/tooltipUtils.js";

export class SpellTooltip extends BaseTooltip {
  buildContent() {
    // Early return if no item data
    if (!this.item) return;

    // Set tooltip type
    this.element.dataset.type = "spell";

    // Icon
    const icon = document.createElement("img");
    icon.src = this.item.img || this.item.icon || "";
    icon.alt = this.item.name || "";
    icon.classList.add("tooltip-icon");
    this.element.appendChild(icon);

    // Name (show activity name if selected)
    const nameEl = document.createElement("div");
    nameEl.classList.add("tooltip-name");
    if (this.item.selectedActivity) {
      const activity = this.item.selectedActivity.data;
      nameEl.textContent = `${activity.name || "Activity"} (${this.item.name})`;
    } else {
      nameEl.textContent = this.item.name || "";
    }
    this.element.appendChild(nameEl);

    // Spell level and school
    const level = this.item.system?.level ?? 0;
    const school = this.item.system?.school || "";
    const levelStr = getSpellLevelString(level);
    const schoolStr = getSpellSchool(school);

    const infoEl = document.createElement("div");
    infoEl.classList.add("tooltip-spell-info");
    infoEl.textContent = `${levelStr}${schoolStr ? ` - ${schoolStr}` : ''}`;
    this.element.appendChild(infoEl);

    // Get details - if we have a selected activity, pass that to getItemDetails
    const details = getItemDetails(this.item.selectedActivity?.data || this.item);
    const detailsEl = document.createElement("div");
    detailsEl.classList.add("tooltip-details-list");

    // Add activity-specific data attributes if available
    if (this.item.selectedActivity) {
      detailsEl.dataset.activityId = this.item.selectedActivity.id;
    }

    // Add damage/healing if present in activities
    let effectsHtml = [];
    if (details.activity) {
      // Check for damage
      if (details.activity.damage?.parts?.length > 0) {
        const damagePart = details.activity.damage.parts[0];
        if (damagePart.number && damagePart.denomination) {
          let damageText = `${damagePart.number}d${damagePart.denomination}`;
          if (damagePart.bonus) damageText += ` + ${damagePart.bonus}`;
          if (damagePart.types?.length > 0) {
            damageText += ` (${damagePart.types.join(", ")})`;
          }
          effectsHtml.push(`<div><strong>Damage:</strong> ${damageText}</div>`);
        }
      }

      // Check for healing
      if (details.activity.healing) {
        const healing = details.activity.healing;
        if (healing.number && healing.denomination) {
          let healText = `${healing.number}d${healing.denomination}`;
          if (healing.bonus) healText += ` + ${healing.bonus}`;
          if (healing.types?.length > 0) {
            healText += ` (${healing.types.join(", ")})`;
          }
          effectsHtml.push(`<div><strong>Healing:</strong> ${healText}</div>`);
        } else if (healing.custom?.enabled && healing.custom.formula) {
          effectsHtml.push(`<div><strong>Healing:</strong> ${healing.custom.formula}</div>`);
        }
      }
    }

    detailsEl.innerHTML = `
      ${details.castingTime ? `<div><strong>Casting Time:</strong> ${details.castingTime}</div>` : ''}
      ${details.range ? `<div><strong>Range:</strong> ${details.range}</div>` : ''}
      ${details.target ? `<div><strong>Target:</strong> ${details.target}</div>` : ''}
      ${details.duration ? `<div><strong>Duration:</strong> ${details.duration}</div>` : ''}
      ${effectsHtml.join('')}
    `;
    this.element.appendChild(detailsEl);

    // Description header
    const descHeader = document.createElement("div");
    descHeader.classList.add("tooltip-description-header");
    descHeader.textContent = "Description";
    this.element.appendChild(descHeader);

    // Description container
    const descContainer = document.createElement("div");
    descContainer.classList.add("tooltip-description-container");
    const descEl = document.createElement("div");
    descEl.textContent = "Loading description...";
    descContainer.appendChild(descEl);
    this.element.appendChild(descContainer);

    // Get description - if we have a selected activity, use its description
    const description = this.item.selectedActivity?.data?.description?.value || 
                       this.item.system?.description?.value || "";

    // Prepare roll data with activity context
    const rollData = this.item.getRollData ? this.item.getRollData() : {};
    if (this.item.selectedActivity) {
      rollData.activity = this.item.selectedActivity.id;
      // Include activity-specific data for lookups
      Object.assign(rollData, {
        save: this.item.selectedActivity.data.save || {},
        range: this.item.selectedActivity.data.range || {},
        target: this.item.selectedActivity.data.target || {},
        damage: this.item.selectedActivity.data.damage || {},
        duration: this.item.selectedActivity.data.duration || {}
      });
    }

    // Enrich HTML asynchronously with enhanced context
    TextEditor.enrichHTML(description, {
      rollData: rollData,
      secrets: false,
      entities: true,
      async: true,
      relativeTo: this.item, // Ensure proper context for lookups
      activityId: this.item.selectedActivity?.id // Pass activity ID for custom enrichers
    }).then(enrichedDescription => {
      descEl.innerHTML = enrichedDescription || "No description available.";
    });
  }
}
