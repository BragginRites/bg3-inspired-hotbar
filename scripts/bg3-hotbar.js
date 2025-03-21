// BG3 Inspired Hotbar Module - Main Entry Point

import { HotbarManager } from './managers/HotbarManager.js';
import { HotbarUI } from './components/HotbarUI.js';
import { CONFIG } from './utils/config.js';
import { ControlsManager } from './managers/ControlsManager.js';
import { AutoPopulateCreateToken, AutoPopulateDefaults } from './features/AutoPopulateCreateToken.js';
import { AutoPopulateContainer } from './features/AutoPopulateContainer.js';
import { TooltipFactory } from './tooltip/TooltipFactory.js';

export class BG3Hotbar {
    static manager = null;
    static controlsManager = null;

    static async init() {
        // Apply custom theme
        this._applyTheme();

        // Ensure we clean up any existing manager/UI
        if (this.manager?.ui) {
            this.manager.ui.destroy();
            this.manager.ui = null;
        }
        
        // Initialize the controls manager
        this.controlsManager = new ControlsManager();
        
        // Initialize the hotbar manager
        this.manager = new HotbarManager();
        
        // Register hooks
        this._registerHooks();
        
        // Apply macrobar collapse setting immediately if it's enabled
        this._applyMacrobarCollapseSetting();

        // Register scene controls
        this._registerSceneControls();

        // Log initialization
        console.log(`${CONFIG.MODULE_NAME} | Initialized`);

        // If a token is already selected, deselect it and let the hooks handle reselection
        const controlled = canvas.tokens?.controlled[0];
        if (controlled) {
            controlled.release(); // This will trigger our controlToken hook properly
        }
    }

    static _applyTheme() {
      const theme = game.settings.get(CONFIG.MODULE_NAME, 'themeOption');
      if(theme !== 'default') {
        const themeConfig = CONFIG.THEME[theme];
        if(themeConfig) {
            const style = document.createElement('style');
            style.setAttribute('type', 'text/css');
            style.setAttribute('custom-theme', theme)
            style.textContent = Object.entries(themeConfig).map(([k, v]) => `${k} {\n${Object.entries(v).map(([k2, v2]) => `${k2}:${v2};`).join('\n')}\n}`).join('\n');
            document.head.appendChild(style);
        }
      } else if(document.head.querySelector('[custom-theme]')) {
        const currentTheme = document.head.querySelector('[custom-theme]');
        currentTheme.parentNode.removeChild(currentTheme);
      }
      console.log()
    }
    
    static _applyMacrobarCollapseSetting() {
        // We need to wait for the UI to be ready before collapsing the hotbar
        if (!ui.hotbar) {
            // UI not ready, deferring macrobar collapse
            Hooks.once('renderHotbar', () => this._applyMacrobarCollapseSetting());
            return;
        }
        
        const collapseMacrobar = game.settings.get(CONFIG.MODULE_NAME, 'collapseFoundryMacrobar');
        // Applying macrobar collapse setting only on initial page load
        if (collapseMacrobar) {
            ui.hotbar.collapse();
        }
    }

    static _registerSceneControls() {
        Hooks.on('getSceneControlButtons', (controls) => {
            const tokenTools = controls.find(c => c.name === "token");
            if (!tokenTools) return;

            const isActive = game.settings.get(CONFIG.MODULE_NAME, 'uiEnabled');
            
            tokenTools.tools.push({
                name: "toggleBG3UI",
                title: "Toggle BG3 Hotbar",
                icon: "fas fa-gamepad",
                toggle: true,
                active: isActive,
                onClick: () => this._toggleUI()
            });
        });
    }

    static async _toggleUI() {
        const currentState = game.settings.get(CONFIG.MODULE_NAME, 'uiEnabled');
        await game.settings.set(CONFIG.MODULE_NAME, 'uiEnabled', !currentState);
        
        // Update scene controls button state
        const tokenTools = ui.controls.controls.find(c => c.name === "token");
        const toggleButton = tokenTools?.tools.find(t => t.name === "toggleBG3UI");
        if (toggleButton) {
            toggleButton.active = !currentState;
            ui.controls.render();
        }
        
        // Handle UI state
        if (!currentState) {
            // Enabling UI
            if (!this.manager) {
                await this.init();
            } else if (this.manager && !this.manager.ui) {
                const controlled = canvas.tokens?.controlled[0];
                
                // Check if we have a controlled token
                if (controlled) {
                    await this.manager.updateHotbarForControlledToken(true);
                } else {
                    // No token selected, but check if deselect lock is enabled
                    const isDeselectLocked = this.controlsManager.isLockSettingEnabled('deselect') && 
                                            this.controlsManager.isMasterLockEnabled();
                    
                    // If deselect lock is enabled and we have a currentTokenId, try to restore UI
                    if (isDeselectLocked && this.manager.currentTokenId) {
                        // Force create the UI even with no token selected
                        this.manager.ui = new HotbarUI(this.manager);
                        console.log(`${CONFIG.MODULE_NAME} | Restored UI with deselect lock enabled`);
                    }
                }
            }
        } else {
            // Disabling UI
            if (this.manager?.ui) {
                this.manager.ui.destroy();
                this.manager.ui = null;
            }
        }
    }

    static _registerSettings() {
        // UI Toggle Setting (hidden from settings menu)
        game.settings.register(CONFIG.MODULE_NAME, 'uiEnabled', {
            name: "UI Enabled",
            scope: 'client',
            config: false,
            type: Boolean,
            default: true
        });

        // Register keybinding for toggling UI
        game.keybindings.register(CONFIG.MODULE_NAME, "toggleUI", {
            name: "Toggle BG3 Hotbar",
            hint: "Toggles the BG3 Inspired Hotbar UI visibility",
            editable: [{ key: "KeyH" }],
            onDown: () => {
                this._toggleUI();
            },
            restricted: false,
            precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
        });

        // Core UI Settings
        game.settings.register(CONFIG.MODULE_NAME, 'collapseFoundryMacrobar', {
            name: 'BG3.Settings.CollapseFoundryMacrobar.Name',
            hint: 'BG3.Settings.CollapseFoundryMacrobar.Hint',
            scope: 'world',
            config: true,
            type: Boolean,
            default: false,
            onChange: value => {
                // Handle the macrobar state when the setting changes
                // Macrobar collapse setting changed
                if (value) {
                    ui.hotbar.collapse();
                } else {
                    ui.hotbar.expand();
                }
            }
        });

        // Visual Settings - Appearance
        game.settings.register(CONFIG.MODULE_NAME, 'themeOption', {
            name: 'Theme options',
            hint: 'Choose between available themes',
            scope: 'client',
            config: true,
            type: String,
            choices: {
                'default': 'Default',
                'gold': 'Gold',
                'custom': 'Custom (Coming soon !)'
            },
            default: 'default',
            onChange: value => {
                if(value == 'custom') game.settings.set(CONFIG.MODULE_NAME, 'themeOption', 'default');
                this._applyTheme()
            }
        });
        
        game.settings.register(CONFIG.MODULE_NAME, 'autoScale', {
            name: 'Auto UI scale',
            hint: 'Auto scale the UI based on your browser. Disable the UI scale parameter below.',
            scope: 'client',
            config: true,
            type: Boolean,
            default: true,
            onChange: () => {
                if(this.manager?.ui) {
                    this.manager.ui.updateUIScale();
                }
            }
        });

        game.settings.register(CONFIG.MODULE_NAME, 'uiScale', {
            name: 'UI Scale',
            hint: 'Change the UI  (50% to 300%) according to your preferences and settings.',
            scope: 'client',
            config: true,
            type: Number,
            range: {
                min: 50,
                max: 300,
                step: 5
            },
            default: 100,
            onChange: () => {
                if(this.manager?.ui) {
                    this.manager.ui.updateUIScale();
                }
            }
        });

        /* game.settings.register(CONFIG.MODULE_NAME, 'uiPosition', {
            name: 'UI Position',
            hint: 'Choose where the hotbar should be placed.',
            scope: 'client',
            config: true,
            type: String,
            choices: {
                'center': 'Center',
                'left': 'Left',
                'right': 'Right'
            },
            default: 'center',
            onChange: value => {
                if (this.manager?.ui) {
                    this.manager.ui.element.dataset.position = value;
                }
            }
        });

        game.settings.register(CONFIG.MODULE_NAME, "posPadding", {
            name: 'Position padding',
            hint: 'Distance from the side of the screen for Left/Right position.',
            scope: "client",
            config: true,
            type: Number,
            default: 0,
            onChange: value => {
                if(this.manager?.ui) {
                    this.manager.ui.element.setProperty('--position-padding', `${value}px`);
                }
            },
        }); */

        game.settings.register(CONFIG.MODULE_NAME, 'showItemNames', {
            name: 'Show Item Names',
            hint: 'Display item names below each hotbar item',
            scope: 'client',
            config: true,
            type: Boolean,
            default: false,
            onChange: () => {
                if (this.manager?.ui) {
                    this.manager.ui.render();
                }
            }
        });

        game.settings.register(CONFIG.MODULE_NAME, 'showItemUses', {
            name: 'Show Item Uses',
            hint: 'Display remaining uses in the top-right corner of items',
            scope: 'client',
            config: true,
            type: Boolean,
            default: true,
            onChange: () => {
                if (this.manager?.ui) {
                    this.manager.ui.render();
                }
            }
        });

        game.settings.register('bg3-inspired-hotbar', 'highlightStyle', {
            name: game.i18n.localize('BG3.Settings.HighlightStyle.Name'),
            hint: game.i18n.localize('BG3.Settings.HighlightStyle.Hint'),
            scope: 'client',
            config: true,
            type: String,
            choices: {
                'bottom': game.i18n.localize('BG3.Settings.HighlightStyle.Bottom'),
                'border': game.i18n.localize('BG3.Settings.HighlightStyle.Border')
            },
            default: 'border'
        });

        // Visual Settings - Opacity and Fading
        game.settings.register(CONFIG.MODULE_NAME, 'normalOpacity', {
            name: 'BG3.Settings.NormalOpacity.Name',
            hint: 'BG3.Settings.NormalOpacity.Hint',
            scope: 'client',
            config: true,
            type: Number,
            range: {
                min: 0.1,
                max: 1.0,
                step: 0.1
            },
            default: 1.0,
            onChange: value => {
                if (this.manager?.ui) {
                    this.manager.ui.updateOpacity();
                }
            }
        });

        game.settings.register(CONFIG.MODULE_NAME, 'fadedOpacity', {
            name: 'BG3.Settings.FadedOpacity.Name',
            hint: 'BG3.Settings.FadedOpacity.Hint',
            scope: 'client',
            config: true,
            type: Number,
            range: {
                min: 0.0,
                max: 1,
                step: 0.1
            },
            default: 1,
            onChange: value => {
                if (this.manager?.ui) {
                    this.manager.ui.updateOpacity();
                }
            }
        });

        game.settings.register(CONFIG.MODULE_NAME, 'fadeOutDelay', {
            name: 'BG3.Settings.FadeOutDelay.Name',
            hint: 'BG3.Settings.FadeOutDelay.Hint',
            scope: 'client',
            config: true,
            type: Number,
            range: {
                min: 1,
                max: 30,
                step: 1
            },
            default: 5,
            onChange: value => {
                // Update the UI fade delay when the setting changes
                if (this.manager?.ui) {
                    this.manager.ui.updateFadeDelay();
                }
            }
        });

        // Portrait Settings
        game.settings.register(CONFIG.MODULE_NAME, 'defaultPortraitPreferences', {
            name: 'BG3.Settings.DefaultPortraitPreferences.Name',
            hint: 'BG3.Settings.DefaultPortraitPreferences.Hint',
            scope: 'client',
            config: true,
            type: String,
            choices: {
                'token': 'BG3.Settings.DefaultPortraitPreferences.Token',
                'portrait': 'BG3.Settings.DefaultPortraitPreferences.Portrait'
            },
            default: 'token',
            onChange: () => {
                // Refresh UI if it exists
                if (this.manager?.ui?.portraitCard) {
                    this.manager.ui.portraitCard.loadImagePreference();
                }
            }
        });

        // Tooltip Settings
        game.settings.register(CONFIG.MODULE_NAME, 'tooltipDelay', {
            name: 'BG3.Settings.TooltipDelay.Name',
            hint: 'BG3.Settings.TooltipDelay.Hint',
            scope: 'client',
            config: true,
            type: Number,
            range: {
                min: 0,
                max: 2000,
                step: 100
            },
            default: 500,
            onChange: value => {
                // Update the tooltip delay in the config
                CONFIG.TOOLTIP_DELAY = value;
                // Tooltip delay changed
            }
        });

        game.settings.register(CONFIG.MODULE_NAME, 'showMaterialDescription', {
            name: 'BG3.Settings.ShowMaterialDescription.Name',
            hint: 'BG3.Settings.ShowMaterialDescription.Hint',
            scope: 'client',
            config: true,
            type: Boolean,
            default: false,
            onChange: () => {
                // Force refresh of any open tooltips
                if (this.manager?.ui) {
                    this.manager.ui.render();
                }
            }
        });

        game.settings.register(CONFIG.MODULE_NAME, 'showDamageRanges', {
            name: 'BG3.Settings.ShowDamageRanges.Name',
            hint: 'BG3.Settings.ShowDamageRanges.Hint',
            scope: 'client',
            config: true,
            type: Boolean,
            default: false,
            onChange: () => {
                if (this.manager?.ui) {
                    this.manager.ui.render();
                }
            }
        });

        // Spell Preparation Settings
        game.settings.register(CONFIG.MODULE_NAME, 'enforceSpellPreparationPC', {
            name: 'BG3.Settings.EnforceSpellPreparationPC.Name',
            hint: 'BG3.Settings.EnforceSpellPreparationPC.Hint',
            scope: 'client',
            config: true,
            type: Boolean,
            default: true,
            onChange: () => {
                if (this.manager?.ui) {
                    this.manager.ui.render();
                }
            }
        });

        game.settings.register(CONFIG.MODULE_NAME, 'enforceSpellPreparationNPC', {
            name: 'BG3.Settings.EnforceSpellPreparationNPC.Name',
            hint: 'BG3.Settings.EnforceSpellPreparationNPC.Hint',
            scope: 'client',
            config: true,
            type: Boolean,
            default: false,
            onChange: () => {
                if (this.manager?.ui) {
                    this.manager.ui.render();
                }
            }
        });

        // Auto-Population Settings
        game.settings.register(CONFIG.MODULE_NAME, 'autoPopulateUnlinkedTokens', {
            name: 'BG3.Settings.AutoPopulateUnlinkedTokens.Name',
            hint: 'BG3.Settings.AutoPopulateUnlinkedTokens.Hint',
            scope: 'world',
            config: true,
            type: Boolean,
            default: true
        });

        game.settings.register(CONFIG.MODULE_NAME, 'container1AutoPopulate', {
            name: 'BG3.Settings.Container1AutoPopulate.Name',
            hint: 'BG3.Settings.Container1AutoPopulate.Hint',
            scope: 'world',
            config: false,
            type: Array,
            default: ["weapon", "feat"],
        });

        game.settings.register(CONFIG.MODULE_NAME, 'container2AutoPopulate', {
            name: 'BG3.Settings.Container2AutoPopulate.Name',
            hint: 'BG3.Settings.Container2AutoPopulate.Hint',
            scope: 'world',
            config: false,
            type: Array,
            default: ["spell"],
        });

        game.settings.register(CONFIG.MODULE_NAME, 'container3AutoPopulate', {
            name: 'BG3.Settings.Container3AutoPopulate.Name',
            hint: 'BG3.Settings.Container3AutoPopulate.Hint',
            scope: 'world',
            config: false,
            type: Array,
            default: ["consumable"],
        });

        // Register the chip selector menu item
        game.settings.registerMenu(CONFIG.MODULE_NAME, 'containerAutoPopulateSettings', {
            name: game.i18n.localize('BG3.Settings.ContainerAutoPopulate.Name'),
            label: game.i18n.localize('BG3.Settings.ContainerAutoPopulate.Configure'),
            icon: 'fas fa-tags',
            type: AutoPopulateDefaults,
            restricted: true
        });

        // Lock System Settings
        game.settings.register(CONFIG.MODULE_NAME, 'lockSettings', {
            name: 'BG3.Settings.LockSettings.Name',
            hint: 'BG3.Settings.LockSettings.Hint',
            scope: 'client',
            config: false,
            type: Object,
            default: {
                deselect: false,
                opacity: false,
                dragDrop: false
            }
        });
        
        game.settings.register(CONFIG.MODULE_NAME, 'masterLockEnabled', {
            name: 'Master Lock State',
            hint: 'Whether the master lock is enabled',
            scope: 'client',
            config: false,
            type: Boolean,
            default: false
        });

        // Storage Settings
        game.settings.register(CONFIG.MODULE_NAME, 'selectedPassivesByActor', {
            scope: 'client',
            config: false,
            type: Object,
            default: {}
        });
    }

    static _registerHooks() {
        // Canvas and token control hooks
        Hooks.on("canvasReady", async () => {
            if (this.manager) {
                // When canvas is ready, check for selected token
                const controlled = canvas.tokens?.controlled[0];
                if (controlled) {
                    await this.manager.updateHotbarForControlledToken(true);
                } else {
                    // Clean up UI if no token is selected
                    if (this.manager.ui) {
                        this.manager.ui.destroy();
                        this.manager.ui = null;
                    }
                }
            }
        });

        Hooks.on("controlToken", async (token, controlled) => {
            if (!this.manager) return;
            
            // Check if UI is enabled in settings
            const isUIEnabled = game.settings.get(CONFIG.MODULE_NAME, 'uiEnabled');
            if (!isUIEnabled) return;
            
            if (!controlled) {
                // Token was deselected, clean up UI if not locked
                const isDeselectLocked = this.controlsManager.isLockSettingEnabled('deselect') && 
                                        this.controlsManager.isMasterLockEnabled();
                if (this.manager.ui && !isDeselectLocked) {
                    this.manager.ui.destroy();
                    this.manager.ui = null;
                    this.manager.currentTokenId = null;
                }
                return;
            }
            
            // Token was selected, update or create UI
            if (!this.manager.ui) {
                // UI doesn't exist but should (UI is enabled and token selected)
                await this.manager.updateHotbarForControlledToken(true);
            } else {
                // UI exists, just update it
                await this.manager.updateHotbarForControlledToken();
            }
        });

        // Token creation hook for auto-populating unlinked tokens
        Hooks.on("createToken", async (token) => {
            if (!token?.actor || token.actorLink) return;
            
            // Check if auto-populate for unlinked tokens is enabled
            const shouldAutoPopulate = game.settings.get(CONFIG.MODULE_NAME, 'autoPopulateUnlinkedTokens');
            if (!shouldAutoPopulate) return;
            
            // Auto-populate the token's hotbar
            await AutoPopulateCreateToken.populateUnlinkedToken(token);
        });

        // Actor updates
        Hooks.on("updateActor", async (actor, changes, options, userId) => {
            if (!this.manager || game.user.id !== userId) return;
            
            // Check if this update affects our current token
            const token = canvas.tokens.get(this.manager.currentTokenId);
            if (!token || token.actor?.id !== actor.id) return;
            
            // Update UI components
            if (this.manager.ui) {
                // Update portrait card for any actor changes
                if (this.manager.ui.portraitCard) {
                    this.manager.ui.portraitCard.update(actor);
                }
                
                // Update filter container for spell slot changes
                if (changes.system?.spells && this.manager.ui.filterContainer) {
                    this.manager.ui.filterContainer.render();
                }
                
                // Update passives container if items changed
                if (changes.items && this.manager.ui.passivesContainer) {
                    await this.manager.ui.passivesContainer.update();
                }
                
                // Let ItemUpdateManager handle item changes
                if (changes.items || changes.system?.spells) {
                    await this.manager.itemManager.cleanupInvalidItems(actor);
                }
            }
        });

        // Item creation/deletion/updates are now handled by ItemUpdateManager
        
        // Token deletion
        Hooks.on("deleteToken", async (scene, tokenData) => {
            if (!this.manager) return;

            const token = canvas.tokens.get(tokenData._id);
            const isPlayerCharacter = token?.actor?.hasPlayerOwner;
            const isCurrentToken = tokenData._id === this.manager.currentTokenId;
            const isLocked = this.controlsManager.isLockSettingEnabled('deselect') && 
                            this.controlsManager.isMasterLockEnabled();

            // Only clean up data if:
            // 1. It's an unlinked token, OR
            // 2. It's the current token AND either:
            //    - It's not a player character, OR
            //    - It's not locked
            if (!token?.actorLink || (isCurrentToken && (!isPlayerCharacter || !isLocked))) {
                await this.manager.cleanupTokenData(tokenData._id);
            }

            // Handle UI cleanup based on token type and current status
            if (isCurrentToken) {
                // Only clear currentTokenId if it's not a locked player character
                if (!isPlayerCharacter || !isLocked) {
                    this.manager.currentTokenId = null;
                    
                    if (this.manager.ui) {
                        this.manager.ui.destroy();
                        this.manager.ui = null;
                    }
                    await this.manager.updateHotbarForControlledToken();
                }
            }
        });

        // Token updates
        Hooks.on("updateToken", async (token, changes, options, userId) => {
            if (!this.manager || game.user.id !== userId) return;
            
            // If this is our current token and actor-related data changed
            if (token.id === this.manager.currentTokenId && 
                (changes.actorId || changes.actorData || changes.actorLink)) {
                await this.manager.updateHotbarForControlledToken();
            }
        });

        // Scene deletion
        Hooks.on("deleteScene", async (scene) => {
            if (!this.manager) return;

            // Clean up data for unlinked tokens in the scene
            for (const tokenData of scene.tokens) {
                const token = canvas.tokens.get(tokenData._id);
                if (token && !token.actorLink) {
                    await this.manager.cleanupTokenData(tokenData._id);
                }
            }

            // If the current token was in this scene, update the UI
            const token = canvas.tokens.get(this.manager.currentTokenId);
            if (token && token.scene.id === scene.id) {
                this.manager.currentTokenId = null;
                await this.manager.updateHotbarForControlledToken();
            }
        });

        // Add combat turn update hooks
        Hooks.on("updateCombat", (combat, changed, options, userId) => {
            if (!this.manager?.ui?.filterContainer) return;
            
            // Only process if the turn actually changed
            if (!hasProperty(changed, "turn") && !hasProperty(changed, "round")) return;
            
            // Handle the turn update in the filter container
            this.manager.ui.filterContainer.handleCombatTurnUpdate();
        });

        // Handle combat start
        Hooks.on("combatStart", (combat) => {
            if (!this.manager?.ui?.filterContainer) return;
            this.manager.ui.filterContainer.handleCombatTurnUpdate();
        });

        // Handle when combat is actually deleted/removed
        Hooks.on("deleteCombat", (combat) => {
            if (!this.manager?.ui?.filterContainer) return;
            this.manager.ui.filterContainer.resetUsedActions();
        });

        // Initialize the module when ready
        Hooks.once('ready', () => {
            // Module is ready
        });
    }

    static async _autoPopulateTokenHotbar(token) {
        if (!token?.actor) return;

        try {
            // Get settings for each container
            const container1Setting = game.settings.get(CONFIG.MODULE_NAME, 'container1AutoPopulate');
            const container2Setting = game.settings.get(CONFIG.MODULE_NAME, 'container2AutoPopulate');
            const container3Setting = game.settings.get(CONFIG.MODULE_NAME, 'container3AutoPopulate');

            // Create a temporary hotbar manager for this token if it's not the current one
            let tempManager = null;
            let useCurrentManager = false;

            if (this.manager && this.manager.currentTokenId === token.id) {
                useCurrentManager = true;
            } else {
                tempManager = new HotbarManager();
                tempManager.currentTokenId = token.id;
                await tempManager._loadTokenData();
            }

            const manager = useCurrentManager ? this.manager : tempManager;

            // Process each container
            await AutoPopulateCreateToken._populateContainerWithSettings(token.actor, manager, 0, container1Setting);
            await AutoPopulateCreateToken._populateContainerWithSettings(token.actor, manager, 1, container2Setting);
            await AutoPopulateCreateToken._populateContainerWithSettings(token.actor, manager, 2, container3Setting);

            // Save the changes
            if (manager) {
                await manager.persist();
            }

            // Clean up temporary manager
            if (tempManager) {
                tempManager = null;
            }

            ui.notifications.info(`Auto-populated hotbar for token: ${token.name}`);
        } catch (error) {
            console.error("BG3 Inspired Hotbar | Error auto-populating token hotbar:", error);
            ui.notifications.error(`Error auto-populating token hotbar: ${error.message}`);
        }
    }

    static async _populateContainer(actor, manager, containerIndex, settingValue) {
        const container = manager.containers[containerIndex];
        if (!container) return;

        await AutoPopulateContainer.populateContainer(actor, container, settingValue);
    }

    static async _populateRemainingItems(actor, manager, containerIndex, items) {
        const container = manager.containers[containerIndex];
        if (!container) return;

        await AutoPopulateContainer.populateContainer(actor, container, items.map(item => item.type));
    }

    static _registerMacroDragDrop() {
        // Add drag drop capability for macros
        if (!game.macros.directory?.dragDrop) return;

        game.macros.directory.dragDrop.push({
            dragSelector: ".macro",
            dropSelector: ".hotbar-cell",
            permissions: {
                dragstart: () => true,
                drop: () => true
            },
            callbacks: {
                dragstart: (event) => {
                    const macro = game.macros.get(event.currentTarget.dataset.documentId);
                    if (!macro) {
                        console.warn("Could not find macro from element:", event.currentTarget);
                        return;
                    }
                    event.dataTransfer.setData("text/plain", JSON.stringify({
                        type: "Macro",
                        uuid: macro.uuid,
                        id: macro.id,
                        data: {
                            name: macro.name,
                            img: macro.img
                        }
                    }));
                },
                drop: (event) => {
                    try {
                        const data = JSON.parse(event.dataTransfer.getData("text/plain"));
                        return data.type === "Macro" && (data.uuid?.startsWith("Macro.") || game.macros.has(data.id));
                    } catch {
                        return false;
                    }
                }
            }
        });
    }
}

// Initialize the module when Foundry is ready
Hooks.once('ready', async () => {
    // Wait for canvas and UI to be ready
    if (!canvas || !canvas.ready) {
        Hooks.once('canvasReady', () => BG3Hotbar.init());
        return;
    }
    await BG3Hotbar.init();
}); 