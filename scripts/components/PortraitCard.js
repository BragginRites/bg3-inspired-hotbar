// Portrait Card Component

import { CONFIG } from '../utils/config.js';
import { AbilityButton } from './AbilityButton.js';

export class PortraitCard {
    constructor(gridContainer) {
        this.gridContainer = gridContainer;
        this.element = null;
        this.abilityButton = null;
        this._createCard();
    }

    _createCard() {
        this.element = document.createElement("div");
        this.element.classList.add("portrait-card", "visible");
        this.element.setAttribute("data-container-index", this.gridContainer.index);

        const imageContainer = this._createImageContainer();
        this.element.appendChild(imageContainer);
        
        // Create the ability button
        this.abilityButton = new AbilityButton(this);
    }

    _createImageContainer() {
        const container = document.createElement("div");
        container.classList.add("portrait-image-container");

        const token = canvas.tokens.get(this.gridContainer.ui.manager.currentTokenId);
        if (!token?.actor) return container;

        // Add token image
        const image = document.createElement("img");
        image.classList.add("portrait-image");
        image.src = token.document.texture.src;
        image.alt = token.actor.name;
        container.appendChild(image);

        // Add health overlay
        this._createHealthOverlay(container, token.actor);
        this._createHPText(container, token.actor);

        // Add double-click event listener to open character sheet
        image.addEventListener('dblclick', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (token?.actor) {
                token.actor.sheet.render(true);
            }
        });

        return container;
    }

    _createHealthOverlay(container, actor) {
        const healthOverlay = document.createElement("div");
        healthOverlay.classList.add("health-overlay");
        Object.assign(healthOverlay.style, {
            borderRadius: "50%",
            overflow: "hidden"  // Ensure child elements are clipped to the circle
        });
        
        // Create the base red damage overlay
        const damageOverlay = document.createElement("div");
        damageOverlay.classList.add("damage-overlay");
        damageOverlay.style.borderRadius = "50% 50% 0 0";  // Round the top corners
        healthOverlay.appendChild(damageOverlay);
        
        // Create the flash overlay for damage animations
        const damageFlash = document.createElement("div");
        damageFlash.classList.add("damage-flash");
        damageFlash.style.borderRadius = "50% 50% 0 0";  // Round the top corners
        healthOverlay.appendChild(damageFlash);
        
        // Create the flash overlay for healing animations
        const healingFlash = document.createElement("div");
        healingFlash.classList.add("healing-flash");
        healingFlash.style.borderRadius = "50% 50% 0 0";  // Round the top corners
        healthOverlay.appendChild(healingFlash);
        
        // Set initial health state
        const hpValue = actor.system.attributes?.hp?.value || 0;
        const hpMax = actor.system.attributes?.hp?.max || 1;
        const hpPercent = Math.max(0, Math.min(100, (hpValue / hpMax) * 100));
        const damagePercent = 100 - hpPercent;
        
        // Only show the red overlay on the damaged portion (from top down)
        if (damagePercent > 0) {
            damageOverlay.style.height = `${damagePercent}%`;
            damageOverlay.style.opacity = '1';
        } else {
            damageOverlay.style.height = '0';
            damageOverlay.style.opacity = '0';
        }
        
        container.appendChild(healthOverlay);
    }

    _createHPText(container, actor) {
        // Remove any existing HP text
        const oldHpText = this.element?.querySelector('.hp-text');
        if (oldHpText) oldHpText.remove();

        const hpText = document.createElement("div");
        hpText.classList.add("hp-text");
        
        // Add temp HP if it exists
        const tempHp = actor.system.attributes?.hp?.temp || 0;
        if (tempHp > 0) {
            const tempHpSpan = document.createElement("div");
            tempHpSpan.classList.add("temp-hp-text");
            tempHpSpan.textContent = `+${tempHp}`;
            hpText.appendChild(tempHpSpan);
        }
        
        // Add current/max HP
        const hpValue = actor.system.attributes?.hp?.value || 0;
        const hpMax = actor.system.attributes?.hp?.max || 0;
        const regularHpSpan = document.createElement("div");
        regularHpSpan.textContent = `${hpValue}/${hpMax}`;
        hpText.appendChild(regularHpSpan);
        
        container.appendChild(hpText);
    }

    toggle() {
        this.element.classList.toggle('visible', this.isVisible);
    }

    show() {
        this.element.classList.add('visible');
    }

    hide() {
        this.element.classList.remove('visible');
    }

    toggleAbilityCard() {
        if (this.abilityButton) {
            this.abilityButton._toggleAbilityCard();
        }
    }

    render() {
        // Re-render the card with current token data
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
        this._createImageContainer();
    }

    /**
     * Update the portrait card with new actor data
     * @param {Actor} actor - The actor to update with
     */
    update(actor) {
        if (!actor) return;
        
        // Store the actor ID for locked state persistence
        this.lastKnownActorId = actor.id;

        // Update portrait image
        const portraitImg = this.element.querySelector('.portrait-image');
        if (portraitImg) {
            portraitImg.src = actor.img;
        }

        const token = canvas.tokens.get(this.gridContainer.ui.manager.currentTokenId);
        if (!token?.actor) return;

        const container = this.element.querySelector('.portrait-image-container');
        if (!container) return;

        // Update HP text
        this._createHPText(container, token.actor);

        // Update health overlay
        const damageOverlay = this.element.querySelector('.damage-overlay');
        if (damageOverlay) {
            const hpValue = token.actor.system.attributes?.hp?.value || 0;
            const hpMax = token.actor.system.attributes?.hp?.max || 1;
            const hpPercent = Math.max(0, Math.min(100, (hpValue / hpMax) * 100));
            const damagePercent = 100 - hpPercent;

            if (damagePercent > 0) {
                damageOverlay.style.height = `${damagePercent}%`;
                damageOverlay.style.opacity = '1';
            } else {
                damageOverlay.style.height = '0';
                damageOverlay.style.opacity = '0';
            }
        }
    }

    /**
     * Clean up resources and remove the element from the DOM.
     */
    destroy() {
        if (this.abilityButton) {
            this.abilityButton.destroy();
            this.abilityButton = null;
        }
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.gridContainer = null;
    }
} 