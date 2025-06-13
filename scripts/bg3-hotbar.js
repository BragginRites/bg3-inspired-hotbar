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
        // Hooks.on("deleteScene", this._onDeleteScene.bind(this));
        Hooks.on("updateCombat", this._onUpdateCombat.bind(this));
        Hooks.on("deleteCombat", this._onDeleteCombat.bind(this));
        Hooks.on("createActiveEffect", this._onUpdateActive.bind(this));
        Hooks.on("deleteActiveEffect", this._onUpdateActive.bind(this));
        Hooks.on("updateActiveEffect", this._onUpdateActive.bind(this));

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
        setTimeout(async () => {
            await AutoPopulateCreateToken.populateUnlinkedToken(token);
        }, 100)
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
        // If this is our current token and actor-related data changed
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

    async _onUpdateActor(actor, changes, options, userId) {
        if(!this.manager) return;
        
        if(changes?.flags?.[BG3CONFIG.MODULE_NAME] && game.user.id !== userId) return this.manager.socketUpdateData(actor, changes);
        
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
        if (effect?.parent?.id === this.manager?.actor?.id && this.components.container.components.activeContainer) {
            await this.components.container.components.activeContainer.render();
            if(['dnd5ebonusaction', 'dnd5ereaction000'].includes(effect.id) && this.components.container.components.filterContainer) this.components.container.components.filterContainer._checkBonusReactionUsed();
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
        this.manager._loadTokenData();
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