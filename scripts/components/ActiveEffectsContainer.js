import { CONFIG } from '../utils/config.js';
import { TooltipFactory } from '../tooltip/TooltipFactory.js';
import { BaseTooltip } from '../tooltip/BaseTooltip.js';

// Add tooltip delay constant
const TOOLTIP_DELAY = 500; // 500ms delay before showing tooltip

export class ActiveEffectsContainer {
  constructor(hotbarUI) {
    this.hotbarUI = hotbarUI;
    this.element = null;
    this.lastKnownActorId = null;
    this._createContainer();
    this._registerHooks();
    this.update();
  }

  _createContainer() {
    this.element = document.createElement("div");
    this.element.classList.add("effects-container", "bg3-hud");
  }

  _registerHooks() {
    // Always update regardless of actor type.
    this._createEffectHandler = (effect) => {
      const actor = effect.parent;
      if (!actor) return;
      this.lastKnownActorId = actor.id;
      this.update();
    };

    this._deleteEffectHandler = (effect) => {
      const actor = effect.parent;
      if (!actor) return;
      this.lastKnownActorId = actor.id;
      this.update();
    };

    this._updateEffectHandler = (effect) => {
      const actor = effect.parent;
      if (!actor) return;
      
      // Store existing tooltips before update
      const existingTooltips = new Map();
      this.element.querySelectorAll('.active-effect-icon').forEach(wrapper => {
        if (wrapper.dataset.uuid === effect.uuid && wrapper._hotbarTooltip) {
          existingTooltips.set(wrapper.dataset.uuid, wrapper._hotbarTooltip);
        }
      });
      
      this.lastKnownActorId = actor.id;
      this.update();
      
      // After update, restore tooltips to new elements
      if (existingTooltips.size > 0) {
        requestAnimationFrame(() => {
          this.element.querySelectorAll('.active-effect-icon').forEach(wrapper => {
            const existingTooltip = existingTooltips.get(wrapper.dataset.uuid);
            if (existingTooltip) {
              wrapper._hotbarTooltip = existingTooltip;
              existingTooltip._cell = wrapper;
              // Update the tooltip's content with the new effect state
              if (existingTooltip.element) {
                existingTooltip.element.innerHTML = '';
                existingTooltip.item = effect;
                existingTooltip.buildContent();
              }
            }
          });
        });
      }
    };

    // Register hooks with stored handlers
    Hooks.on('createActiveEffect', this._createEffectHandler);
    Hooks.on('deleteActiveEffect', this._deleteEffectHandler);
    Hooks.on('updateActiveEffect', this._updateEffectHandler);

    // Hook into actor updates as well.
    this._updateActorHandler = (actor) => {
      if (!actor) return;
      this.lastKnownActorId = actor.id;
      this.update();
    };
    Hooks.on('updateActor', this._updateActorHandler);

    // Hook into token updates for unlinked tokens
    this._updateTokenHandler = (tokenDoc) => {
      if (tokenDoc.id === this.hotbarUI.manager.currentTokenId) {
        const tokenActor = tokenDoc.actor;
        if (tokenActor) {
          // For unlinked tokens, tokenDoc.actor may not be in game.actors.
          this.lastKnownActorId = tokenActor.id;
        }
        this.update();
      }
    };
    Hooks.on('updateToken', this._updateTokenHandler);
  }

  _createEffectIcon(effect) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("active-effect-icon");
    if (effect.disabled) {
      wrapper.classList.add("disabled");
    }
    wrapper.dataset.uuid = effect.uuid;
    const img = document.createElement("img");
    img.src = effect.img;

    // Toggle effect status on click.
    wrapper.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Clear any pending tooltip timer
      BaseTooltip.cleanup(effect.type || "effect");

      // Store the current tooltip before updating
      const currentTooltip = wrapper._hotbarTooltip;
      
      // Set updating flag
      wrapper._isUpdatingTooltip = true;
      
      // Update the effect's disabled status
      await effect.update({ disabled: !effect.disabled });
      
      // If there was a tooltip and it's not being dragged, update its content
      if (currentTooltip && !currentTooltip._isDragging) {
        // Clear the current content
        if (currentTooltip.element) {
          currentTooltip.element.innerHTML = '';
          // Rebuild the content with the updated effect state
          currentTooltip.item = effect;  // Update the item reference
          currentTooltip.buildContent();
        }
      }
      
      // Clear updating flag after a short delay
      const tooltipDelay = BaseTooltip.getTooltipDelay();
      setTimeout(() => {
        wrapper._isUpdatingTooltip = false;
      }, tooltipDelay + 50); // Add 50ms buffer to the delay
    });

    // Right-click to delete with confirmation.
    wrapper.addEventListener("contextmenu", async (e) => {
      e.preventDefault();
      const dialog = new Dialog({
        title: "Delete Effect",
        content: `<p>Are you sure you want to delete the effect "${effect.label}"?</p>`,
        buttons: {
          delete: {
            icon: '<i class="fas fa-trash"></i>',
            label: "Delete",
            callback: () => effect.delete()
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel"
          }
        },
        default: "cancel"
      });
      dialog.render(true);
    });

    // Store updating flag on the wrapper element
    wrapper._isUpdatingTooltip = false;

    // Attach tooltip on hover.
    wrapper.addEventListener("mouseenter", async (evt) => {
      const tooltip = await BaseTooltip.createWithDelay(effect, wrapper, evt, wrapper._isUpdatingTooltip);
      if (tooltip) {
        wrapper._hotbarTooltip = tooltip;
      }
    });
    
    wrapper.addEventListener("mouseleave", () => {
      // Handle tooltip cleanup
      if (wrapper._hotbarTooltip) {
        if (wrapper._hotbarTooltip._pinned) {
          wrapper._hotbarTooltip.highlight(false);
        } else {
          wrapper._hotbarTooltip.remove();
        }
        wrapper._hotbarTooltip = null;
      }
      // Ensure any pending tooltips are cleaned up
      BaseTooltip.cleanup(effect.type || "effect");
    });
    
    wrapper.appendChild(img);
    return wrapper;
  }

  _updateEffectsDisplay() {
    let actor = null;

    // Prioritize obtaining the actor from the current token.
    const token = canvas.tokens.get(this.hotbarUI.manager.currentTokenId);
    if (token?.actor) {
      actor = token.actor;
      this.lastKnownActorId = actor.id;
    } else if (this.lastKnownActorId) {
      // Fall back to actor directory (will work for linked tokens)
      actor = game.actors.get(this.lastKnownActorId);
    }

    if (!actor) {
      this.element.style.display = 'none';
      return;
    }

    // Get active effects from the actor's sheet.
    const currentEffects = actor.effects?.contents || [];

    if (currentEffects.length === 0) {
      this.element.style.display = 'none';
      return;
    }

    // Clear current icons and display container.
    this.element.innerHTML = "";
    this.element.style.display = 'flex';

    currentEffects.forEach(effect => {
      if (!effect) return;
      const iconEl = this._createEffectIcon(effect);
      this.element.appendChild(iconEl);
    });
  }

  destroy() {
    if (this._createEffectHandler) {
      Hooks.off('createActiveEffect', this._createEffectHandler);
    }
    if (this._deleteEffectHandler) {
      Hooks.off('deleteActiveEffect', this._deleteEffectHandler);
    }
    if (this._updateEffectHandler) {
      Hooks.off('updateActiveEffect', this._updateEffectHandler);
    }
    if (this._updateActorHandler) {
      Hooks.off('updateActor', this._updateActorHandler);
    }
    if (this._updateTokenHandler) {
      Hooks.off('updateToken', this._updateTokenHandler);
    }
    if (this.element?.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.hotbarUI = null;
  }

  async update() {
    this._updateEffectsDisplay();
  }
}
