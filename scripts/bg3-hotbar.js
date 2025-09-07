// BG3 Inspired Hotbar Module - Main Entry Point

import { HotbarContainer } from './components/containers/HotbarContainer.js';
import { PortraitContainer } from './components/containers/PortraitContainer.js';
import { RestTurnContainer } from './components/containers/RestTurnContainer.js';
import { WeaponContainer } from './components/containers/WeaponContainer.js';
import { ThemeSettingDialog } from './components/dialog/ThemeSettingDialog.js';
import { AutoPopulateCreateToken } from './features/AutoPopulateCreateToken.js';
import { ControlsManager } from './managers/ControlsManager.js';
import { DragDropManager } from './managers/DragDropManager.js';
import { HotbarManager } from './managers/HotbarManager.js';
import { ItemUpdateManager } from './managers/ItemUpdateManager.js';
import { BG3CONFIG, preloadHandlebarsTemplates } from './utils/config.js';
import { BG3TooltipManager } from './managers/TooltipManager.js';
import { AdvContainer } from './components/containers/AdvContainer.js';

export class BG3Hotbar extends Application {
    constructor() {
        super();

        this._manager = null;
        this.dragDropManager = null;
        this.itemUpdateManager = null;
        this.menuManager = null;
        this.tooltipManager = null;
        this.combat = [];
        this.components = {};
        this.macroBarTimeout = null;
        this.combatActionsArray = [];
        // this.enabled = game.settings.get(BG3CONFIG.MODULE_NAME, 'uiEnabled');
        this.generateTimeout = null;
        this.colorPicker = null;
        this.overrideGMHotbar = false;

        /** Hooks Event **/
        // Hooks.once("canvasReady", this._onCanvasReady.bind(this));
        Hooks.on("createToken", this._onCreateToken.bind(this));
        Hooks.on("controlToken", this._onControlToken.bind(this));
        Hooks.on("deleteToken", this._onDeleteToken.bind(this));
        Hooks.on("updateToken", this._onUpdateToken.bind(this));
        Hooks.on("updateActor", this._onUpdateActor.bind(this));
        Hooks.on("createActor", this._onCreateActor.bind(this));
        // Hooks.on("deleteScene", this._onDeleteScene.bind(this));
        Hooks.on("updateCombat", this._onUpdateCombat.bind(this));
        Hooks.on("deleteCombat", this._onDeleteCombat.bind(this));
        Hooks.on("createActiveEffect", this._onUpdateActive.bind(this));
        Hooks.on("deleteActiveEffect", this._onUpdateActive.bind(this));
        Hooks.on("updateActiveEffect", this._onUpdateActive.bind(this));
        
        // Hook into activity usage for target selector
        Hooks.on("renderApplicationV2", this._onRenderActivityDialog.bind(this));

        Hooks.on("pickerDone", this._onPickerDone.bind(this));

        this._init();

        // Preload Handlebars templates
        preloadHandlebarsTemplates();
    }

    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            id: BG3CONFIG.MODULE_NAME,
            template: `modules/${BG3CONFIG.MODULE_NAME}/templates/bg3-hud.hbs`,
            popOut: false,
            dragDrop: [{ dragSelector: null, dropSelector: null }],
        };
    }

    async getData(data) {
        return {};
    }

    async _init() {

        this._applyTheme();

        TooltipManager.TOOLTIP_ACTIVATION_MS = game.settings.get(BG3CONFIG.MODULE_NAME, 'tooltipDelay');

        // Initialize the hotbar manager
        this.manager = new HotbarManager();
        this.dragDropManager = new DragDropManager();
        this.itemUpdateManager = new ItemUpdateManager();
        this.tooltipManager = new BG3TooltipManager();

        await this._onCanvasReady.bind(this)();
        
        // Apply macrobar collapse setting immediately if it's enabled
        this._applyMacrobarCollapseSetting();
        document.body.dataset.playerList = game.settings.get(BG3CONFIG.MODULE_NAME, 'playerListVisibility');
    }

    isV13orHigher() {
        return Number(game.version) > 13;
    }

    isDnDPrev4 () {
        return Number(game.system.version.split('.')[0]) < 4;
    }

    async _onCanvasReady() {
        const token = canvas.tokens.controlled?.[0];
        if(token) await this._onControlToken(token, canvas.tokens.controlled);
        else if(this.manager.canGMHotbar()) await this.generate(null);
    }

    async _onCreateToken(token) {
        if (!token?.actor) return;
        // Strictly avoid autopopulate for player characters on token creation
        if (token.actor.type === 'character') return;
        
        // Check if Token Loot is active and will handle this token
        const tokenLootAPI = game.modules.get('token-loot')?.api;
        if (tokenLootAPI?.waitForGrants && game.modules.get('token-loot')?.active) {
            // Token Loot is active - let it handle the population via the 'token-loot.awarded' hook
            // The compatibility layer will call AutoPopulateCreateToken.populateUnlinkedToken when ready
            console.debug('BG3 Hotbar | Skipping immediate population for token, Token Loot will handle it:', token.id);
            return;
        }
        
        try {
            await this._waitForTokenItems(token);
        } catch (e) {
            // Fail open; do not block HUD if something odd happens
        }
        await AutoPopulateCreateToken.populateUnlinkedToken(token);
    }

    /**
     * Wait for item grants on freshly created unlinked tokens to settle.
     * Uses an idle window heuristic and a timeout to avoid races with other modules.
     * @param {Token|TokenDocument} tokenLike
     * @param {{timeoutMs?: number, idleMs?: number, pollMs?: number}} opts
     */
    async _waitForTokenItems(tokenLike, opts = {}) {
        const { timeoutMs = 1500, idleMs = 200, pollMs = 50 } = opts;
        const tokenDoc = tokenLike?.document ?? tokenLike;
        const actor = tokenDoc?.actor;
        if (!actor) return;
        // Only relevant for unlinked (synthetic) actors; linked actors share base data
        if (!actor.isToken && tokenDoc?.actorLink) return;

        // Try Token Loot API first if available
        const tokenLootAPI = game.modules.get('token-loot')?.api;
        if (tokenLootAPI?.waitForGrants) {
            try {
                await tokenLootAPI.waitForGrants(tokenDoc);
                return; // Token Loot handled the waiting
            } catch (e) {
                // Fall back to polling if Token Loot API fails
                console.debug("BG3 Hotbar | Token Loot API failed, falling back to polling:", e);
            }
        }

        let lastChangeTs = Date.now();
        const isTargetActor = (a) => a?.id === actor.id;

        const onCreate = (item) => { if (isTargetActor(item?.parent)) lastChangeTs = Date.now(); };
        const onUpdate = (item) => { if (isTargetActor(item?.parent)) lastChangeTs = Date.now(); };
        const onDelete = (item) => { if (isTargetActor(item?.parent)) lastChangeTs = Date.now(); };

        Hooks.on('createItem', onCreate);
        Hooks.on('updateItem', onUpdate);
        Hooks.on('deleteItem', onDelete);

        const start = Date.now();
        try {
            // Idle-window polling: resolve once no item events for idleMs
            // or when timeout elapses.
            while (Date.now() - start < timeoutMs) {
                if (Date.now() - lastChangeTs >= idleMs) break;
                await new Promise(r => setTimeout(r, pollMs));
            }
        } finally {
            Hooks.off('createItem', onCreate);
            Hooks.off('updateItem', onUpdate);
            Hooks.off('deleteItem', onDelete);
        }
    }

    async _onControlToken(token, controlled) {
        if (this.overrideGMHotbar && game.settings.get(BG3CONFIG.MODULE_NAME, 'enableGMHotbar')) {
            return;
        }
        if (!this.manager) return;
        
        if(this.generateTimeout) {
            clearTimeout(this.generateTimeout);
            this.generateTimeout = null;
        }

        if(this.manager.canGMHotbar() && ControlsManager.isSettingLocked('deselect')) return;
        this.generateTimeout = setTimeout(async () => {
            if (((!controlled && !canvas.tokens.controlled.length) || canvas.tokens.controlled.length > 1) && !ControlsManager.isSettingLocked('deselect')) {
                if (!canvas.tokens.controlled.length || canvas.tokens.controlled.length > 1) this.generate(null);
            }
            if (!controlled || !canvas.tokens.controlled.length || canvas.tokens.controlled.length > 1) return;

            if(game.settings.get(BG3CONFIG.MODULE_NAME, 'uiEnabled')) await this.generate(token);
        })
    }

    async _onUpdateToken(token, changes, options, userId) {
        if (!this.manager || game.user.id !== userId) return;
        // If token was switched from linked to unlinked, reset stored data and repopulate
        if (changes?.actorLink === false) {
            try {
                console.log("BG3 Hotbar | Detected link->unlink. Resetting and autopopulating hotbar for token:", token.name);
                await this.manager.cleanupTokenData(token.id);
                await AutoPopulateCreateToken.populateUnlinkedToken(token, true);
                if (token.id === this.manager.currentTokenId) {
                    await this.generate(token);
                }
                console.log("BG3 Hotbar | Completed reset and autopopulate for unlinked token:", token.name);
                return;
            } catch (e) {
                console.error("BG3 Hotbar | Error resetting hotbar for unlinked token:", e);
            }
        }
        // If this is our current token and other actor-related data changed
        if (token.id === this.manager.currentTokenId && (changes.actorId || changes.actorData || changes.actorLink)) {
            this.refresh();
        }
    }

    async _onDeleteToken(tokenData, scene) {
        if (!this.manager) return;

        // const token = canvas.tokens.get(tokenData._id);
        const isPlayerCharacter = tokenData?.actor?.hasPlayerOwner;
        const isCurrentToken = tokenData._id === this.manager.currentTokenId;
        const isLocked = ControlsManager.isSettingLocked('deselect');

        // Only clean up data if:
        // 1. It's an unlinked token, OR
        // 2. It's the current token AND either:
        //    - It's not a player character, OR
        //    - It's not locked
        if (!tokenData?.actorLink || (isCurrentToken && (!isPlayerCharacter || !isLocked))) {
            await ui.BG3HOTBAR.manager.cleanupTokenData(tokenData._id);
        }

        // Handle UI cleanup based on token type and current status
        if (isCurrentToken) {
            // Only clear currentTokenId if it's not a locked player character
            if (!isPlayerCharacter || !isLocked) {
                await this.generate(null);
            }
        }
    }

    async _onCreateActor(actor, options, userId) {
        if (!this.manager || game.user.id !== userId) return;
        
        // Check if this actor has hotbar data (indicating it might be duplicated)
        const containersData = actor.getFlag(BG3CONFIG.MODULE_NAME, BG3CONFIG.CONTAINERS_NAME);
        if (!containersData) return;
        
        // Add a small delay to ensure the actor and its items are fully created
        setTimeout(async () => {
            try {
                console.log(`BG3 Hotbar | Checking duplicated actor "${actor.name}" for UUID fixes`);
                
                // Fix UUIDs in the duplicated actor's hotbar data
                const fixedContainers = await this._fixDuplicatedActorUUIDs(actor, containersData);
                
                if (fixedContainers) {
                    // Update the actor's flag with the fixed UUIDs
                    await actor.setFlag(BG3CONFIG.MODULE_NAME, BG3CONFIG.CONTAINERS_NAME, fixedContainers);
                    console.log(`BG3 Hotbar | Fixed UUIDs for duplicated actor "${actor.name}"`);
                }
            } catch (error) {
                console.error(`BG3 Hotbar | Error fixing UUIDs for duplicated actor "${actor.name}":`, error);
            }
        }, 100);
    }

    async _onUpdateActor(actor, changes, options, userId) {
        if(!this.manager) return;
        
        if(changes?.flags?.[BG3CONFIG.MODULE_NAME] && game.user.id !== userId) return this.manager.socketUpdateData(actor, changes);
        
        // Detect prototype token link->unlink toggles (v13): apply reset+autopopulate to placed tokens for this actor
        if (changes?.prototypeToken?.actorLink === false) {
            try {
                console.log(`BG3 Hotbar | Prototype token link disabled for actor "${actor.name}". Resetting any unlinked placed tokens for this actor.`);
                const affected = canvas.tokens.placeables.filter(t => t.actor?.id === actor.id && t.actorLink === false);
                for (const token of affected) {
                    await this.manager.cleanupTokenData(token.id);
                    await AutoPopulateCreateToken.populateUnlinkedToken(token, true);
                    if (token.id === this.manager.currentTokenId) {
                        await this.generate(token);
                    }
                }
                console.log(`BG3 Hotbar | Processed ${affected.length} placed token(s) for actor "${actor.name}" after prototype unlink.`);
            } catch (e) {
                console.error("BG3 Hotbar | Error processing prototype unlink reset:", e);
            }
        }

        // if (game.user.id !== userId) return;
        
        // Check if this update affects our current token
        if (actor?.id !== this.manager.actor?.id) return;
        
        // Update UI components
        if (this.element?.[0]) {
            // Update portrait card for any actor changes
            if (this.components.portrait) {
                // changes.system?.attributes?.hp?.value !== undefined
                await this.components.portrait._renderInner();
            }
            
            // Update filter container for spell slot changes
            if (changes.system?.spells && this.components.container.components.filterContainer) {
                await this.components.container.components.filterContainer.render();
            }
            
            // Update passives container if items changed
            if (changes.items && this.components.container.components.passiveContainer) {
                await this.components.container.components.passiveContainer.render();
            }

            // Update portrait extra infos if flags/system changed (e.g., custom flags or uses)
            if ((changes.flags || changes.system) && this.components.portrait) {
                await this.components.portrait._renderInner();
            }
            
            // Update active container if items changed
            // if (this.components.container.components.activeContainer) {
            //     await this.components.container.components.activeContainer.render();
            // }
            
            // Let ItemUpdateManager handle item changes
            if (changes.items || changes.system?.spells) {
                await this.itemUpdateManager.cleanupInvalidItems(actor);
            }
        }
    }

    async _onUpdateActive(effect) {
        if (effect?.parent?.id !== this.manager?.actor?.id) return;
        try {
            const container = this.components?.container?.components?.activeContainer;
            if (container) await container.render();
            const fc = this.components?.container?.components?.filterContainer;
            if (fc && ['dnd5ebonusaction', 'dnd5ereaction000'].includes(effect.id)) fc._checkBonusReactionUsed();
        } catch (e) {
            // no-op
        }
    }

    _onUpdateCombat(combat, updates) {
        this.combat.forEach(e => e.setComponentsVisibility());
        if (combat === true || (updates && ("round" in updates || "turn" in updates))) this.hide();
        if (updates && updates.round === 1 && updates.turn === 0) this._onStartCombat(combat);
    }

    async _onStartCombat(combat) {
        this.generate(canvas.tokens.controlled[0]);
        this.hide();
    }

    _onDeleteCombat(combat) {
        if(!ui.BG3HOTBAR.element) return;
        this.combat.forEach(e => e.setComponentsVisibility());
        this.hide();
        if(!this.components.container?.components?.filterContainer) return;
        this.components.container.components.filterContainer.resetUsedActions();
    }

    _onPickerDone(element, done) {
        const $input =  $(element).parent().find('input[is="colorpicker-input2"]');
        if($input) $input.trigger('change');
    }

    /**
     * Hook into activity dialog rendering to handle target selection
     * @param {Application} app - The rendered application
     * @param {HTMLElement} html - The rendered HTML
     */
    async _onRenderActivityDialog(app, html) {


        // Only handle if target selector is enabled
        const targetSelectorEnabled = game.settings.get('bg3-inspired-hotbar', 'enableTargetSelector') ?? true;

        if (!targetSelectorEnabled) return;

        // Check if this is an activity choice dialog
        const isDnd5e2 = app.options?.classes?.includes?.('dnd5e2');
        const hasActivityElements = html.querySelectorAll('[data-activity-id]').length > 0;

        if (!isDnd5e2 || !hasActivityElements) return;

        

        // Import targeting utilities
                    const { needsActivityTargeting, getActivityTargetRequirements } = await import('./utils/targetingRules.js');
        const { TargetSelector } = await import('./managers/TargetSelector.js');

        // Hook into button clicks instead of submit method
        setTimeout(() => {
            const buttons = html.querySelectorAll('button[data-activity-id]');
            
            buttons.forEach(button => {
                const activityId = button.dataset.activityId;
                
                // Add our own click listener with higher priority
                button.addEventListener('click', async (event) => {
                    
                    
                    // Stop the event from propagating to prevent normal execution
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    
                    // Get the item and activity
                    const item = app.item || app.object;
                    const activity = item?.system?.activities?.get(activityId);

                    

                    if (!activity) {
                        
                        return true; // Allow default behavior
                    }

                    const needsTargeting = needsActivityTargeting(activity);
                    

                    if (!needsTargeting) {
                        
                        // Re-trigger the original click without our listener
                        button.removeEventListener('click', arguments.callee);
                        button.click();
                        return;
                    }

                    // Get current token
                    const currentToken = ui.BG3HOTBAR.manager.token;
                    if (!currentToken) {
                        ui.notifications.warn("No token selected for targeting");
                        return;
                    }

                    // Close the activity dialog first
                    
                    await app.close();

                    // Get targeting requirements for this activity
                    const requirements = getActivityTargetRequirements(activity, item);

                    // Create and show target selector
                    
                    const targetSelector = new TargetSelector({
                        token: currentToken,
                        requirements: requirements
                    });

                    // Wait for target selection
                    
                    const selectedTargets = await targetSelector.select();

                    

                    // If no targets selected (cancelled), don't proceed
                    if (!selectedTargets || selectedTargets.length === 0) {
                        return;
                    }

                    // Set targets for the activity execution
                    const targetIds = selectedTargets.map(t => t.id);
                    canvas.tokens.setTargets(targetIds, { mode: "replace" });

                    // Now execute the activity directly
                    
                    await activity.use();

                    // Clear targets after a short delay
                    setTimeout(() => {
                        
                        canvas.tokens.setTargets([], { mode: "replace" });
                    }, 100);
                    
                }, true); // Use capture phase to intercept before other listeners
            });
        }, 100); // Small delay to ensure dialog is fully rendered
    }

    _applyMacrobarCollapseSetting() {
        // We need to wait for the UI to be ready before collapsing the hotbar
        if (!ui.hotbar) {
            // UI not ready, deferring macrobar collapse
            Hooks.once('renderHotbar', () => this._applyMacrobarCollapseSetting());
            return;
        }
        
        const collapseMacrobar = game.settings.get(BG3CONFIG.MODULE_NAME, 'collapseFoundryMacrobar');
        if(collapseMacrobar !== 'full' && document.querySelector("#hotbar").style.display != 'flex') document.querySelector("#hotbar").style.display = 'flex';
        // Applying macrobar collapse setting
        if (collapseMacrobar === 'always' || collapseMacrobar === 'true') {
            this.isV13orHigher() ? ui.hotbar.element.classList.add('hidden') : ui.hotbar.collapse();
        } else if (collapseMacrobar === 'never' || collapseMacrobar === 'false') {
            this.isV13orHigher() ? ui.hotbar.element.classList.remove('hidden') : ui.hotbar.expand();
        } else if(collapseMacrobar === 'select') {
            if(this.macroBarTimeout) clearTimeout(this.macroBarTimeout);
            if(ui.BG3HOTBAR?._element) {
                this.isV13orHigher() ? ui.hotbar.element.classList.add('hidden') : ui.hotbar.collapse();
            } else {
                this.macroBarTimeout = setTimeout(() => {
                    this.isV13orHigher() ? ui.hotbar.element.classList.remove('hidden') : ui.hotbar.expand();
                }, 100);
            }
        } else if(collapseMacrobar === 'full' && document.querySelector("#hotbar").style.display != 'none') document.querySelector("#hotbar").style.display = 'none';
    }

    _autoPopulateToken(token) {
        return AutoPopulateCreateToken.populateUnlinkedToken(token.document ?? token, true);
    }

    async _applyTheme() {
        const theme = game.settings.get(BG3CONFIG.MODULE_NAME, 'themeOption'),
            currentTheme = document.head.querySelector('[custom-theme]'),
            themeFile = game.settings.get(BG3CONFIG.MODULE_NAME, 'themeOption') && game.settings.get(BG3CONFIG.MODULE_NAME, 'themeOption') !== 'custom' ? await ThemeSettingDialog.loadThemeFile(game.settings.get(BG3CONFIG.MODULE_NAME, 'themeOption')) : game.settings.get(BG3CONFIG.MODULE_NAME, 'themeCustom'),
            themeConfig = {...BG3CONFIG.BASE_THEME, ...themeFile};
        if(themeConfig) {
            const styleContent = `:root{${Object.entries(themeConfig).map(([k, v]) => `${k}:${v};`).join('\n')}}`;
            if(currentTheme) currentTheme.innerHTML = styleContent;
            else {
                const style = document.createElement('style');
                style.setAttribute('type', 'text/css');
                style.setAttribute('custom-theme', theme)
                style.textContent = styleContent;
                document.head.appendChild(style);
            }
        }
    }
    
    updateUIScale() {
        let scale = 1;
        if(game.settings.get(BG3CONFIG.MODULE_NAME, 'autoScale')) scale = window.innerHeight / 1500;
        else scale = game.settings.get(BG3CONFIG.MODULE_NAME, 'uiScale') / 100;
        return scale;
    }

    toggle(state) {
        game.settings.set(BG3CONFIG.MODULE_NAME, 'uiEnabled', state);
        this.generate(state ? (canvas.tokens?.controlled?.length > 1 ? null : canvas.tokens?.controlled?.[0]) : null);
    }

    hide() {
        const autoHideSetting = game.settings.get(BG3CONFIG.MODULE_NAME, 'autoHideCombat');
        let state = false;
        if (autoHideSetting !== 'false') {
            const actor = this.manager.actor;
            if(!actor) return;
            state = (autoHideSetting == 'true' && !game.combat?.started) || (autoHideSetting == 'init' && (!game.combat?.started || !(game.combat?.started && game.combat?.combatant?.actor === actor)));
            if ( !state ) this.maximize();
            else this.minimize();
        }
    }

    async minimize() {
        if ( !this.rendered || [true, null].includes(this._minimized) ) return;
        this._minimized = null;

        return new Promise(resolve => {
            ui.BG3HOTBAR.element.addClass('minimized');
            setTimeout(() => {
                this._minimized = true;
                resolve();
            }, 300);
        });
    }

    async maximize() {
        if ( [false, null].includes(this._minimized) ) return;
        this._minimized = null;

        // Expand window
        return new Promise(resolve => {
            ui.BG3HOTBAR.element.removeClass('minimized');
            setTimeout(() => {
                this._minimized = false;
                resolve();
            }, 300);
        });
    }

    /**
     * Fix UUIDs in duplicated actor's hotbar data to point to the new actor's items
     * @param {Actor} newActor - The newly created/duplicated actor
     * @param {Object} containersData - The hotbar containers data
     * @returns {Object|null} - Fixed containers data or null if no changes needed
     */
    async _fixDuplicatedActorUUIDs(newActor, containersData) {
        let hasChanges = false;
        const fixedContainers = foundry.utils.deepClone(containersData);
        
        // Helper function to fix UUIDs in a container
        const fixContainerUUIDs = async (container) => {
            if (!container?.items) return;
            
            for (const [slotKey, item] of Object.entries(container.items)) {
                if (!item?.uuid) continue;
                
                // Check if this UUID points to an item from a different actor
                const uuidParts = item.uuid.split('.');
                const actorIndex = uuidParts.indexOf('Actor');
                
                if (actorIndex !== -1 && uuidParts[actorIndex + 1] !== newActor.id) {
                    // This UUID points to a different actor - try to find the equivalent item in the new actor
                    const originalItemId = uuidParts[uuidParts.length - 1];
                    const newItem = newActor.items.get(originalItemId);
                    
                    if (newItem) {
                        // Update the UUID to point to the new actor's item
                        item.uuid = newItem.uuid;
                        hasChanges = true;
                        console.log(`BG3 Hotbar | Fixed UUID: ${originalItemId} -> ${newItem.uuid}`);
                    } else {
                        // Item doesn't exist in new actor, remove it from hotbar
                        delete container.items[slotKey];
                        hasChanges = true;
                        console.log(`BG3 Hotbar | Removed missing item: ${originalItemId}`);
                    }
                }
            }
        };
        
        // Fix UUIDs in all container types
        if (fixedContainers.hotbar) {
            for (const container of fixedContainers.hotbar) {
                await fixContainerUUIDs(container);
            }
        }
        
        if (fixedContainers.weapon) {
            for (const container of fixedContainers.weapon) {
                await fixContainerUUIDs(container);
            }
        }
        
        if (fixedContainers.combat) {
            for (const container of fixedContainers.combat) {
                await fixContainerUUIDs(container);
            }
        }
        
        return hasChanges ? fixedContainers : null;
    }

    async generate(token) {
        if (!this.manager) return;
        if(!token) {
            this.manager.currentTokenId = null;
            if(!this.manager.canGMHotbar()) {
                await this.close();
                if(game.settings.get(BG3CONFIG.MODULE_NAME, 'collapseFoundryMacrobar') === 'select') this._applyMacrobarCollapseSetting();
                return;
            }
        } else this.manager.currentTokenId = token.id;
        await this.manager._loadTokenData();
        this.render(true);
    }

    async _render(force=false, options={}) {
        await super._render(force, options);
        if(this.components?.container?.components?.filterContainer) this.components.container.components.filterContainer._checkBonusReactionUsed();
        if(game.settings.get(BG3CONFIG.MODULE_NAME, 'collapseFoundryMacrobar') === 'select') this._applyMacrobarCollapseSetting();
    }

    async _renderInner(data) {        
        const element = await super._renderInner(data),
            html = element[0];

        // Apply setting
        html.style.setProperty('--bg3-scale-ui', this.updateUIScale());
        html.dataset.position = game.settings.get(BG3CONFIG.MODULE_NAME, 'uiPosition');
        html.dataset.underPause = game.settings.get(BG3CONFIG.MODULE_NAME, 'underPause');
        html.style.setProperty('--position-padding', `${game.settings.get(BG3CONFIG.MODULE_NAME, 'posPadding')}px`);
        html.style.setProperty('--position-bottom', `${game.settings.get(BG3CONFIG.MODULE_NAME, 'posPaddingBottom')}px`);
        html.style.setProperty('--bg3-normal-opacity', game.settings.get(BG3CONFIG.MODULE_NAME, 'normalOpacity'));
        if(game.settings.get(BG3CONFIG.MODULE_NAME, 'fadedOpacity') !== 1) html.style.setProperty('--bg3-faded-opacity', game.settings.get(BG3CONFIG.MODULE_NAME, 'fadedOpacity'));
        html.style.setProperty('--bg3-faded-delay', `${game.settings.get(BG3CONFIG.MODULE_NAME, 'fadeOutDelay')}s`);
        html.setAttribute('theme-option', game.settings.get(BG3CONFIG.MODULE_NAME, 'themeOption'));
        // html.style.setProperty('--position-bottom', `${game.settings.get(BG3CONFIG.MODULE_NAME, 'posPaddingBottom')}px`);
        html.dataset.itemName = game.settings.get(BG3CONFIG.MODULE_NAME, 'showItemNames');
        html.dataset.itemUse = game.settings.get(BG3CONFIG.MODULE_NAME, 'showItemUses');
        html.dataset.cellHighlight = game.settings.get(BG3CONFIG.MODULE_NAME, 'highlightStyle');
        html.dataset.cellHighlight = game.settings.get(BG3CONFIG.MODULE_NAME, 'highlightStyle');
        html.dataset.filterHover = game.settings.get(BG3CONFIG.MODULE_NAME, 'hoverFilterShow');
        html.dataset.abilityHover = game.settings.get(BG3CONFIG.MODULE_NAME, 'abilityButtonHover');
        document.body.dataset.showMaterials = game.settings.get(BG3CONFIG.MODULE_NAME, 'showMaterialDescription');
        ControlsManager.updateUIDataset(html);

        if(this.manager.currentTokenId) {
            this.components = {
                portrait: new PortraitContainer(),
                weapon: new WeaponContainer({weapon: this.manager.containers.weapon, combat: this.manager.containers.combat}),
                advantage: new AdvContainer(),
                container: new HotbarContainer(this.manager.containers.hotbar),
                restTurn: new RestTurnContainer()
            }
        } else if(this.manager.canGMHotbar()) {
            this.components = {
                container: new HotbarContainer(this.manager.containers.hotbar),
                restTurn: new RestTurnContainer()
            }
        }

        // Capture stable references for this render and propagate to components
        const stableToken = this.manager.token ?? null;
        const stableActor = this.manager.actor ?? null;
        Object.values(this.components).forEach((component) => {
            if (component && !Array.isArray(component)) {
                component._stableToken = stableToken;
                component._stableActor = stableActor;
            }
        });

        Object.values(this.components).forEach((component) => {
            if (component && !Array.isArray(component)) html.appendChild(component.element);
        });
        this.components.container._parent = this;
        this.combat.push(this.components.restTurn);

        const promises = [];
        Object.values(this.components).forEach((component) => {
            if (component && !Array.isArray(component)) promises.push(component.render());
        });

        await Promise.all(promises);
        
        return element;
    }

    refresh() {
        if (this.rendered) this.render(true);
    }
}