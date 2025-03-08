// BG3 Inspired Hotbar Module - Main Entry Point

import { HotbarManager } from './managers/HotbarManager.js';
import { HotbarUI } from './components/HotbarUI.js';
import { CONFIG } from './utils/config.js';
import { AutoPopulateCreateToken, AutoPopulateDefaults } from './features/AutoPopulateCreateToken.js';
import { AutoPopulateContainer } from './features/AutoPopulateContainer.js';
import { TooltipFactory } from './tooltip/TooltipFactory.js';

export class BG3Hotbar {
    static manager = null;

    static async init() {
        // Initialize the hotbar manager
        this.manager = new HotbarManager();
        
        // Register hooks
        this._registerHooks();
        
        // Apply macrobar collapse setting immediately if it's enabled
        this._applyMacrobarCollapseSetting();

        // Log initialization
        console.log(`${CONFIG.MODULE_NAME} | Initialized`);
    }
    
    static _applyMacrobarCollapseSetting() {
        // We need to wait for the UI to be ready before collapsing the hotbar
        if (!ui.hotbar) {
            // UI not ready, deferring macrobar collapse
            Hooks.once('renderHotbar', () => this._applyMacrobarCollapseSetting());
            return;
        }
        
        const collapseMacrobar = game.settings.get(CONFIG.MODULE_NAME, 'collapseFoundryMacrobar');
        // Applying macrobar collapse setting
        if (collapseMacrobar) {
            ui.hotbar.collapse();
        }
    }

    static _registerSettings() {
        // Add enable UI setting at the top
        game.settings.register(CONFIG.MODULE_NAME, 'enableUI', {
            name: 'BG3.Settings.EnableUI.Name',
            hint: 'BG3.Settings.EnableUI.Hint',
            scope: 'client',
            config: true,
            type: Boolean,
            default: true,
            onChange: async value => {
                // Always clean up existing UI first
                if (this.manager?.ui) {
                    this.manager.ui.destroy();
                    this.manager.ui = null;
                }

                // If enabling UI
                if (value) {
                    // If we don't have a manager, initialize one
                    if (!this.manager) {
                        await this.init();
                    }
                    
                    // Force an update for the current token if one is selected
                    const controlled = canvas.tokens.controlled[0];
                    if (controlled && this.manager) {
                        await this.manager.updateHotbarForControlledToken(true);
                    }
                }
            }
        });

        // Add portrait display defaults setting
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

        // Add show item names setting
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

        // Add show item uses setting
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
        
        // Add lock settings
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
        
        // Add tooltip delay setting
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

        // Auto-populate settings for unlinked tokens
        game.settings.register(CONFIG.MODULE_NAME, 'autoPopulateUnlinkedTokens', {
            name: 'BG3.Settings.AutoPopulateUnlinkedTokens.Name',
            hint: 'BG3.Settings.AutoPopulateUnlinkedTokens.Hint',
            scope: 'world',
            config: true,
            type: Boolean,
            default: true
        });

        // Container 1 auto-populate settings
        game.settings.register(CONFIG.MODULE_NAME, 'container1AutoPopulate', {
            name: 'BG3.Settings.Container1AutoPopulate.Name',
            hint: 'BG3.Settings.Container1AutoPopulate.Hint',
            scope: 'world',
            config: false, // Hide from regular settings menu
            type: Array,
            default: ["weapon", "feat"],
        });

        // Container 2 auto-populate settings
        game.settings.register(CONFIG.MODULE_NAME, 'container2AutoPopulate', {
            name: 'BG3.Settings.Container2AutoPopulate.Name',
            hint: 'BG3.Settings.Container2AutoPopulate.Hint',
            scope: 'world',
            config: false, // Hide from regular settings menu
            type: Array,
            default: ["spell"],
        });

        // Container 3 auto-populate settings
        game.settings.register(CONFIG.MODULE_NAME, 'container3AutoPopulate', {
            name: 'BG3.Settings.Container3AutoPopulate.Name',
            hint: 'BG3.Settings.Container3AutoPopulate.Hint',
            scope: 'world',
            config: false, // Hide from regular settings menu
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

        // Add highlight style setting
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

        // Add fade-out settings
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

        // Register setting for storing selected passive features per actor
        game.settings.register(CONFIG.MODULE_NAME, 'selectedPassivesByActor', {
            scope: 'client',
            config: false,
            type: Object,
            default: {}
        });
    }

    static _registerHooks() {
        // Canvas and token control hooks
        Hooks.on("canvasReady", () => {
            if (this.manager) {
                this.manager.updateHotbarForControlledToken();
            }
        });

        Hooks.on("controlToken", () => {
            if (this.manager) {
                this.manager.updateHotbarForControlledToken();
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
            const isLocked = this.manager.ui?._isLocked;

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

        // Rest hooks for spell slot updates
        Hooks.on("dnd5e.preShortRest", () => {
            // Store the current token ID for post-rest update
            this._restingTokenId = this.manager?.currentTokenId;
        });

        Hooks.on("dnd5e.shortRest", async (actor, data) => {
            if (!this.manager || this._restingTokenId !== this.manager.currentTokenId) return;
            
            if (this.manager.ui?.filterContainer) {
                this.manager.ui.filterContainer.render();
            }
        });

        Hooks.on("dnd5e.preLongRest", () => {
            this._restingTokenId = this.manager?.currentTokenId;
        });

        Hooks.on("dnd5e.longRest", async (actor, data) => {
            if (!this.manager || this._restingTokenId !== this.manager.currentTokenId) return;
            
            if (this.manager.ui?.filterContainer) {
                this.manager.ui.filterContainer.render();
            }
        });

        // Foundry macrobar hooks
        Hooks.on('renderHotbar', () => {
            const collapseMacrobar = game.settings.get(CONFIG.MODULE_NAME, 'collapseFoundryMacrobar');
            if (collapseMacrobar) {
                ui.hotbar.collapse();
            }
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
}

// Initialize the module when Foundry is ready
Hooks.once('ready', () => {
    BG3Hotbar.init();
}); 