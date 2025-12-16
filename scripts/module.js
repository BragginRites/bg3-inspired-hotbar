// Module Lifecycle Management
import { BG3Hotbar } from './bg3-hotbar.js';
import { BG3CONFIG, registerKeybinding, updateSettingsDisplay, registerEarly, registerSettings, registerHandlebars, registerLibWrapper } from './utils/config.js';
import { registerCompat } from './compat/index.js';

import { showDeprecationWarning } from './components/DeprecationWarning.js';

Hooks.once('init', () => {
    registerEarly();
    registerHandlebars();
    registerKeybinding();
    registerLibWrapper();

    // Register deprecation warning setting
    game.settings.register("bg3-inspired-hotbar", "suppressDeprecationWarning", {
        name: "Suppress Deprecation Warning",
        hint: "Suppress the warning that this module is deprecated.",
        scope: "client",
        config: true,
        type: Boolean,
        default: false
    });
});

Hooks.once('ready', () => {
    console.log(`${BG3CONFIG.MODULE_NAME} | Ready`);
    if (!game.modules.get('lib-wrapper')?.active && game.user.isGM) {
        ui.notifications.error("BG3 Inspired Hotbar requires the 'libWrapper' module. Please install and activate it.");
    }
    console.log(`${BG3CONFIG.MODULE_NAME} | Registering Settings`);
    registerSettings();
    updateSettingsDisplay();
    registerCompat();
    ui.BG3HOTBAR = new BG3Hotbar();

    // Show deprecation warning if not suppressed
    if (!game.settings.get("bg3-inspired-hotbar", "suppressDeprecationWarning")) {
        showDeprecationWarning();
    }

    // Temp Fix for compendium macros
    (async () => {
        const compendium = await game.packs.get("bg3-inspired-hotbar.bg3-inspired-hud");
        if (compendium?.ownership && compendium?.ownership?.['PLAYER'] !== 'LIMITED') {
            compendium.configure({ ownership: { ...compendium.ownership, ...{ 'PLAYER': 'LIMITED' } } });
        }
    })()
});

// CONFIG.debug.hooks = true;