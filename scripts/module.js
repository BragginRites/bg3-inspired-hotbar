// Module Lifecycle Management
import { BG3Hotbar } from './bg3-hotbar.js';
import { BG3CONFIG, registerKeybinding, updateSettingsDisplay, registerEarly, registerSettings, registerHandlebars, registerLibWrapper } from './utils/config.js';

Hooks.once('init', () => {
    registerEarly();
    registerHandlebars();
    registerKeybinding();
    registerLibWrapper();
});

Hooks.once('ready', () => {
    console.log(`${BG3CONFIG.MODULE_NAME} | Ready`);
    if (!game.modules.get('lib-wrapper')?.active && game.user.isGM) {
        ui.notifications.error("BG3 Inspired Hotbar requires the 'libWrapper' module. Please install and activate it.");
    }
    console.log(`${BG3CONFIG.MODULE_NAME} | Registering Settings`);
    registerSettings();
    updateSettingsDisplay();
    ui.BG3HOTBAR = new BG3Hotbar();
});

// CONFIG.debug.hooks = true;