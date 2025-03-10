import { CONFIG } from '../utils/config.js';

/**
 * Manages all control settings for the BG3 Inspired Hotbar module
 */
export class ControlsManager {
    constructor() {
        // Initialize settings
        this._lockSettings = game.settings.get(CONFIG.MODULE_NAME, 'lockSettings');
        this._masterLockEnabled = game.settings.get(CONFIG.MODULE_NAME, 'masterLockEnabled');
        this._savedLockSettings = { ...this._lockSettings };
        
        // Track active menus
        this._activeMenus = {
            lockMenu: null,
            settingsMenu: null
        };
        
        // Set up event callbacks
        this.callbacks = {
            lockSettingsChanged: [],
            masterLockChanged: []
        };
    }

    /**
     * Get the current lock settings
     * @returns {Object} The current lock settings
     */
    getLockSettings() {
        return { ...this._lockSettings };
    }

    /**
     * Check if any lock settings are enabled
     * @returns {boolean} True if any lock settings are enabled
     */
    hasAnyLockSettings() {
        return Object.values(this._lockSettings).some(v => v);
    }

    /**
     * Check if a specific lock setting is enabled
     * @param {string} key - The setting key to check
     * @returns {boolean} True if the setting is enabled
     */
    isLockSettingEnabled(key) {
        return this._lockSettings[key] === true;
    }

    /**
     * Check if the master lock is enabled
     * @returns {boolean} True if the master lock is enabled
     */
    isMasterLockEnabled() {
        return this._masterLockEnabled;
    }

    /**
     * Toggle the master lock state
     * @returns {boolean} The new master lock state
     */
    toggleMasterLock() {
        if (this._masterLockEnabled) {
            // Turning off - just update the master lock state
            // but keep the settings as they are
            this._masterLockEnabled = false;
        } else {
            // Turning on - just update the master lock state
            // settings are already preserved
            this._masterLockEnabled = true;
        }
        
        // Save to game settings
        game.settings.set(CONFIG.MODULE_NAME, 'masterLockEnabled', this._masterLockEnabled);
        
        // Notify listeners
        this._notifyMasterLockChanged();
        
        return this._masterLockEnabled;
    }

    /**
     * Update a specific lock setting
     * @param {string} key - The setting key to update
     * @param {boolean} value - The new value
     */
    updateLockSetting(key, value) {
        const newSettings = { ...this._lockSettings };
        newSettings[key] = value;
        
        // Save to game settings
        game.settings.set(CONFIG.MODULE_NAME, 'lockSettings', newSettings);
        
        // Update local copy
        this._lockSettings = newSettings;
        this._savedLockSettings = { ...newSettings };
        
        // If we're enabling a setting, also enable the master lock
        if (value && !this._masterLockEnabled) {
            this._masterLockEnabled = true;
            game.settings.set(CONFIG.MODULE_NAME, 'masterLockEnabled', this._masterLockEnabled);
            this._notifyMasterLockChanged();
        }
        
        // If we're disabling the last setting, also disable the master lock
        if (!this.hasAnyLockSettings() && this._masterLockEnabled) {
            this._masterLockEnabled = false;
            game.settings.set(CONFIG.MODULE_NAME, 'masterLockEnabled', this._masterLockEnabled);
            this._notifyMasterLockChanged();
        }
        
        // Notify listeners
        this._notifyLockSettingsChanged();
        
        return this.hasAnyLockSettings();
    }

    /**
     * Toggle a specific lock setting
     * @param {string} key - The setting key to toggle
     * @returns {boolean} True if any lock settings are enabled after the toggle
     */
    toggleLockSetting(key) {
        return this.updateLockSetting(key, !this._lockSettings[key]);
    }

    /**
     * Get the lock menu items configuration
     * @returns {Array} Array of lock menu items
     */
    getLockMenuItems() {
        return [
            {
                name: 'Deselecting Token',
                key: 'deselect',
                icon: 'fa-user-slash',
                hint: 'Keep hotbar visible when no token is selected'
            },
            {
                name: 'Opacity',
                key: 'opacity',
                icon: 'fa-eye',
                hint: 'Prevent opacity changes when mouse moves away'
            },
            {
                name: 'Drag & Drop',
                key: 'dragDrop',
                icon: 'fa-arrows-alt',
                hint: 'Prevent moving items in the hotbar'
            }
        ];
    }

    /**
     * Get the settings menu items configuration
     * @returns {Array} Array of settings menu items
     */
    getSettingsMenuItems() {
        return [
            { 
                label: game.i18n.localize("BG3.Hotbar.SettingsMenu.ResetLayout"), 
                action: 'resetLayout', 
                icon: 'fa-rotate' 
            },
            { 
                label: game.i18n.localize("BG3.Hotbar.SettingsMenu.ClearAllItems"), 
                action: 'clearAllItems', 
                icon: 'fa-trash' 
            },
            { 
                type: 'divider' 
            },
            { 
                label: game.i18n.localize("BG3.Hotbar.SettingsMenu.ImportLayout"), 
                action: 'importLayout', 
                icon: 'fa-file-import' 
            },
            { 
                label: game.i18n.localize("BG3.Hotbar.SettingsMenu.ExportLayout"), 
                action: 'exportLayout', 
                icon: 'fa-file-export' 
            }
        ];
    }

    /**
     * Register a callback for when lock settings change
     * @param {Function} callback - The function to call when lock settings change
     */
    onLockSettingsChanged(callback) {
        this.callbacks.lockSettingsChanged.push(callback);
    }

    /**
     * Register a callback for when master lock state changes
     * @param {Function} callback - The function to call when master lock state changes
     */
    onMasterLockChanged(callback) {
        this.callbacks.masterLockChanged.push(callback);
    }

    /**
     * Remove a callback for lock settings changes
     * @param {Function} callback - The callback to remove
     */
    offLockSettingsChanged(callback) {
        const index = this.callbacks.lockSettingsChanged.indexOf(callback);
        if (index !== -1) {
            this.callbacks.lockSettingsChanged.splice(index, 1);
        }
    }

    /**
     * Remove a callback for master lock state changes
     * @param {Function} callback - The callback to remove
     */
    offMasterLockChanged(callback) {
        const index = this.callbacks.masterLockChanged.indexOf(callback);
        if (index !== -1) {
            this.callbacks.masterLockChanged.splice(index, 1);
        }
    }

    /**
     * Notify all listeners that lock settings have changed
     * @private
     */
    _notifyLockSettingsChanged() {
        const settings = this.getLockSettings();
        const hasAny = this.hasAnyLockSettings();
        
        this.callbacks.lockSettingsChanged.forEach(callback => {
            callback(settings, hasAny);
        });
    }

    /**
     * Notify all listeners that master lock state has changed
     * @private
     */
    _notifyMasterLockChanged() {
        const isEnabled = this.isMasterLockEnabled();
        
        this.callbacks.masterLockChanged.forEach(callback => {
            callback(isEnabled);
        });
    }

    /**
     * Toggle a menu's visibility
     * @param {string} menuType - The type of menu ('lockMenu' or 'settingsMenu')
     * @param {HTMLElement} button - The button that triggered the menu
     * @param {Function} createMenuFn - Function to create the menu if it doesn't exist
     * @param {Function} [onClose] - Optional callback to call when the menu is closed
     * @returns {HTMLElement|null} The menu element or null if it was closed
     */
    toggleMenu(menuType, button, createMenuFn, onClose) {
        // Check if this specific menu is already open
        if (this._activeMenus[menuType] && this._activeMenus[menuType].parentNode === button) {
            // If menu is already open on this button, close it
            this._activeMenus[menuType].remove();
            this._activeMenus[menuType] = null;
            if (onClose) onClose();
            return null;
        }
        
        // Close any existing menus of this type
        this.closeAllMenus(onClose);
        
        // Create and show the new menu
        const menu = createMenuFn();
        button.appendChild(menu);
        this._activeMenus[menuType] = menu;
        
        // Set up a click handler to close the menu when clicking outside
        const closeMenu = (e) => {
            // Check if the click is on the menu, the button, or any of their children
            if (!menu.contains(e.target) && !button.contains(e.target)) {
                menu.remove();
                document.removeEventListener('mousedown', closeMenu);
                this._activeMenus[menuType] = null;
                if (onClose) onClose();
            }
        };
        document.addEventListener('mousedown', closeMenu);
        
        return menu;
    }
    
    /**
     * Close all open menus
     * @param {Function} [onClose] - Optional callback to call when menus are closed
     */
    closeAllMenus(onClose) {
        // Close lock menu if open
        if (this._activeMenus.lockMenu) {
            this._activeMenus.lockMenu.remove();
            this._activeMenus.lockMenu = null;
        }
        
        // Close settings menu if open
        if (this._activeMenus.settingsMenu) {
            this._activeMenus.settingsMenu.remove();
            this._activeMenus.settingsMenu = null;
        }
        
        if (onClose) onClose();
    }
} 