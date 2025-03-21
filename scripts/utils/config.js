// Configuration constants for the BG3 Hotbar

export const CONFIG = {
    // UI Constants
    CELL_SIZE: 50,
    INITIAL_COLS: 5,
    ROWS: 3,
    DRAG_THRESHOLD: 40, // 80% of cell width
    TOOLTIP_DELAY: 500, // Default tooltip delay in ms
    
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
    MODULE_NAME: "bg3-inspired-hotbar",
    
    // Styling
    COLORS: {
        ACTION: "#2ecc71",     // vibrant green
        BONUS: "#e67e22",      // vibrant orange
        REACTION: "#fe85f6",   // vibrant lavender
        DEFAULT: "#cccccc",
        PACT_MAGIC: "#8e44ad", // deep purple
        SPELL_SLOT: "#3498db",
        CANTRIP: "#27ae60",    // deep green
        PROFICIENT: "#4da6ff", // blue (same as spell slot)
        BACKGROUND: "#1e1e1e",
        BACKGROUND_LIGHT: "#2e2e2e",
        BACKGROUND_HIGHLIGHT: "#3e3e3e",
        BACKGROUND_ACTIVE: "#4e4e4e",
        BORDER: "#444444",
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

    // Themes
    THEME: {
        /* gold: [
            "#bg3-hotbar-container {color: red;}",
            ".bg3-hotbar-subcontainer {color: yellow}"
        ], */
        gold: {
            ":root": {
                "--primary-border-width": "2px",
                "--primary-border-color": "#b78846",
                "--bg3-border": "#161616",
                "--shadow-text-stroke": "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                "--bg3-portrait-size": "175px"
            },
            "img": {
                border: "unset"
            },
            ".bg3-hud .bg3-hotbar-subcontainer": {
                padding: "2px 6px"
            },
            ".bg3-hud .hotbar-subcontainer": {
                width: "var(--cols-override, calc(var(--cols) * (var(--cell-size) + 1px) + 8px))",
                background: "#222222f2",
                gap: "1px"
            },
            ".bg3-hud .passives-container, .bg3-hud .effects-container": {
                bottom: "calc(100% + var(--primary-border-width))",
                top: "unset",
                background: "unset",
                border: "unset",
                padding: "0",
                gap: "0"
            },
            ".bg3-hud .passive-feature-icon img, .bg3-hud .active-effect-icon img": {
                width: "36px",
                height: "36px",
                border: "1px solid var(--color-border-dark)",
                "background-color": "var(--bg3-background)"
            },
            ".bg3-hud .filter-container": {
                bottom: "calc(100% - 5px)"
            },
            ".bg3-hud .hotbar-cell": {
                width: "var(--cell-size)",
                height: "var(--cell-size)"
            },
            ".bg3-hud .hotbar-item-uses": {
                "text-shadow": "var(--shadow-text-stroke)"
            },
            ".bg3-hud .hotbar-item": {
                "object-fit": "contain",
                width: "100%",
                height: "100%"
            },
            ".bg3-hud .hotbar-control-column": {
                left: "calc(100% + -7px)"
            },
            ".bg3-hud .hotbar-control-button": {
                "border-radius": "50%"
            },
            ".bg3-hud .hotbar-control-button, .bg3-hud .rest-turn-button, .bg3-hud .bg3-weapon-container .hotbar-cell, #bg3-combat-container": {
                border: "var(--primary-border-width) solid var(--primary-border-color)"
            },
            ".bg3-hud .rest-turn-container": {
                "margin-left": "20px",
                "min-height": "168px"
            },
            ".bg3-hud .damage-overlay": {
                top: "unset",
                bottom: "0",
                "border-radius": "unset"
            },
            ".bg3-hud .hp-text": {
                bottom: "25px",
                "z-index": "20",
                "text-shadow": "var(--shadow-text-stroke)"
            },
            ".bg3-hud .portrait-card .extra-info": {
                "text-shadow": "var(--shadow-text-stroke)"
            },
            ".bg3-hud .ability-button": {
                width: "40px",
                height: "40px",
                "font-size": "var(--font-size-20)",
                top: "-20px"
            },
            ".bg3-hud .spell-level-label": {
                "text-shadow": "var(--shadow-text-stroke)"
            },
            ".bg3-hud .action-type-button, .bg3-hud .feature-button, .bg3-hud .spell-level-button": {
                "box-shadow": "0px 0px 5px black"
            }
        },
        custom: []
    }
};

/**
 * Helper function to determine token linkage status
 * @param {Actor} actor - The actor to check
 * @param {string} tokenId - The token ID to check
 * @returns {boolean} - Whether the token is considered linked
 */
export function isTokenLinked(actor, tokenId) {
    // Get the token from the canvas
    const token = canvas.tokens.get(tokenId);
    
    // If we have a token, check its document's actorLink property
    if (token) {
        return token.document.actorLink;
    }
    
    // If no token found, assume it's linked if it's not a synthetic token actor
    return !actor.isToken;
}

/**
 * Helper function to determine if spell preparation should be enforced
 * @param {Actor} actor - The actor to check
 * @param {string} tokenId - The token ID to check
 * @returns {boolean} - Whether spell preparation should be enforced
 */
export function shouldEnforceSpellPreparation(actor, tokenId) {
    const isLinked = isTokenLinked(actor, tokenId);
    
    // Debug log to help track issues
    console.debug("BG3 Inspired Hotbar | Spell preparation check:", {
        actorId: actor.id,
        actorName: actor.name,
        tokenId: tokenId,
        isLinked: isLinked,
        setting: isLinked ? 'PC' : 'NPC'
    });

    // If linked token (including PCs) - use PC setting
    if (isLinked) {
        return game.settings.get(CONFIG.MODULE_NAME, 'enforceSpellPreparationPC');
    }
    
    // If unlinked token - use NPC setting
    return game.settings.get(CONFIG.MODULE_NAME, 'enforceSpellPreparationNPC');
}