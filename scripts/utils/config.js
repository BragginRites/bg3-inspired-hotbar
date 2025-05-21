// Configuration constants for the BG3 Hotbar

import { AutoPopulateSettings } from "../features/AutoPopulateFeature.js";
import { ExtraInfosDialog } from "../components/dialog/ExtraInfosDialog.js";
import { ThemeSettingDialog } from "../components/dialog/ThemeSettingDialog.js";
import Picker from "/modules/colorsettings/lib/vanilla-picker.min.mjs";
import API from "/modules/colorsettings/api.js";
import { CPRActionsDialog } from "../components/dialog/CPRActionsDialog.js";
import { BG3UTILS } from "./utils.js";

export const BG3CONFIG = {
    // UI Constants
    CELL_SIZE: 50,
    INITIAL_COLS: 5,
    ROWS: 3,
    DRAG_THRESHOLD: 40, // 80% of cell width
    TOOLTIP_DELAY: 500, // Default tooltip delay in ms

    CONTAINERSDATA: {
        hotbar: {
            count: 3,
            config: {
                get cols() { return BG3CONFIG.INITIAL_COLS},
                get rows() { return BG3CONFIG.ROWS},
                items: {}
            }
        },
        weapon: {
            count: 3,
            config: {
                cols: 2,
                rows: 1,
                items: {},
                type: 'label',
                for: 'weapon-set',
                // size: 1.5,
                delOnly: true,
                allowDuplicate: true,
                type: 'label',
                class: ['bg3-weapon-set']
            }
        },
        combat: {
            count: 1,
            config: {
                cols: 2,
                rows: 3,
                items: {},
                class: ['bg3-combat-container'],
                // size: 1.5,
                // locked: !!game.settings.get(BG3CONFIG.MODULE_NAME, 'lockCombatContainer')
            }
        }
    },
    
    // Z-Index Layers
    Z_INDEX: {
        BACKGROUND: {
            PORTRAIT: 1,
            PORTRAIT_OVERLAY: 2
        },
        MAIN: {
            GRID_CONTAINER: 20,
            GRID_CELLS: 21,
            DRAG_BARS: 22
        },
        OVERLAY: {
            TOGGLE_BUTTONS: 25,
            TOOLTIPS: 30,
            CONTEXT_MENU: 35,
            SPELL_CARD: 24,
            ABILITY_CARD: 24,
            FEATURES_CARD: 73,
            TOOLTIP: 9999999999,
            PORTRAIT_TOGGLE: 90,
            ACTION_CARD: 80,
            PORTRAIT_CARD: 70,
            SETTINGS_MENU: 110,
            SETTINGS_WINDOW: 120,
            FILTER_CONTAINER: 100
        },
        BASE: 70
    },
    
    // State Management
    FLAG_NAME: "hotbarConfig",
    CONTAINERS_NAME: "containersConfig",
    MODULE_NAME: "bg3-inspired-hotbar",
    // PATHs
    get COMPONENTS_PATH() { return `modules/${BG3CONFIG.MODULE_NAME}/templates/components/`},
    
    // Styling
    COLORS: {
        ACTION: "#2ecc71",     // vibrant green
        BONUS: "#e67e22",      // vibrant orange
        REACTION: "#fe85f6",   // vibrant lavender
        DEFAULT: "#cccccc",
        PACT_MAGIC: "#8e44ad", // deep purple
        APOTHECARY_MAGIC: "#285348", // deep green
        SPELL_SLOT: "#3498db",
        CANTRIP: "#27ae60",    // deep green
        PROFICIENT: "#4da6ff", // blue (same as spell slot)
        BACKGROUND: "#1e1e1e",
        BACKGROUND_LIGHT: "#2e2e2e",
        BACKGROUND_HIGHLIGHT: "#3e3e3e",
        BACKGROUND_ACTIVE: "#4e4e4e",
        // BORDER: "#444444",
        TEXT: {
            PRIMARY: "#dddddd",
            SECONDARY: "#999999"
        },
        FEATURE_HIGHLIGHT: "#d35400",  // deeper orange for features
        FEATURES: {
            class: "#7b68ee",      // Medium Slate Blue
            race: "#20b2aa",       // Light Sea Green
            background: "#daa520",  // Goldenrod
            feat: "#ff6347",       // Tomato
            monster: "#4682b4",    // Steel Blue
            subclass: "#9370db",   // Medium Purple
            default: "#808080"     // Gray for unknown types
        }
    },

    EXTRAINFOS: [
        {attr: 'attributes.ac.value', icon: 'fas fa-shield', color: '#5abef5', pos: 'Top Left'},
        {attr: 'attributes.spell.dc', icon: 'fas fa-book-open', color: '#af68d5', pos: 'Top Right'},
        {attr: '', icon: '', color: '', pos: 'Left'},
        {attr: '', icon: '', color: '', pos: 'Right'},
        {attr: '', icon: '', color: '', pos: 'Bottom Left'},
        {attr: '', icon: '', color: '', pos: 'Bottom Right'}
    ],

    // Themes
    BASE_THEME: {
        "--bg3-border-color": "#444444",
        "--bg3-border-color-hover": "#666666",
        "--bg3-background-color": "#222222",
        "--bg3-background-color-hover": "#3a3a3a",
        "--bg3-text-color": "#dddddd",
        "--bg3-text-color-hover": "#dddddd",
        "--bg3-text-secondary-color": "#ffffff",
        "--bg3-border-size": "2px",
        "--bg3-border-radius": "8px",
        "--bg3-portrait-size": "175px",
        "--bg3-hotbar-border-color": "var(--bg3-border-color)",
        "--bg3-hotbar-border-color-hover": "var(--bg3-border-color-hover)",
        "--bg3-hotbar-sub-background-color": "var(--bg3-background-color)",
        "--bg3-hotbar-background-color": "var(--bg3-background-color)",
        "--bg3-hotbar-background-color-hover": "var(--bg3-background-color-hover)",
        "--bg3-hotbar-text-color": "var(--bg3-text-color)",
        "--bg3-hotbar-text-color-hover": "var(--bg3-text-color-hover)",
        "--bg3-hotbar-cell-size": "50px",
        "--bg3-hotbar-border-size": "var(--bg3-border-size)",
        "--bg3-hotbar-drag-color": "#cc3333",
        "--bg3-hotbar-drag-color-hover": "#d10000",
        "--bg3-weapon-border-color": "var(--bg3-border-color)",
        "--bg3-weapon-border-color-hover": "var(--bg3-border-color-hover)",
        "--bg3-weapon-background-color": "var(--bg3-background-color)",
        "--bg3-weapon-background-color-hover": "var(--bg3-background-color-hover)",
        "--bg3-weapon-text-color": "var(--bg3-text-color)",
        "--bg3-weapon-text-color-hover": "var(--bg3-text-color-hover)",
        "--bg3-weapon-cell-size": "75px",
        "--bg3-weapon-border-size": "var(--bg3-border-size)",
        "--bg3-filter-border-color": "var(--bg3-border-color)",
        "--bg3-filter-border-color-hover": "var(--bg3-border-color-hover)",
        "--bg3-filter-background-color": "var(--bg3-background-color)",
        "--bg3-filter-background-color-hover": "var(--bg3-background-color-hover)",
        "--bg3-filter-text-color": "var(--bg3-text-color)",
        "--bg3-filter-text-color-hover": "var(--bg3-text-color-hover)",
        "--bg3-filter-cell-size": "32px",
        "--bg3-filter-border-size": "var(--bg3-border-size)",
        "--bg3-passive-border-color": "var(--bg3-border-color)",
        "--bg3-passive-border-color-hover": "var(--bg3-border-color-hover)",
        "--bg3-passive-background-color": "var(--bg3-background-color)",
        "--bg3-passive-background-color-hover": "var(--bg3-background-color-hover)",
        "--bg3-passive-text-color": "var(--bg3-text-color)",
        "--bg3-passive-text-color-hover": "var(--bg3-text-color-hover)",
        "--bg3-passive-cell-size": "31px",
        "--bg3-passive-border-size": "var(--bg3-border-size)",
        "--bg3-active-border-color": "var(--bg3-border-color)",
        "--bg3-active-border-color-hover": "var(--bg3-border-color-hover)",
        "--bg3-active-background-color": "var(--bg3-background-color)",
        "--bg3-active-background-color-hover": "var(--bg3-background-color-hover)",
        "--bg3-active-text-color": "var(--bg3-text-color)",
        "--bg3-active-text-color-hover": "var(--bg3-text-color-hover)",
        "--bg3-active-cell-size": "31px",
        "--bg3-active-border-size": "var(--bg3-border-size)",
        "--bg3-rest-border-color": "var(--bg3-border-color)",
        "--bg3-rest-border-color-hover": "var(--bg3-border-color-hover)",
        "--bg3-rest-background-color": "var(--bg3-background-color)",
        "--bg3-rest-background-color-hover": "var(--bg3-background-color-hover)",
        "--bg3-rest-text-color": "var(--bg3-text-color)",
        "--bg3-rest-text-color-hover": "var(--bg3-text-color-hover)",
        "--bg3-turn-border-color": "var(--bg3-border-color)",
        "--bg3-turn-border-color-hover": "var(--bg3-border-color-hover)",
        "--bg3-turn-background-color": "var(--bg3-background-color)",
        "--bg3-turn-background-color-hover": "var(--bg3-background-color-hover)",
        "--bg3-turn-text-color": "var(--bg3-text-color)",
        "--bg3-turn-text-color-hover": "var(--bg3-text-color-hover)",
        "--bg3-rest-border-size": "var(--bg3-border-size)",
        "--bg3-tooltip-border-color": "var(--bg3-border-color)",
        "--bg3-tooltip-background-color": "var(--bg3-background-color)",
        "--bg3-tooltip-text-color": "var(--bg3-text-color)",
        "--bg3-tooltip-text-secondary-color": "var(--bg3-text-secondary-color)",
        "--bg3-tooltip-component-color": "#aaaaaa",
        "--bg3-tooltip-border-size": "var(--bg3-border-size)"
    },

    // Item Types
    ITEM_TYPES: [
        { value: "weapon", label: "BG3.Settings.ContainerAutoPopulate.Weapons" },
        { value: "feat", label: "BG3.Settings.ContainerAutoPopulate.Features" },
        { value: "spell", label: "BG3.Settings.ContainerAutoPopulate.Spells" },
        { value: "consumable", label: "BG3.Settings.ContainerAutoPopulate.Consumables" },
        { value: "equipment", label: "BG3.Settings.ContainerAutoPopulate.Equipment" },
        { value: "tool", label: "BG3.Settings.ContainerAutoPopulate.Tools" },
        { value: "loot", label: "BG3.Settings.ContainerAutoPopulate.Loot" }
    ],

    COMMON_ACTIONS: {},
    DEFAULT_COMMON_ACTIONS: [],

    AUTOPOPULATE_TYPES: [
        ["weapon", "feat"],
        ["spell"],
        ["consumable"]
    ]
};

export function registerKeybinding() {
    // Register keybinding for toggling UI
    game.keybindings.register(BG3CONFIG.MODULE_NAME, "toggleUI", {
        name: "Toggle BG3 Hotbar",
        hint: "Toggles the BG3 Inspired Hotbar UI visibility",
        editable: [{ key: "KeyH" }],
        onDown: () => {
            ui.BG3HOTBAR.toggle(!game.settings.get(BG3CONFIG.MODULE_NAME, 'uiEnabled'))
            document.querySelector('[data-tool="toggleBG3UI"]').classList.toggle('active', game.settings.get(BG3CONFIG.MODULE_NAME, 'uiEnabled'))
        },
        restricted: false,
        precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
    });
}

export function registerLibWrapper() {
    /* patchFunc("game.dnd5e.dataModels.ItemDataModel.prototype.getCardData", async function (wrapped, { activity, ...enrichmentOptions }={}) {
        const context = await wrapped.call(this);
        if(context.labels?.damages?.length) {
            let textDamage = '';
            const rollData = (activity ?? this.parent).getRollData();
            for(let i = 0; i < context.labels.damages.length; i++) {
                // [[/damage {{damage.formula}}{{#if damage.damageType}} type={{damage.damageType}}{{/if}}]]
                textDamage += `[[/damage ${context.labels.damages[i].formula}${context.labels.damages[i].damageType ? ` type=${context.labels.damages[i].damageType}` : ''}]]`;
                if(i < context.labels.damages.length - 1) textDamage += ' | ';
            }
            context.enrichDamage = {
                value: await TextEditor.enrichHTML(textDamage ?? "", {
                  rollData, relativeTo: this.parent, ...enrichmentOptions
                })
            }
        }
        if(!this.hasOwnProperty('identified') && this.hasLimitedUses) context.uses = this.uses;
        return context;
    }, "MIXED"); */
}

export async function preloadHandlebarsTemplates() {
    const partials = [
        // `modules/${BG3CONFIG.MODULE_NAME}/templates/tooltips/item-tooltip.hbs`,
        // `modules/${BG3CONFIG.MODULE_NAME}/templates/tooltips/spell-block.hbs`,
        // `modules/${BG3CONFIG.MODULE_NAME}/templates/tooltips/weapon-block.hbs`,
        // `modules/${BG3CONFIG.MODULE_NAME}/templates/tooltips/activity-tooltip.hbs`,
        `modules/${BG3CONFIG.MODULE_NAME}/templates/tooltips/macro-tooltip.hbs`,
    ];

    const paths = {};
    for ( const path of partials ) {
        paths[path.replace(".hbs", ".html")] = path;
        paths[`bg3hotbar.${path.split("/").pop().replace(".hbs", "")}`] = path;
    }
    
    return loadTemplates(paths);
}

// Copy Lib Color Setting picker due to the lack of focusout event.....
class colorPickerInput2 extends HTMLInputElement {
    constructor(...args) {
        super(...args);
        this.picker = undefined;
        // this._getEyeDropper = this._getEyeDropper.bind(this);
        this._makePicker = this._makePicker.bind(this);
        this.visible = false;
        // check if picker should be always shown.
        if (/** @deprecated */this.id === "permanent" || this.dataset.permanent !== undefined) {
            this._makePicker("picker_inline");
        }
        else {
            // on focus
            this.addEventListener("focusin", () => {
                if (!this.visible) {
                    this.visible = true;
                    this._makePicker("picker_popin");
                }
            });
        }

        if (this.dataset.responsiveColor !== undefined && this.value != undefined && this.value.length != 0 && this.value.startsWith("#") && this.value.match(/[^A-Fa-f0-9#]+/g) == null) {
            this.style.backgroundColor = this.value;
            this.style.color = API.getTextColor(this.value);
        }
    }

    _makePicker(pickerClass) {
        /** @type {import('vanilla-picker').default} */
        this.picker = new Picker();
        
        // check if an actual value
        if (this.value != undefined && this.value.length != 0 && this.value.startsWith("#") && this.value.match(/[^A-Fa-f0-9#]+/g) == null) {
            this.picker.setColor(this.value.padEnd(9, "f").slice(0, 9), true);
        } else if(this.getAttribute("placeholder") != undefined && this.getAttribute("placeholder").length != 0 && this.getAttribute("placeholder").startsWith("#") && this.getAttribute("placeholder").match(/[^A-Fa-f0-9#]+/g) == null) {
            this.picker.setColor(this.getAttribute("placeholder").padEnd(9, "f").slice(0, 9), true);
        }
        
        this.picker.setOptions({
            popup: true,
            parent: this.parentElement,
            cancelButton: false,
            onDone: (color) => {
                this.picker.destroy();
                this.visible = false;
                Hooks.call('pickerDone',
                    this.parentElement,
                    color.hex,
                    this
                );
                this.dispatchEvent(new CustomEvent("pickerDone", {detail: color}), {bubbles: true });
            },
            onChange: (color) => {
                if (this.dataset.responsiveColor !== undefined) {
                    this.style.backgroundColor = color.rgbaString;
                    this.style.color = API.getTextColor(color.hex);
                }
                this.value = color.hex;

                // Allow Watching of Color Change
                if (this.dataset.watchPickerChange !== undefined) {
                    this.timer = setTimeout(() => {
                        this.dispatchEvent(new CustomEvent("pickerChange", { detail: color }), { bubbles: true });
                    }, 300);
                }
            }
        });
    }
};

export function registerEarly() {
    // UI Toggle Setting (hidden from settings menu)
    game.settings.register(BG3CONFIG.MODULE_NAME, 'uiEnabled', {
        name: "UI Enabled",
        scope: 'client',
        config: false,
        type: Boolean,
        default: true
    });
    
    Hooks.on('getSceneControlButtons', (controls) => {
        const tokenTools = controls.tokens ?? controls.find(c => c.name === "token");
        if (!tokenTools) return;
    
        const isActive = game.settings.get(BG3CONFIG.MODULE_NAME, 'uiEnabled') ?? true,
            btnData = {
                name: "toggleBG3UI",
                title: "Toggle BG3 Hotbar",
                icon: "fas fa-gamepad",
                toggle: true,
                active: isActive,
                onClick: value => ui.BG3HOTBAR.toggle(value),
                order: 10
            };
        

        if(Array.isArray(tokenTools.tools)) tokenTools.tools.push(btnData);
        else tokenTools.tools.toggleBG3UI = btnData;
    });
    
    // const rollEvents = ["dnd5e.preRollAttackV2", "dnd5e.preRollSavingThrowV2", "dnd5e.preRollSkillV2", "dnd5e.preRollAbilityCheckV2", "dnd5e.preRollConcentrationV2", "dnd5e.preRollDeathSaveV2", "dnd5e.preRollToolV2"];
    // for(const event of rollEvents) Hooks.on(event, hookRollEvent);
    
    if (customElements.get('colorpicker-input2') != undefined) {
        return;
    }
    customElements.define('colorpicker-input2', colorPickerInput2, {
        extends: 'input'
    });
}

/* const hookRollEvent = (rollConfig, dialogConfig, messageConfig) => {
    if(!game.modules.get("midi-qol")?.active || !game.settings.get(BG3CONFIG.MODULE_NAME, 'addAdvBtnsMidiQoL') || !ui.BG3HOTBAR.manager?.actor || ui.BG3HOTBAR.manager?.actor !== rollConfig.workflow?.actor) return;
    const state = ui.BG3HOTBAR.manager.actor.getFlag(BG3CONFIG.MODULE_NAME, "advState"),
        once = ui.BG3HOTBAR.manager.actor.getFlag(BG3CONFIG.MODULE_NAME, "advOnce");
    if(state !== undefined) {
        if(state === 'advBtn') rollConfig.advantage = true;
        else if(state === 'disBtn') rollConfig.disadvantage = true;
        if(once && !!ui.BG3HOTBAR.components.advantage) ui.BG3HOTBAR.components.advantage.setState(null);
    }
} */

export function updateSettingsDisplay() {
    Hooks.on("renderSettingsConfig", (app, html, data) => {
        const detailsSettings = [
            {
                label: 'BG3.Settings.Menu.Global.Name',
                categories: [
                    {
                        label: 'BG3.Settings.Menu.Global.Sub.Foundry',
                        fields: ['collapseFoundryMacrobar', 'playerListVisibility', 'underPause']
                    },
                    {
                        label: 'BG3.Settings.Menu.Global.Sub.Scale',
                        fields: ['autoScale', 'uiScale', 'uiPosition', 'posPadding', 'posPaddingBottom']
                    },
                    {
                        label: 'BG3.Settings.Menu.Global.Sub.Opacity',
                        fields: ['normalOpacity', 'fadedOpacity', 'fadeOutDelay', 'autoHideCombat']
                    }
                ]
            },
            {
                label: 'BG3.Settings.Menu.Theme.Name',
                categories: [
                    {
                        label: null,
                        fields: ['menuTheme', 'scopeTheme']
                    }
                ]
            },
            {
                label: 'BG3.Settings.Menu.Portrait.Name',
                categories: [
                    {
                        label: 'BG3.Settings.Menu.Portrait.Sub.Show',
                        fields: ['hidePortraitImage', 'showHealthOverlay', 'showHPText', 'enableHPControls', 'showDeathSavingThrow', 'menuExtraInfo', 'showExtraInfo']
                    },
                    {
                        label: 'BG3.Settings.Menu.Portrait.Sub.Portrait',
                        fields: ['defaultPortraitPreferences', 'shapePortraitPreferences', 'borderPortraitPreferences', 'backgroundPortraitPreferences', 'overlayModePortrait']
                    },
                    {
                        label: 'BG3.Settings.Menu.Portrait.Sub.Other',
                        fields: ['showSheetSimpleClick']
                    }
                ]
            },
            {
                label: 'BG3.Settings.Menu.Hotbar.Name',
                categories: [
                    {
                        label: 'BG3.Settings.Menu.Hotbar.Sub.General',
                        fields: ['showItemNames', 'showItemUses', 'highlightStyle']
                    },
                    {
                        label: 'BG3.Settings.Menu.Hotbar.Sub.Weapon',
                        fields: ['enableWeaponAutoEquip']
                    },
                    {
                        label: 'BG3.Settings.Menu.Hotbar.Sub.Common',
                        fields: ['showCombatContainer', 'autoPopulateCombatContainer', 'chooseCPRActions', 'lockCombatContainer']
                    },
                    {
                        label: 'BG3.Settings.Menu.Hotbar.Sub.Other',
                        fields: ['fadeControlsMenu', 'showRestTurnButton', 'enableGMHotbar']
                    }
                ]
            },
            {
                label: 'BG3.Settings.Menu.Filter.Name',
                categories: [
                    {
                        label: null,
                        fields: ['hoverFilterShow', 'showExtendedFilter']
                    }
                ]
            },
            {
                label: 'BG3.Settings.Menu.Populate.Name',
                categories: [
                    {
                        label: null,
                        fields: [/* 'enforceSpellPreparationPC', 'enforceSpellPreparationNPC',  */'autoPopulateLinkedTokens', 'autoPopulateUnlinkedTokens', 'containerAutoPopulateSettings']
                    }
                ]
            },
            {
                label: 'BG3.Settings.Menu.Tooltip.Name',
                categories: [
                    {
                        label: null,
                        fields: ['enableLightTooltip', 'tooltipDelay'/* , 'showMaterialDescription' */, 'showDamageRanges']
                    }
                ]
            }
            
        ];
        /* if(game.modules.get("midi-qol")?.active) {
            detailsSettings.push({
                label: 'BG3.Settings.Menu.Midi.Name',
                categories: [
                    {
                        label: null,
                        fields: ['synchroBRMidiQoL', 'addAdvBtnsMidiQoL']
                    }
                ]
            });
        } */
        BG3UTILS.formatSettingsDetails(BG3CONFIG.MODULE_NAME, detailsSettings);
    });
}

export function registerSettings() {
    // Core UI Settings
    game.settings.register(BG3CONFIG.MODULE_NAME, 'collapseFoundryMacrobar', {
        name: 'BG3.Settings.CollapseFoundryMacrobar.Name',
        hint: 'BG3.Settings.CollapseFoundryMacrobar.Hint',
        scope: 'client',
        config: true,
        type: String,
        choices: {
            'always': 'Always',
            'never': 'Never',
            'select': 'When Hotbar visible',
            'full': 'Fully hidden'
        },
        default: 'always',
        onChange: () => {
            // Handle the macrobar state when the setting changes
            ui.BG3HOTBAR._applyMacrobarCollapseSetting();
        }
    });

    // New setting for Player List Visibility
    game.settings.register(BG3CONFIG.MODULE_NAME, 'playerListVisibility', {
        name: 'BG3.Settings.PlayerListVisibility.Name',
        hint: 'BG3.Settings.PlayerListVisibility.Hint',
        scope: 'client',
        config: true,
        type: String,
        choices: {
            "always": "BG3.Settings.PlayerListVisibility.Choices.always",
            "hover": "BG3.Settings.PlayerListVisibility.Choices.hover",
            "hidden": "BG3.Settings.PlayerListVisibility.Choices.hidden"
        },
        default: "always",
        onChange: value => {
            document.body.dataset.playerList = value;
        }
    });
    
    // Visual Settings - Appearance
    
    game.settings.register(BG3CONFIG.MODULE_NAME, 'underPause', {
        name: 'BG3.Settings.GamePause.Name',
        hint: 'BG3.Settings.GamePause.Hint',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: value => {
            if(ui.BG3HOTBAR.element?.[0]) ui.BG3HOTBAR.element?.[0].setAttribute('data-under-pause', value);
        }
    });
    
    game.settings.register(BG3CONFIG.MODULE_NAME, 'autoScale', {
        name: 'BG3.Settings.AutoScale.Name',
        hint: 'BG3.Settings.AutoScale.Hint',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: () => {
            if(ui.BG3HOTBAR.element[0]) ui.BG3HOTBAR.element[0].style.setProperty('--bg3-scale-ui', ui.BG3HOTBAR.updateUIScale());
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'uiScale', {
        name: 'UI Scale',
        hint: 'Change the UI scale (50% to 300%) according to your preferences and settings.',
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
            if(ui.BG3HOTBAR.element[0]) ui.BG3HOTBAR.element[0].style.setProperty('--bg3-scale-ui', ui.BG3HOTBAR.updateUIScale());
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'uiPosition', {
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
           if(ui.BG3HOTBAR.element[0]) ui.BG3HOTBAR.element[0].dataset.position = value;
        }
    });
     
    game.settings.register(BG3CONFIG.MODULE_NAME, "posPadding", {
        name: "UI Position - Padding",
        hint: "Space from the screen border. From the left if UI Position -> Left, From the right if UI Position -> Right",
        scope: "client",
        config: true,
        type: Number,
        default: 0,
        onChange: value => {
            if(ui.BG3HOTBAR.element[0]) ui.BG3HOTBAR.element[0].style.setProperty('--position-padding', `${value}px`);
        },
    });
     
    game.settings.register(BG3CONFIG.MODULE_NAME, "posPaddingBottom", {
        name: "UI Position - Bottom",
        hint: "Space from the bottom of the screen.",
        scope: "client",
        config: true,
        type: Number,
        default: 10,
        onChange: value => {
            if(ui.BG3HOTBAR.element[0]) ui.BG3HOTBAR.element[0].style.setProperty('--position-bottom', `${value}px`);
        },
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'normalOpacity', {
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
            if(ui.BG3HOTBAR.element?.[0]) ui.BG3HOTBAR.element?.[0].style.setProperty('--bg3-normal-opacity', value);
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'fadedOpacity', {
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
            if(ui.BG3HOTBAR.element?.[0]) {
                if(value === 1) {
                    ui.BG3HOTBAR.element?.[0].style.setProperty('--bg3-faded-delay', `0s`);
                    ui.BG3HOTBAR.element?.[0].style.removeProperty('--bg3-faded-opacity');
                }
                else {
                    ui.BG3HOTBAR.element?.[0].style.setProperty('--bg3-faded-delay', `${game.settings.get(BG3CONFIG.MODULE_NAME, 'fadeOutDelay')}s`);
                    ui.BG3HOTBAR.element?.[0].style.setProperty('--bg3-faded-opacity', value);
                }
            }
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'fadeOutDelay', {
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
            if(ui.BG3HOTBAR.element?.[0] && game.settings.get(BG3CONFIG.MODULE_NAME, 'fadedOpacity') !== 1) ui.BG3HOTBAR.element?.[0].style.setProperty('--bg3-faded-delay', `${value}s`);
        }
    });
  
    game.settings.register(BG3CONFIG.MODULE_NAME, 'autoHideCombat', {
      name: 'Auto Hide UI',
      // hint: 'Display a extra container to for basic actions like dodge, dash, etc (Compatible with CPR)',
      scope: 'client',
      config: true,
      type: String,
      default: "false",
      choices: {
          'false': 'Never',
          'true': 'When not in combat',
          'init': 'When not in combat and it\'s not your turn'
      },
      onChange: () => {
        ui.BG3HOTBAR._onUpdateCombat(true);
      }
    });

    // Theme settings
    game.settings.register(BG3CONFIG.MODULE_NAME, 'scopeTheme', {
        name: 'BG3.Settings.scopeTheme.Name',
        hint: 'BG3.Settings.scopeTheme.Hint',
        scope: 'world',
        config: true,
        type: Boolean,
        requiresReload: true,
        default: true
    });

    const scopeTheme = game.settings.get(BG3CONFIG.MODULE_NAME, "scopeTheme");

    game.settings.registerMenu(BG3CONFIG.MODULE_NAME, "menuTheme", {
        name: 'BG3.Settings.Menu.Theme.Name',
        label: 'BG3.Settings.Menu.Theme.Label',
        hint: 'BG3.Settings.Menu.Theme.Hint',
        icon: "fas fa-paintbrush-fine fa-rotate-90",
        type: ThemeSettingDialog,
        restricted: !scopeTheme
    });
    
    game.settings.register(BG3CONFIG.MODULE_NAME, 'themeOption', {
        name: 'Theme options',
        hint: 'Choose between available themes',
        scope: scopeTheme ? 'client' : 'world',
        config: false,
        type: String,
        default: 'default'
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'themeCustom', {
        name: 'Theme custom',
        hint: '',
        scope: scopeTheme ? 'client' : 'world',
        config: false,
        type: Object,
        default: {}
    });

    // Portrait Settings
    game.settings.register(BG3CONFIG.MODULE_NAME, 'hidePortraitImage', {
        name: 'Hide Portrait Image',
        hint: 'Also hide health overlay and text.',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {
          if(ui.BG3HOTBAR.components.portrait?.element) {
            ui.BG3HOTBAR.components.portrait.element.classList.toggle('portrait-hidden', !value);
          }
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'showHealthOverlay', {
      name: 'Show health overlay on character portrait.',
      // hint: 'Display a extra container to for basic actions like dodge, dash, etc (Compatible with CPR)',
      scope: 'client',
      config: true,
      type: Boolean,
      default: true,
      onChange: () => {
        if(ui.BG3HOTBAR.components.portrait) {
            ui.BG3HOTBAR.components.portrait.togglePortraitOverlay.bind(ui.BG3HOTBAR.components.portrait)();
        }
      }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'showHPText', {
      name: 'Show HP text on character portrait.',
      // hint: 'Display a extra container to for basic actions like dodge, dash, etc (Compatible with CPR)',
      scope: 'client',
      config: true,
      type: Boolean,
      default: true,
      onChange: () => {
        if(ui.BG3HOTBAR.components.portrait?.components?.healthContainer) {
            ui.BG3HOTBAR.components.portrait.components.healthContainer.render();
        }
      }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'enableHPControls', {
      name: 'BG3.Settings.EnableHPControls.Name',
      hint: 'BG3.Settings.EnableHPControls.Hint',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false,
      onChange: () => {
        if(ui.BG3HOTBAR.components.portrait?.components?.healthContainer) {
            ui.BG3HOTBAR.components.portrait.components.healthContainer.render();
        }
      }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'showDeathSavingThrow', {
        name: 'BG3.Settings.ShowDeathSavingThrow.Name',
        hint: 'BG3.Settings.ShowDeathSavingThrow.Hint',
        scope: 'world',
        config: true,
        type: String,
        choices: {
            'show': 'BG3.Settings.ShowDeathSavingThrow.Choices.show',
            'hide': 'BG3.Settings.ShowDeathSavingThrow.Choices.hide',
            'only': 'BG3.Settings.ShowDeathSavingThrow.Choices.only'
        },
        default: 'show',
        onChange: async value => {
            if(ui.BG3HOTBAR.components.portrait?.components?.deathSavesContainer) {
                await ui.BG3HOTBAR.components.portrait.components.deathSavesContainer.render();
                ui.BG3HOTBAR.components.portrait.components.deathSavesContainer.element.classList.toggle('death-only-skull', value === 'only');
            }
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'showExtraInfo', {
      name: 'Show extra datas on character portrait.',
      // hint: 'Display a extra container to for basic actions like dodge, dash, etc (Compatible with CPR)',
      scope: 'client',
      config: true,
      type: Boolean,
      default: false,
      onChange: () => {
        if(ui.BG3HOTBAR.components.portrait) {
            ui.BG3HOTBAR.components.portrait.toggleExtraInfos.bind(ui.BG3HOTBAR.components.portrait)();
        }
      }
    });
    
    game.settings.register(BG3CONFIG.MODULE_NAME, "dataExtraInfo", {
        scope: "client",
        config: false,
        type: Array,
        default: BG3CONFIG.EXTRAINFOS ?? [],
        onChange: () => {
            if (ui.BG3HOTBAR.components.portrait) {
                ui.BG3HOTBAR.components.portrait._renderInner();
            }
        },
    });

    game.settings.registerMenu(BG3CONFIG.MODULE_NAME, "menuExtraInfo", {
        name: 'Portrait extra datas settings',
        label: 'Configure Portait Extra Datas',
        hint: 'Extra datas to show on character portrait.',
        icon: "fas fa-cogs",
        type: ExtraInfosDialog,
        scope: 'client'
    });
    
    game.settings.register(BG3CONFIG.MODULE_NAME, 'defaultPortraitPreferences', {
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
            if (ui.BG3HOTBAR.components.portrait) {
                ui.BG3HOTBAR.components.portrait._renderInner();
            }
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'shapePortraitPreferences', {
        name: 'BG3.Settings.ShapePortraitPreferences.Name',
        hint: 'BG3.Settings.ShapePortraitPreferences.Hint',
        scope: 'client',
        config: true,
        type: String,
        choices: {
            'round': 'BG3.Settings.ShapePortraitPreferences.Round',
            'square': 'BG3.Settings.ShapePortraitPreferences.Square'
        },
        default: 'round',
        onChange: value => {
            // Refresh UI if it exists
            if (ui.BG3HOTBAR.components.portrait?.element) {
                ui.BG3HOTBAR.components.portrait.element.setAttribute("data-shape", value);
            }
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'borderPortraitPreferences', {
        name: 'BG3.Settings.BorderPortraitPreferences.Name',
        hint: 'BG3.Settings.BorderPortraitPreferences.Hint',
        scope: 'client',
        config: true,
        type: String,
        choices: {
            'none': 'BG3.Settings.BorderPortraitPreferences.None',
            'simple': 'BG3.Settings.BorderPortraitPreferences.Simple',
            'styled': 'BG3.Settings.BorderPortraitPreferences.Styled'
        },
        default: 'none',
        onChange: value => {
            // Refresh UI if it exists
            if (ui.BG3HOTBAR.components.portrait?.element) {
                ui.BG3HOTBAR.components.portrait.element.setAttribute("data-border", value);
            }
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'backgroundPortraitPreferences', {
        name: 'BG3.Settings.BackgroundPortraitPreferences.Name',
        hint: 'BG3.Settings.BackgroundPortraitPreferences.Hint',
        scope: 'client',
        config: true,
        type: String,
        subtype: 'color',
        default: '',
        onChange: () => {
            // Refresh UI if it exists
            if (ui.BG3HOTBAR.components.portrait) {
                ui.BG3HOTBAR.components.portrait.portraitsetImgBGColor.bind(ui.BG3HOTBAR.components.portrait)();
            }
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'overlayModePortrait', {
        name: 'BG3.Settings.OverlayModePortrait.Name',
        hint: 'BG3.Settings.OverlayModePortrait.Hint',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: () => {
            // Refresh UI if it exists
            if (ui.BG3HOTBAR.components.portrait) {
                ui.BG3HOTBAR.components.portrait.setPortraitBendMode.bind(ui.BG3HOTBAR.components.portrait)();
            }
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'showSheetSimpleClick', {
        name: 'Open character sheet on click',
        hint: 'Open the character sheet with a single click on portrait instead of double click.',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false
    });

    // Hotbar Settings
    game.settings.register(BG3CONFIG.MODULE_NAME, 'showItemNames', {
        name: 'Show Item Names',
        hint: 'Display item names below each hotbar item',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: value => {
            if (ui.BG3HOTBAR.element[0]) {
                ui.BG3HOTBAR.element[0].dataset.itemName = value;
            }
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'showItemUses', {
        name: 'Show Item Uses & Quantity',
        hint: 'Display remaining uses in the top-right corner of items and quantity  in the top-left corner',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {
            if (ui.BG3HOTBAR.element[0]) {
                ui.BG3HOTBAR.element[0].dataset.itemUse = value;
            }
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'highlightStyle', {
        name: 'BG3.Settings.HighlightStyle.Name',
        hint: 'BG3.Settings.HighlightStyle.Hint',
        scope: 'client',
        config: true,
        type: String,
        choices: {
            'bottom': 'BG3.Settings.HighlightStyle.Bottom',
            'border': 'BG3.Settings.HighlightStyle.Border'
        },
        default: 'border',
        onChange: value => {
            if (ui.BG3HOTBAR.element[0]) {
                ui.BG3HOTBAR.element[0].dataset.cellHighlight = value;
            }
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'enableWeaponAutoEquip', {
        name: 'BG3.Settings.EnableWeaponAutoEquip.Name',
        hint: 'BG3.Settings.EnableWeaponAutoEquip.Hint',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'showCombatContainer', {
        name: 'Add a basic actions container',
        hint: 'Display a extra container for basic actions like dodge, dash, etc (Compatible with CPR)',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {
            if(ui.BG3HOTBAR.components.weapon?.components.combat[0]?.element) ui.BG3HOTBAR.components.weapon.components.combat[0].element.classList.toggle('hidden', !value);
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'autoPopulateCombatContainer', {
        name: 'Autopopulate the basic actions container',
        hint: 'Auto-populate the basic actions with dodge, dash, etc (Compatible with CPR) for newly created tokens. Disable this will unlock the container.',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.registerMenu(BG3CONFIG.MODULE_NAME, "chooseCPRActions", {
        name: 'BG3.Settings.Menu.CPR.Name',
        label: 'BG3.Settings.Menu.CPR.Label',
        hint: 'BG3.Settings.Menu.CPR.Hint',
        icon: "fas fa-cog",
        type: CPRActionsDialog,
        scope: 'world',
        visible: () => {
            return false;
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'choosenCPRActions', {
        scope: 'client',
        config: false,
        type: Array,
        default: BG3CONFIG.DEFAULT_COMMON_ACTIONS
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'lockCombatContainer', {
        name: 'Lock the basic actions container',
        hint: 'Prevent users for removing the basic actions for the container.',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {
            if(ui.BG3HOTBAR.components.weapon?.components.combat[0]?.element) ui.BG3HOTBAR.components.weapon.components.combat[0].locked = value;
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'fadeControlsMenu', {
        name: 'Hide/Show hotbar controls menu on hover',
        // hint: 'Display remaining uses in the top-right corner of items',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: value => {
            const ctrlElem = document.querySelector('.bg3-control-container');
            if(ctrlElem) ctrlElem.classList.toggle('fade', value);
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'showRestTurnButton', {
        name: 'BG3.Settings.ShowRestTurnButton.Name',
        hint: 'BG3.Settings.ShowRestTurnButton.Hint',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: () => {
            if (ui.BG3HOTBAR.components.restTurn) {
                ui.BG3HOTBAR.components.restTurn.render();
            }
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'enableGMHotbar', {
        name: 'BG3.Settings.EnableGMHotbar.Name',
        hint: 'BG3.Settings.EnableGMHotbar.Hint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
        onChange: () => {
            if (!!ui.BG3HOTBAR && !ui.BG3HOTBAR.manager.currentTokenId) {
                ui.BG3HOTBAR.generate(null);
            }
        }
    });
    
    game.settings.register(BG3CONFIG.MODULE_NAME, 'gmHotbarData', {
        name: 'BG3.Settings.EnableGMHotbar.Name',
        hint: 'BG3.Settings.EnableGMHotbar.Hint',
        restricted: true,
        scope: 'world',
        config: false,
        type: Object,
        default: null
    });
    
    game.settings.register(BG3CONFIG.MODULE_NAME, 'gmHotbarInit', {
        scope: 'world',
        config: false,
        type: Boolean,
        default: false
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'hoverFilterShow', {
        name: 'BG3.Settings.HoverFilterShow.Name',
        hint: 'BG3.Settings.HoverFilterShow.Hint',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {
            if (ui.BG3HOTBAR.element?.[0]) {
                ui.BG3HOTBAR.element[0].dataset.filterHover = value;
            }
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'showExtendedFilter', {
        name: 'BG3.Settings.ShowExtendedFilter.Name',
        hint: 'BG3.Settings.ShowExtendedFilter.Hint',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: () => {
            if (ui.BG3HOTBAR.components?.container?.components?.filterContainer) {
                ui.BG3HOTBAR.components.container.components.filterContainer.updateExtendedFilter();
            }
        }
    });

    // Filter Settings

    // Auto-Population Settings
    /* game.settings.register(BG3CONFIG.MODULE_NAME, 'enforceSpellPreparationPC', {
        name: 'BG3.Settings.EnforceSpellPreparationPC.Name',
        hint: 'BG3.Settings.EnforceSpellPreparationPC.Hint',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'enforceSpellPreparationNPC', {
        name: 'BG3.Settings.EnforceSpellPreparationNPC.Name',
        hint: 'BG3.Settings.EnforceSpellPreparationNPC.Hint',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false
    }); */

    game.settings.register(BG3CONFIG.MODULE_NAME, 'autoPopulateLinkedTokens', {
        name: 'Auto-Populate Linked Tokens',
        hint: 'Automatically populate the hotbar for newly created linked tokens based on the settings below',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'autoPopulateUnlinkedTokens', {
        name: 'BG3.Settings.AutoPopulateUnlinkedTokens.Name',
        hint: 'BG3.Settings.AutoPopulateUnlinkedTokens.Hint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'container1AutoPopulate', {
        name: 'BG3.Settings.Container1AutoPopulate.Name',
        hint: 'BG3.Settings.Container1AutoPopulate.Hint',
        scope: 'world',
        config: false,
        type: Array,
        default: BG3CONFIG.AUTOPOPULATE_TYPES[0],
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'container2AutoPopulate', {
        name: 'BG3.Settings.Container2AutoPopulate.Name',
        hint: 'BG3.Settings.Container2AutoPopulate.Hint',
        scope: 'world',
        config: false,
        type: Array,
        default: BG3CONFIG.AUTOPOPULATE_TYPES[1],
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'container3AutoPopulate', {
        name: 'BG3.Settings.Container3AutoPopulate.Name',
        hint: 'BG3.Settings.Container3AutoPopulate.Hint',
        scope: 'world',
        config: false,
        type: Array,
        default: BG3CONFIG.AUTOPOPULATE_TYPES[2],
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'noActivityAutoPopulate', {
        name: 'Allow passives for auto-populate',
        hint: 'If activated, passives will be also added to hotbars.',
        scope: 'world',
        config: false,
        type: Boolean,
        default: false,
    });

    // Tooltip Settings
    game.settings.register(BG3CONFIG.MODULE_NAME, 'enableLightTooltip', {
        name: 'BG3.Settings.EnableLightTooltip.Name',
        hint: 'BG3.Settings.EnableLightTooltip.Hint',
        scope: 'client',
        config: true,
        type: String,
        choices: {
            'full': 'BG3.Settings.EnableLightTooltip.Choices.Full',
            'light': 'BG3.Settings.EnableLightTooltip.Choices.Light',
            'nodesc': 'BG3.Settings.EnableLightTooltip.Choices.NoDesc'
        },
        default: 'full',
        onChange: value => {
            document.body.dataset.lightTooltip = value;
        }
    });

    game.settings.register(BG3CONFIG.MODULE_NAME, 'tooltipDelay', {
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
            // BG3CONFIG.TOOLTIP_DELAY = value;
            // Tooltip delay changed
            TooltipManager.TOOLTIP_ACTIVATION_MS = value;
        }
    });

    /* game.settings.register(BG3CONFIG.MODULE_NAME, 'showMaterialDescription', {
        name: 'BG3.Settings.ShowMaterialDescription.Name',
        hint: 'BG3.Settings.ShowMaterialDescription.Hint',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: value => {
            document.body.dataset.showMaterials = value;
        }
    }); */

    game.settings.register(BG3CONFIG.MODULE_NAME, 'showDamageRanges', {
        name: 'BG3.Settings.ShowDamageRanges.Name',
        hint: 'BG3.Settings.ShowDamageRanges.Hint',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: value => {
            if(value === true) ui.BG3HOTBAR.tooltipManager._tooltipRangeDamage();
            else ui.BG3HOTBAR.tooltipManager._resetEnrichers(['damage']);
        }
    });

    // Midi QoL
    /* if(game.modules.get("midi-qol")?.active) {
        game.settings.register(BG3CONFIG.MODULE_NAME, 'synchroBRMidiQoL', {
            name: 'BG3.Settings.synchroMidiQoL.BR.Name',
            hint: 'BG3.Settings.synchroMidiQoL.BR.Hint',
            scope: 'client',
            config: true,
            type: Boolean,
            default: false,
            onChange: () => {
                if(ui.BG3HOTBAR.components?.container?.components?.filterContainer) ui.BG3HOTBAR.components.container.components.filterContainer._autoCheckUsed();
            }
        });

        game.settings.register(BG3CONFIG.MODULE_NAME, 'addAdvBtnsMidiQoL', {
            name: 'BG3.Settings.synchroMidiQoL.ADV.Name',
            hint: 'BG3.Settings.synchroMidiQoL.ADV.Hint',
            scope: 'client',
            config: true,
            type: Boolean,
            default: false,
            onChange: value => {
                if(ui.BG3HOTBAR.components?.advantage) {
                    if(value) ui.BG3HOTBAR.components.advantage._renderInner();
                    else ui.BG3HOTBAR.components.advantage.destroy();
                }
            }
        });
    } */

    game.settings.registerMenu(BG3CONFIG.MODULE_NAME, 'containerAutoPopulateSettings', {
        name: 'BG3.Settings.ContainerAutoPopulate.Name',
        label: 'BG3.Settings.ContainerAutoPopulate.Configure',
        icon: 'fas fa-tags',
        type: AutoPopulateSettings,
        restricted: true
    });

    // Lock System Settings
    game.settings.register(BG3CONFIG.MODULE_NAME, 'lockSettings', {
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
    
    game.settings.register(BG3CONFIG.MODULE_NAME, 'masterLockEnabled', {
        name: 'Master Lock State',
        hint: 'Whether the master lock is enabled',
        scope: 'client',
        config: false,
        type: Boolean,
        default: false
    });
    
    // Make sure settings are registered before hooks that might need them
    console.log(`${BG3CONFIG.MODULE_NAME} | Settings Registered`);
}

export function registerHandlebars() {
    Handlebars.registerHelper('bg3times', function(n, block) {
        var accum = '';
        for(var i = 0; i < n; ++i) {
            block.data.index = i;
            block.data.first = i === 0;
            block.data.last = i === (n - 1);
            accum += block.fn(this);
        }
        return accum;
    });
    
    if(!('includes' in Handlebars.helpers)) {
        Handlebars.registerHelper('includes', function(array, value) {
            return array?.includes(value) ?? false;
        });
    }

    if(!('math' in Handlebars.helpers)) {
        Handlebars.registerHelper('math', function(lvalue, operator, rvalue) {
            lvalue = parseFloat(lvalue);
            rvalue = parseFloat(rvalue);
            return {
                "+": lvalue + rvalue,
                "-": lvalue - rvalue,
                "*": lvalue * rvalue,
                "/": lvalue / rvalue,
                "%": lvalue % rvalue
            }[operator];
        });
    }

    if(!('switch' in Handlebars.helpers)) {
        /* {{#switch 'a'}} 
            {{#case 'a'}} A {{/case}} 
            {{#case 'b'}} B {{/case}} 
            {{#default '188'}} {{/default}}
        {{/switch}} */
        Handlebars.registerHelper('switch', function(value, options) {
            this.switch_value = value;
            this.switch_break = false;
            return options.fn(this);
        });
            
        Handlebars.registerHelper('case', function(value, options) {
            if (value == this.switch_value) {
                this.switch_break = true;
                return options.fn(this);
            }
        });
            
        Handlebars.registerHelper('default', function(value, options) {
            if (this.switch_break == false) {
                return value;
            }
        });
    }

    Handlebars.registerHelper('isdefined', function (value) {
        return value !== undefined;
    });
    
    Handlebars.registerHelper('ifIn', function(elem, list, options) {
        if(list.indexOf(elem) > -1) {
          return options.fn(this);
        }
        return options.inverse(this);
    });
}

export let patchFunc = (prop, func, type = "WRAPPER") => {
    let nonLibWrapper = () => {
        const oldFunc = eval(prop);
        eval(`${prop} = function (event) {
            return func.call(this, ${type != "OVERRIDE" ? "oldFunc.bind(this)," : ""} ...arguments);
        }`);
    }
    if (game.modules.get("lib-wrapper")?.active) {
        try {
            libWrapper.register("po0lp-personal-module", prop, func, type);
        } catch (e) {
            nonLibWrapper();
        }
    } else {
        nonLibWrapper();
    }
}