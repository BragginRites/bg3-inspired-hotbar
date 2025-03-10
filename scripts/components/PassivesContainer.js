import { CONFIG } from '../utils/config.js';
import { TooltipFactory } from '../tooltip/TooltipFactory.js';
import { BaseTooltip } from '../tooltip/BaseTooltip.js';

// Add tooltip delay constant
const TOOLTIP_DELAY = 500; // 500ms delay before showing tooltip

export class PassivesContainer {
    constructor(hotbarUI) {
        this.hotbarUI = hotbarUI;
        this.element = null;
        this.lastKnownActorId = null;
        // This set will hold the UUIDs of features to be displayed
        this.selectedPassives = new Set();
        this._createContainer();
        // Load saved selections (or default to all available passives)
        this.loadSelectedPassives();
    }

    _createContainer() {
        this.element = document.createElement("div");
        this.element.classList.add("passives-container");
        // Show tooltip on hover
        this.element.title = "Right-click to configure passive features";
        // Right-click opens configuration dialog
        this.element.addEventListener("contextmenu", this._showPassivesDialog.bind(this));
    }

    _createFeatureIcon(feature) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("bg3-hud", "passive-feature-icon");
        // Store feature reference for later use if needed
        wrapper.dataset.uuid = feature.uuid;
        const img = document.createElement("img");
        img.src = feature.img;

        // Clicking the icon uses the feature if defined
        wrapper.addEventListener("click", async () => {
            if (feature.use) await feature.use();
        });
        
        // Attach a tooltip if needed
        wrapper.addEventListener("mouseenter", (evt) => {
            // Check for existing pinned tooltip first - do this immediately
            const existingTooltip = BaseTooltip.getPinnedTooltip(feature);
            if (existingTooltip) {
                existingTooltip.highlight(true);
                wrapper._hotbarTooltip = existingTooltip;
                return;
            }

            // For new tooltips, use the delay
            this._tooltipEventData = evt;
            this._tooltipTimeout = setTimeout(async () => {
                // Only create tooltip if we're still hovering and not dragging
                if (this._tooltipEventData && !document.body.classList.contains('dragging-active')) {
                    const tooltip = await TooltipFactory.create(feature);
                    if (tooltip) {
                        tooltip.attach(wrapper, evt);
                        wrapper._hotbarTooltip = tooltip;
                    }
                    this._tooltipEventData = null;
                }
            }, TOOLTIP_DELAY);
        });
        
        wrapper.addEventListener("mouseleave", () => {
            // Clear the timeout if it exists
            if (this._tooltipTimeout) {
                clearTimeout(this._tooltipTimeout);
                this._tooltipTimeout = null;
            }
            // Clear the event data
            this._tooltipEventData = null;
            // Handle tooltip
            if (wrapper._hotbarTooltip) {
                if (wrapper._hotbarTooltip._pinned) {
                    wrapper._hotbarTooltip.highlight(false);
                } else {
                    wrapper._hotbarTooltip.remove();
                }
                wrapper._hotbarTooltip = null;
            }
        });
        
        wrapper.appendChild(img);
        return wrapper;
    }

    // Loads the saved flag; if none, default to all available passive features.
    async loadSelectedPassives() {
        let actor = null;

        // Try to get the actor from lastKnownActorId
        if (this.lastKnownActorId) {
            actor = game.actors.get(this.lastKnownActorId);
        }

        // If not, then get it from the current token
        if (!actor) {
            const token = canvas.tokens.get(this.hotbarUI.manager.currentTokenId);
            if (token?.actor) {
                actor = game.actors.get(token.actor.id);
                this.lastKnownActorId = actor.id;
            }
        }

        if (!actor) return;
        
        // Get all available passive features from the actor
        const availablePassives = actor.items
            .filter(item => item.type === "feat" && (!item.system.activation?.type || item.system.activation.type === "passive"))
            .map(item => item.uuid);
        
        // Try to get saved configuration
        const saved = actor.getFlag(CONFIG.MODULE_NAME, "selectedPassives");
        
        if (saved && Array.isArray(saved)) {
            this.selectedPassives = new Set(saved);
        } else {
            // Default: show all features
            this.selectedPassives = new Set(availablePassives);
            // Save default selection for future loads
            await actor.setFlag(CONFIG.MODULE_NAME, "selectedPassives", availablePassives);
        }
        
        this._updatePassiveDisplay();
    }

    // Saves the current selectedPassives to the actor flag
    async saveSelectedPassives() {
        const token = canvas.tokens.get(this.hotbarUI.manager.currentTokenId);
        if (!token?.actor) return;
        await token.actor.setFlag(CONFIG.MODULE_NAME, "selectedPassives", Array.from(this.selectedPassives));
    }

    // Update the container display: show icons for passives that are selected
    _updatePassiveDisplay() {
        let actor = null;

        // Try to get the actor from lastKnownActorId
        if (this.lastKnownActorId) {
            actor = game.actors.get(this.lastKnownActorId);
        }

        // If not, then get it from the current token
        if (!actor) {
            const token = canvas.tokens.get(this.hotbarUI.manager.currentTokenId);
            if (token?.actor) {
                actor = game.actors.get(token.actor.id);
                this.lastKnownActorId = actor.id;
            }
        }

        if (!actor) {
            this.element.style.display = 'none';
            return;
        }
        
        // Get all available passive features from the actor
        const availablePassives = actor.items.filter(item => 
            item.type === "feat" && (!item.system.activation?.type || item.system.activation.type === "passive")
        );

        // If there are no passives at all, hide the container completely
        if (availablePassives.length === 0) {
            this.element.style.display = 'none';
            return;
        }

        // Clear current icons
        this.element.innerHTML = "";
        
        // Filter actor items to only include those passives marked as selected
        const featuresToShow = availablePassives.filter(item => this.selectedPassives.has(item.uuid));
        
        // If no passives are selected to show, display minimal container
        if (featuresToShow.length === 0) {
            this.element.style.display = 'flex';
            return;
        }

        // Show container normally with selected passives
        this.element.style.display = 'flex';
        
        featuresToShow.forEach(feature => {
            const iconEl = this._createFeatureIcon(feature);
            this.element.appendChild(iconEl);
        });
    }

    // Show dialog to configure passives
    async _showPassivesDialog(event) {
        event.preventDefault();
        
        let actor = null;

        // Try to get the actor from lastKnownActorId
        if (this.lastKnownActorId) {
            actor = game.actors.get(this.lastKnownActorId);
        }

        // If not, then get it from the current token
        if (!actor) {
            const token = canvas.tokens.get(this.hotbarUI.manager.currentTokenId);
            if (token?.actor) {
                actor = game.actors.get(token.actor.id);
                this.lastKnownActorId = actor.id;
            }
        }

        if (!actor) return;
        
        // Get all available passive features from the actor
        const availableFeatures = actor.items
            .filter(item => item.type === "feat" && (!item.system.activation?.type || item.system.activation.type === "passive"))
            .map(item => ({
                uuid: item.uuid,
                name: item.name,
                img: item.img,
                selected: this.selectedPassives.has(item.uuid)
            }));

        // Create and show dialog using the template
        const dialog = new Dialog({
            title: "Configure Passive Features",
            content: await renderTemplate("modules/bg3-inspired-hotbar/templates/passives-dialog.html", {
                features: availableFeatures
            }),
            buttons: {
                save: {
                    icon: '<i class="fas fa-save"></i>',
                    label: "Save",
                    callback: async (html) => {
                        // Use jQuery to query within the dialog's content container
                        const $dialogContent = $(html);
                        // Find all checkboxes and build a new set based on their checked state
                        const newSelection = new Set();
                        $dialogContent.find("input.passives-checkbox").each(function() {
                            if ($(this).is(":checked")) {
                                newSelection.add($(this).val());
                            }
                        });
                        // Update our selection and persist it
                        this.selectedPassives = newSelection;
                        await this.saveSelectedPassives();
                        this._updatePassiveDisplay();
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel"
                }
            },
            default: "save"
        }, {
            classes: ["configure-passives"],
            resizable: false
        });
        
        dialog.render(true);

        // Add click handlers after dialog is rendered
        setTimeout(() => {
            const $rows = $('.passives-row');
            
            // Click handlers for rows
            $rows.on('click', function(e) {
                if (!$(e.target).is('input')) {
                    const checkbox = $(this).find('input[type="checkbox"]');
                    checkbox.prop('checked', !checkbox.prop('checked'));
                }
            });
        }, 100);
    }

    // Clean up container when needed
    destroy() {
        if (this.element?.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.hotbarUI = null;
    }

    // Update method for HotbarUI to call
    async update() {
        await this.loadSelectedPassives();
    }
} 