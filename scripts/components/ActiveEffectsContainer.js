import { CONFIG } from '../utils/config.js';
import { Tooltip, EffectTooltip } from './Tooltip.js';

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
    this.element.classList.add("effects-container");
    Object.assign(this.element.style, {
      position: "absolute",
      top: "-24px",
      right: "0", // Right aligned
      minWidth: "20px",
      maxWidth: "300px",
      background: CONFIG.COLORS.BACKGROUND,
      border: `1px solid ${CONFIG.COLORS.BORDER}`,
      borderRadius: "3px",
      display: "flex",
      alignItems: "center",
      padding: "2px 4px",
      boxSizing: "border-box",
      zIndex: CONFIG.Z_INDEX.OVERLAY.ABILITY_CARD - 1,
      cursor: "pointer",
      flexWrap: "wrap",
      gap: "2px",
      flexDirection: "row-reverse" // Expand leftward
    });
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
      this.lastKnownActorId = actor.id;
      this.update();
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
    img.src = effect.icon;
    Object.assign(img.style, {
      width: "16px",
      height: "16px",
      display: "block",
      cursor: "pointer"
    });
    const updateVisualState = () => {
      if (effect.disabled) {
        wrapper.classList.add("disabled");
      } else {
        wrapper.classList.remove("disabled");
      }
    };

    // Toggle effect status on click.
    wrapper.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (wrapper._hotbarTooltip) {
        wrapper._hotbarTooltip.remove();
        wrapper._hotbarTooltip = null;
      }
      await effect.update({ disabled: !effect.disabled });
      updateVisualState();
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

    // Attach tooltip on hover.
    wrapper.addEventListener("mouseenter", (evt) => {
      const tooltip = new EffectTooltip();
      tooltip.attach(wrapper, effect, evt);
      wrapper._hotbarTooltip = tooltip;
    });
    wrapper.addEventListener("mouseleave", () => {
      if (wrapper._hotbarTooltip && !wrapper._hotbarTooltip._pinned) {
        wrapper._hotbarTooltip.remove();
        wrapper._hotbarTooltip = null;
      }
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
      console.debug("ActiveEffects: Got actor from token:", actor.name);
    } else if (this.lastKnownActorId) {
      // Fall back to actor directory (will work for linked tokens)
      actor = game.actors.get(this.lastKnownActorId);
    }

    if (!actor) {
      console.debug("ActiveEffects: No actor found, hiding container");
      this.element.style.display = 'none';
      return;
    }

    // Get active effects from the actor's sheet.
    const currentEffects = actor.effects?.contents || [];
    console.debug("ActiveEffects: Found", currentEffects.length, "effects for actor:", actor.name);

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
    console.debug("ActiveEffects: Displayed effects for actor:", actor.name);
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
