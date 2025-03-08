import { CONFIG } from '../utils/config.js';
import { fromUuid } from '../utils/foundryUtils.js';

export class FilterContainer {
    constructor(hotbarUI) {
        this.hotbarUI = hotbarUI;
        this.element = null;
        this.isVisible = true;
        this.selectedActionType = null;
        this.selectedSpellLevel = { level: null, isPact: false };
        this.featuresEnabled = false;
        this.lastKnownActorId = null;
        this._createContainer();
        this._setupHotbarListeners();
    }

    _setupHotbarListeners() {
        this.hotbarUI.element.addEventListener("mouseenter", () => {
            if (this.isVisible) {
                this.element.style.opacity = "1";
            }
        });

        this.hotbarUI.element.addEventListener("mouseleave", (event) => {
            if (!this.element.contains(event.relatedTarget)) {
                this.element.style.opacity = "0";
            }
        });
    }

    _createContainer() {
        this.element = document.createElement("div");
        this.element.classList.add("filter-container");
        
        this.contentWrapper = document.createElement("div");
        this.contentWrapper.classList.add("filter-content");

        this.element.addEventListener("mouseenter", () => {
            if (this.isVisible) {
                this.element.style.opacity = "1";
            }
        });

        this.element.addEventListener("mouseleave", () => {
            if (!this.hotbarUI.element.matches(":hover")) {
                this.element.style.opacity = "0";
            }
        });

        this.element.appendChild(this.contentWrapper);
        this.render();
    }

    _createActionTypeButton(type, symbol) {
        const button = document.createElement("div");
        button.classList.add("action-type-button");
        
        let color;
        switch (type) {
            case "action":
                color = CONFIG.COLORS.ACTION;
                break;
            case "bonus":
                color = CONFIG.COLORS.BONUS;
                break;
            case "reaction":
                color = CONFIG.COLORS.REACTION;
                break;
            default:
                color = CONFIG.COLORS.DEFAULT;
        }

        button.style.color = color;
        button.style.borderColor = this.selectedActionType === type ? color : "transparent";
        button.innerHTML = symbol;

        button.addEventListener("mouseenter", () => {
            if (this.selectedActionType !== type) {
                button.style.background = CONFIG.COLORS.BACKGROUND_HIGHLIGHT;
            }
        });

        button.addEventListener("mouseleave", () => {
            if (this.selectedActionType !== type) {
                button.style.background = "transparent";
            }
        });

        button.addEventListener("click", () => {
            if (this.selectedActionType === type) {
                this.selectedActionType = null;
                button.style.borderColor = "transparent";
            } else {
                this._clearAllFilters();
                
                this.selectedActionType = type;
                button.style.borderColor = color;
            }
            
            this._updateActionTypeHighlights();
        });

        return button;
    }

    _createSpellLevelButton(level, spellLevel, isPact = false) {
        const button = document.createElement("div");
        button.classList.add("spell-level-button");
        button.dataset.level = level;
        button.dataset.isPact = isPact;
        
        const color = isPact ? CONFIG.COLORS.PACT_MAGIC : CONFIG.COLORS.SPELL_SLOT;
        
        const wrapper = document.createElement("div");
        wrapper.classList.add("spell-level-wrapper");

        button.style.color = color;
        button.style.borderColor = (this.selectedSpellLevel.level === level && this.selectedSpellLevel.isPact === isPact) 
            ? color 
            : "transparent";

        const rows = Math.ceil(spellLevel.max / 2);
        const boxSize = Math.min(11, Math.floor((28 - (rows - 1) * 2) / rows));

        for (let row = 0; row < rows; row++) {
            const rowDiv = document.createElement("div");
            rowDiv.classList.add("spell-slot-row");

            for (let col = 0; col < 2; col++) {
                const slotIndex = row * 2 + col;
                if (slotIndex < spellLevel.max) {
                    const slotBox = document.createElement("div");
                    slotBox.classList.add("spell-slot-box");
                    const isUsed = slotIndex >= spellLevel.value;
                    
                    Object.assign(slotBox.style, {
                        width: `${boxSize}px`,
                        height: `${boxSize}px`,
                        background: isUsed ? "transparent" : "currentColor",
                        borderColor: "currentColor"
                    });
                    
                    rowDiv.appendChild(slotBox);
                }
            }
            button.appendChild(rowDiv);
        }

        const levelLabel = document.createElement("div");
        levelLabel.classList.add("spell-level-label");
        levelLabel.textContent = isPact ? "P" : this._getRomanNumeral(level);
        levelLabel.style.color = color;

        button.addEventListener("mouseenter", () => {
            if (this.selectedSpellLevel.level !== level || this.selectedSpellLevel.isPact !== isPact) {
                button.style.background = CONFIG.COLORS.BACKGROUND_HIGHLIGHT;
            }
        });

        button.addEventListener("mouseleave", () => {
            if (this.selectedSpellLevel.level !== level || this.selectedSpellLevel.isPact !== isPact) {
                button.style.background = "transparent";
            }
        });

        button.addEventListener("click", () => {
            if (this.selectedSpellLevel.level === level && this.selectedSpellLevel.isPact === isPact) {
                this.selectedSpellLevel = { level: null, isPact: false };
                button.style.borderColor = "transparent";
            } else {
                this._clearAllFilters();
                
                this.selectedSpellLevel = { level, isPact };
                button.style.borderColor = color;
            }
            
            this._updateSpellLevelHighlights();
        });

        wrapper.appendChild(button);
        wrapper.appendChild(levelLabel);
        return wrapper;
    }

    _createFeatureButton() {
        const button = document.createElement("div");
        button.classList.add("feature-button");
        
        const color = CONFIG.COLORS.FEATURE_HIGHLIGHT;

        button.style.color = color;
        button.style.borderColor = this.featuresEnabled ? color : "transparent";
        button.innerHTML = '<i class="fas fa-star"></i>';

        button.addEventListener("mouseenter", () => {
            if (!this.featuresEnabled) {
                button.style.background = CONFIG.COLORS.BACKGROUND_HIGHLIGHT;
            }
        });

        button.addEventListener("mouseleave", () => {
            if (!this.featuresEnabled) {
                button.style.background = "transparent";
            }
        });

        button.addEventListener("click", () => {
            if (this.featuresEnabled) {
                this.featuresEnabled = false;
                button.style.borderColor = "transparent";
            } else {
                this._clearAllFilters();
                
                this.featuresEnabled = true;
                button.style.borderColor = color;
            }
            
            this._updateFeatureHighlights();
        });

        return button;
    }

    _getRomanNumeral(num) {
        const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
        return romanNumerals[num - 1] || num.toString();
    }

    async _updateActionTypeHighlights() {
        const highlightStyle = game.settings.get('bg3-inspired-hotbar', 'highlightStyle');
        
        this.hotbarUI.gridContainers.forEach((container) => {
            container.element.querySelectorAll(".hotbar-cell").forEach(async (cell) => {
                cell.style.boxShadow = 'none';
                cell.style.borderColor = CONFIG.COLORS.BORDER;
                cell.style.borderWidth = '2px';
                cell.style.borderBottom = `2px solid ${CONFIG.COLORS.BORDER}`;
                
                const slotKey = cell.dataset.slot;
                const item = container.data.items[slotKey];
                
                if (item) {
                    try {
                        const itemData = await fromUuid(item.uuid);
                        if (!itemData) return;

                        const activation = itemData.system?.activation?.type?.toLowerCase();
                        
                        if (this.selectedActionType) {
                            let color = null;
                            
                            if (this.selectedActionType === "action" && activation === "action") {
                                color = CONFIG.COLORS.ACTION;
                            } else if (this.selectedActionType === "bonus" && activation === "bonus") {
                                color = CONFIG.COLORS.BONUS;
                            } else if (this.selectedActionType === "reaction" && activation === "reaction") {
                                color = CONFIG.COLORS.REACTION;
                            }

                            if (color) {
                                switch (highlightStyle) {
                                    case 'bottom':
                                        cell.style.borderBottom = `2px solid ${color}`;
                                        break;
                                    case 'border':
                                        cell.style.borderColor = color;
                                        break;
                                }
                            }
                        }
                    } catch (error) {
                        console.error("Error updating action highlights:", error);
                    }
                }
            });
        });
    }

    async _updateSpellLevelHighlights() {
        const highlightStyle = game.settings.get('bg3-inspired-hotbar', 'highlightStyle');
        
        this.hotbarUI.gridContainers.forEach((container) => {
            container.element.querySelectorAll(".hotbar-cell").forEach(async (cell) => {
                cell.style.boxShadow = 'none';
                cell.style.borderColor = CONFIG.COLORS.BORDER;
                cell.style.borderWidth = '2px';
                cell.style.borderBottom = `2px solid ${CONFIG.COLORS.BORDER}`;
                
                const slotKey = cell.dataset.slot;
                const item = container.data.items[slotKey];
                
                if (item && this.selectedSpellLevel.level !== null) {
                    try {
                        const itemData = await fromUuid(item.uuid);
                        if (!itemData || itemData.type !== "spell") return;

                        const spellLevel = itemData.system.level;
                        const isPactSpell = itemData.system.preparation?.mode === "pact";
                        
                        if (spellLevel === this.selectedSpellLevel.level && this.selectedSpellLevel.isPact === isPactSpell) {
                            const color = this.selectedSpellLevel.isPact ? CONFIG.COLORS.PACT_MAGIC : CONFIG.COLORS.SPELL_SLOT;
                            switch (highlightStyle) {
                                case 'bottom':
                                    cell.style.borderBottom = `2px solid ${color}`;
                                    break;
                                case 'border':
                                    cell.style.borderColor = color;
                                    break;
                            }
                        }
                    } catch (error) {
                        console.error("Error updating spell level highlights:", error);
                    }
                }
            });
        });
    }

    async _updateFeatureHighlights() {
        const highlightStyle = game.settings.get('bg3-inspired-hotbar', 'highlightStyle');
        
        this.hotbarUI.gridContainers.forEach((container) => {
            container.element.querySelectorAll(".hotbar-cell").forEach(async (cell) => {
                cell.style.boxShadow = 'none';
                cell.style.borderColor = CONFIG.COLORS.BORDER;
                cell.style.borderWidth = '2px';
                cell.style.borderBottom = `2px solid ${CONFIG.COLORS.BORDER}`;
                
                const slotKey = cell.dataset.slot;
                const item = container.data.items[slotKey];
                
                if (item && this.featuresEnabled) {
                    try {
                        const itemData = await fromUuid(item.uuid);
                        if (!itemData || itemData.type !== "feat") return;

                        const featureType = itemData.system.type?.value || 'default';
                        const color = CONFIG.COLORS.FEATURES[featureType] || CONFIG.COLORS.FEATURES.default;

                        switch (highlightStyle) {
                            case 'bottom':
                                cell.style.borderBottom = `2px solid ${color}`;
                                break;
                            case 'border':
                                cell.style.borderColor = color;
                                break;
                        }
                    } catch (error) {
                        console.error("Error updating feature highlights:", error);
                    }
                }
            });
        });
    }

    _clearAllFilters() {
        this.selectedActionType = null;
        this.element.querySelectorAll(".action-type-button").forEach(btn => {
            const color = btn.style.color;
            btn.style.borderColor = "transparent";
            btn.style.background = "transparent";
        });

        this.selectedSpellLevel = { level: null, isPact: false };
        this.element.querySelectorAll(".spell-level-button").forEach(btn => {
            const btnColor = btn.dataset.isPact === "true" ? CONFIG.COLORS.PACT_MAGIC : CONFIG.COLORS.SPELL_SLOT;
            btn.style.borderColor = "transparent";
            btn.style.background = "transparent";
        });

        this.featuresEnabled = false;
        const featureButton = this.element.querySelector(".feature-button");
        if (featureButton) {
            featureButton.style.borderColor = "transparent";
            featureButton.style.background = "transparent";
        }

        this._updateActionTypeHighlights();
        this._updateSpellLevelHighlights();
        this._updateFeatureHighlights();
    }

    render() {
        while (this.contentWrapper.firstChild) {
            this.contentWrapper.removeChild(this.contentWrapper.firstChild);
        }

        const actionContainer = document.createElement("div");
        actionContainer.classList.add("action-container");

        const actionButton = this._createActionTypeButton("action", '<i class="fas fa-circle"></i>');
        const bonusButton = this._createActionTypeButton("bonus", '<i class="fas fa-triangle"></i>');
        const reactionButton = this._createActionTypeButton("reaction", '<i class="fas fa-diamond"></i>');
        const featureButton = this._createFeatureButton();

        actionContainer.appendChild(actionButton);
        actionContainer.appendChild(bonusButton);
        actionContainer.appendChild(reactionButton);
        actionContainer.appendChild(featureButton);

        const spellContainer = document.createElement("div");
        spellContainer.classList.add("spell-container");

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

        if (actor) {
            // Add pact magic first if it exists
            const pactMagic = actor.system.spells?.pact;
            if (pactMagic?.max > 0) {
                const pactButton = this._createSpellLevelButton(pactMagic.level, pactMagic, true);
                spellContainer.appendChild(pactButton);
            }

            // Then add regular spell levels
            for (let level = 1; level <= 9; level++) {
                const spellLevelKey = `spell${level}`;
                const spellLevel = actor.system.spells?.[spellLevelKey];
                
                if (spellLevel?.max > 0) {
                    const levelButton = this._createSpellLevelButton(level, spellLevel);
                    spellContainer.appendChild(levelButton);
                }
            }
        }

        if (spellContainer.children.length > 0) {
            this.contentWrapper.appendChild(actionContainer);
            this.contentWrapper.appendChild(spellContainer);
        } else {
            this.contentWrapper.appendChild(actionContainer);
        }

        this.element.style.display = this.isVisible ? "flex" : "none";
    }

    toggle() {
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
            this.render();
            this.element.style.display = "flex";
            this.element.style.opacity = this.hotbarUI.element.matches(":hover") ? "1" : "0";
        } else {
            this.element.style.display = "none";
            this.element.style.opacity = "0";
            this._clearAllFilters();
        }
    }

    destroy() {
        if (this.hotbarUI?.element) {
            this.hotbarUI.element.removeEventListener("mouseenter", this._setupHotbarListeners);
            this.hotbarUI.element.removeEventListener("mouseleave", this._setupHotbarListeners);
        }
        
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        this.hotbarUI = null;
        this.element = null;
        this.lastKnownActorId = null;
    }
} 