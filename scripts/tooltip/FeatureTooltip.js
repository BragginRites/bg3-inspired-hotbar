import { BaseTooltip } from "./BaseTooltip.js";
import { getItemDetails } from "../utils/tooltipUtils.js";

export class FeatureTooltip extends BaseTooltip {
  buildContent() {
    // Early return if no item data
    if (!this.item) return;

    // Set tooltip type
    this.element.dataset.type = "feature";

    // Create main content container
    const content = document.createElement("div");
    content.classList.add("tooltip-content");

    // Icon
    const icon = document.createElement("img");
    icon.src = this.item.img || this.item.icon || "";
    icon.alt = this.item.name || "";
    icon.classList.add("tooltip-icon");
    content.appendChild(icon);

    // Name
    const nameEl = document.createElement("div");
    nameEl.classList.add("tooltip-name");
    nameEl.textContent = this.item.name || "";
    content.appendChild(nameEl);

    // Get common details (activation, range, target, duration)
    const details = getItemDetails(this.item);
    if (Object.keys(details).length > 0) {
      const detailsEl = document.createElement("div");
      detailsEl.classList.add("tooltip-details-list");
      
      // Feature-specific details
      const detailsHTML = [];
      if (details.castingTime) detailsHTML.push(`<div><strong>Action:</strong> ${details.castingTime}</div>`);
      if (details.range) detailsHTML.push(`<div><strong>Range:</strong> ${details.range}</div>`);
      if (details.target) detailsHTML.push(`<div><strong>Target:</strong> ${details.target}</div>`);
      if (details.duration) detailsHTML.push(`<div><strong>Duration:</strong> ${details.duration}</div>`);

      // Add damage/healing if present in activities
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
            detailsHTML.push(`<div><strong>Damage:</strong> ${damageText}</div>`);
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
            detailsHTML.push(`<div><strong>Healing:</strong> ${healText}</div>`);
          } else if (healing.custom?.enabled && healing.custom.formula) {
            detailsHTML.push(`<div><strong>Healing:</strong> ${healing.custom.formula}</div>`);
          }
        }
      }

      if (this.item.system?.uses) {
        detailsHTML.push(`<div><strong>Uses:</strong> ${this.item.system.uses.value || 0}/${this.item.system.uses.max || 0}</div>`);
      }
      
      if (detailsHTML.length > 0) {
        detailsEl.innerHTML = detailsHTML.join('');
        content.appendChild(detailsEl);
      }
    }

    // Description
    if (this.item.system?.description?.value) {
      // Description header
      const descHeader = document.createElement("div");
      descHeader.classList.add("tooltip-description-header");
      descHeader.textContent = "Description";
      content.appendChild(descHeader);

      const descContainer = document.createElement("div");
      descContainer.classList.add("tooltip-description-container");
      
      const descEl = document.createElement("div");
      descEl.classList.add("tooltip-description");
      descContainer.appendChild(descEl);
      
      // Asynchronously enrich the description
      TextEditor.enrichHTML(this.item.system.description.value, {
        rollData: this.item.getRollData ? this.item.getRollData() : {},
        secrets: false,
        entities: true,
        links: true,
        rolls: true,
        async: true,
        relativeTo: this.item,
        activityId: this.item.selectedActivity?.id
      }).then(enrichedDesc => {
        descEl.innerHTML = enrichedDesc || "No description available.";
      });
      
      content.appendChild(descContainer);
    } else {
      const noDesc = document.createElement("div");
      noDesc.classList.add("tooltip-description");
      noDesc.textContent = "No description available.";
      content.appendChild(noDesc);
    }

    this.element.appendChild(content);
  }
} 