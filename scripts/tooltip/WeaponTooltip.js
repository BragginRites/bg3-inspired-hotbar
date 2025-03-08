// WeaponTooltip.js

import { BaseTooltip } from "./BaseTooltip.js";
import { getItemDetails } from "../utils/tooltipUtils.js";

export class WeaponTooltip extends BaseTooltip {
  buildContent() {
    // Early return if no item data
    if (!this.item) return;

    // Set tooltip type (for CSS targeting if needed)
    this.element.dataset.type = "weapon";

    // Icon
    const icon = document.createElement("img");
    icon.src = this.item.img || this.item.icon || "";
    icon.alt = this.item.name || "";
    icon.classList.add("tooltip-icon");
    this.element.appendChild(icon);

    // Name
    const nameEl = document.createElement("div");
    nameEl.classList.add("tooltip-name");
    nameEl.textContent = this.item.name || "";
    this.element.appendChild(nameEl);

    // Get common details (including casting time and range from activities/system)
    const details = getItemDetails(this.item);
    const detailsEl = document.createElement("div");
    detailsEl.classList.add("tooltip-details-list");

    // Add activity-specific data attributes if available
    if (details.activityId) {
      detailsEl.dataset.activityId = details.activityId;
    }

    // Weapon-specific details:
    // Damage: use the "base" damage field if present
    const damageData = this.item.system?.damage;
    let damageText = "N/A";
    if (damageData?.base && damageData.base.number && damageData.base.denomination) {
      damageText = `${damageData.base.number}d${damageData.base.denomination}`;
      if (damageData.base.types && damageData.base.types.length > 0) {
        damageText += ` (${damageData.base.types.join(", ")})`;
      }
    }
    // Versatile damage: if available, add a secondary line
    let versatileText = "";
    if (damageData?.versatile && damageData.versatile.number && damageData.versatile.denomination) {
      versatileText = `Versatile: ${damageData.versatile.number}d${damageData.versatile.denomination}`;
    }

    detailsEl.innerHTML = `
      ${details.castingTime ? `<div><strong>Action:</strong> ${details.castingTime}</div>` : ''}
      ${details.range ? `<div><strong>Range:</strong> ${details.range}</div>` : ''}
      <div><strong>Damage:</strong> ${damageText}</div>
      ${versatileText ? `<div><strong>${versatileText}</strong></div>` : ''}
      ${this.item.system?.properties && this.item.system.properties.length ? `<div><strong>Properties:</strong> ${this.item.system.properties.join(', ')}</div>` : ''}
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

    // Asynchronously enrich the description
    TextEditor.enrichHTML(this.item.system?.description?.value || "", {
      rollData: this.item.getRollData ? this.item.getRollData() : {},
      secrets: false,
      entities: true,
      links: true,
      rolls: true,
      async: true,
      relativeTo: this.item,
      activityId: this.item.selectedActivity?.id
    }).then(enrichedDescription => {
      descEl.innerHTML = enrichedDescription || "No description available.";
    });
  }
}
