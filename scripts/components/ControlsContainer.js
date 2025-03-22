import { CONFIG } from '../utils/config.js';
import { BG3Hotbar } from '../bg3-hotbar.js';

export class ControlsContainer {
    constructor(ui) {
        this.ui = ui;
        this.element = null;
        this._createControlColumn();
    }

    _createControlColumn() {
        // Create the control column container
        this.element = document.createElement('div');
        this.element.classList.add('hotbar-control-column');
        
        // Add Row button
        const addRowButton = this._createButton('fa-plus', 'Add Row', () => {
            this.ui.gridContainers.forEach(container => {
                container.data.rows++;
                container.render();
            });
            this.ui.manager.persist();
        });

        // Remove Row button
        const removeRowButton = this._createButton('fa-minus', 'Remove Row', () => {
            if (this.ui.gridContainers[0].data.rows > 1) {
                this.ui.gridContainers.forEach(container => {
                    container.data.rows--;
                    container.render();
                });
                this.ui.manager.persist();
            } else {
                removeRowButton.classList.add('disabled');
            }
        });

        // Lock button
        const lockButton = this._createLockButton();

        // Settings button
        const settingsButton = this._createButton('fa-cog', 'Settings', () => {
            this._showSettingsMenu(settingsButton);
        });
        
        // Add click event to the settings icon as well
        const settingsIcon = settingsButton.querySelector('i');
        if (settingsIcon) {
            settingsIcon.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent double triggering
                this._showSettingsMenu(settingsButton);
            });
        }

        // Add buttons to column
        this.element.appendChild(addRowButton);
        this.element.appendChild(removeRowButton);
        this.element.appendChild(lockButton);
        this.element.appendChild(settingsButton);

        // Add the column to the hotbar container
        this.ui.subContainer.appendChild(this.element);
    }

    _createButton(iconClass, title, clickHandler) {
        const button = document.createElement('div');
        button.classList.add('hotbar-control-button');
        
        const icon = document.createElement('i');
        icon.className = `fas ${iconClass}`;
        button.appendChild(icon);
        
        button.title = title;
        button.addEventListener('click', clickHandler);
        
        return button;
    }

    _createLockButton() {
        const lockButton = this._createButton(
            'fa-unlock', // Default to unlocked
            'Lock hotbar settings (Right-click for options)',
            () => this._handleLockClick(lockButton)
        );

        // Set initial state based on settings
        this.refreshLockButton(lockButton);

        // Listen for master lock changes
        BG3Hotbar.controlsManager.onMasterLockChanged((isEnabled) => {
            this.refreshLockButton(lockButton);
        });

        // Add context menu event to both the button and its icon
        const handleContextMenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this._showLockContextMenu(lockButton);
        };
        
        lockButton.addEventListener('contextmenu', handleContextMenu);
        
        // Also add the event to the icon when it's created or updated
        const addIconEvent = () => {
            const icon = lockButton.querySelector('i');
            if (icon) {
                icon.addEventListener('contextmenu', handleContextMenu);
            }
        };
        
        // Add event to the initial icon
        addIconEvent();
        
        // Add event to any new icons created during refresh
        BG3Hotbar.controlsManager.onMasterLockChanged(addIconEvent);

        return lockButton;
    }

    _showLockContextMenu(lockButton) {
        // Use the ControlsManager to toggle the menu
        BG3Hotbar.controlsManager.toggleMenu(
            'lockMenu', 
            lockButton, 
            () => {
                // Create the menu
                const menu = document.createElement('div');
                menu.classList.add('bg3-hud', 'lock-context-menu', 'visible');
                
                // Position the menu relative to the lock button
                const buttonRect = lockButton.getBoundingClientRect();
                menu.style.position = 'absolute';
                menu.style.left = `${buttonRect.width + 8}px`; // 8px gap
                menu.style.bottom = '0';
                menu.style.zIndex = '1000';
                
                // Get menu items from ControlsManager
                const items = BG3Hotbar.controlsManager.getLockMenuItems();
                
                items.forEach(item => {
                    const menuItem = document.createElement('div');
                    menuItem.classList.add('bg3-hud', 'menu-item');
                    menuItem.title = item.hint;
                    
                    // Create icon
                    const icon = document.createElement('i');
                    icon.className = `fas ${item.icon} menu-item-icon`;
                    menuItem.appendChild(icon);
                    
                    // Create label
                    const label = document.createElement('span');
                    label.className = 'menu-item-label';
                    label.textContent = item.name;
                    menuItem.appendChild(label);
                    
                    // Create checkbox
                    const isSelected = BG3Hotbar.controlsManager.isLockSettingEnabled(item.key);
                    const checkbox = document.createElement('div');
                    checkbox.className = `menu-item-checkbox ${isSelected ? 'checked' : ''}`;
                    
                    if (isSelected) {
                        const checkIcon = document.createElement('i');
                        checkIcon.className = 'fas fa-check';
                        checkbox.appendChild(checkIcon);
                    }
                    
                    menuItem.appendChild(checkbox);
                    
                    menuItem.addEventListener('click', (e) => {
                        e.stopPropagation();
                        
                        // Toggle the setting
                        const anySelected = BG3Hotbar.controlsManager.toggleLockSetting(item.key);
                        
                        // Update checkbox
                        const isNowSelected = BG3Hotbar.controlsManager.isLockSettingEnabled(item.key);
                        checkbox.classList.toggle('checked', isNowSelected);
                        
                        // Update checkbox icon
                        checkbox.innerHTML = '';
                        if (isNowSelected) {
                            const checkIcon = document.createElement('i');
                            checkIcon.className = 'fas fa-check';
                            checkbox.appendChild(checkIcon);
                        }
                        
                        // Refresh the lock button
                        this.refreshLockButton(lockButton);
                        
                        // Handle specific settings
                        if (item.key === 'opacity') {
                            this.ui.updateOpacity();
                        }
                        if (item.key === 'deselect' && !BG3Hotbar.controlsManager.isLockSettingEnabled('deselect') && !canvas.tokens.controlled.length) {
                            this.ui.destroy();
                            this.ui.manager.currentTokenId = null;
                        }
                    });
                    
                    menu.appendChild(menuItem);
                });
                
                return menu;
            },
            // Callback when menu is closed
            () => {
                // Refresh lock button state when menu closes
                this.refreshLockButton(lockButton);
            }
        );
    }

    _handleLockClick(lockButton) {
        // If no options are selected, show warning
        const hasSelectedOptions = BG3Hotbar.controlsManager.hasAnyLockSettings();
        if (!hasSelectedOptions) {
            ui.notifications.warn("Please right-click the lock button to select which settings to lock.");
            return;
        }

        // Toggle the master lock
        BG3Hotbar.controlsManager.toggleMasterLock();
        
        // Button appearance is updated via the master lock change callback
    }

    /**
     * Refresh the lock button state based on current settings
     * @param {HTMLElement} lockButton - The lock button element to refresh
     */
    refreshLockButton(lockButton) {
        const anySelected = BG3Hotbar.controlsManager.hasAnyLockSettings();
        const isMasterLockEnabled = BG3Hotbar.controlsManager.isMasterLockEnabled();
        
        // Update icon - show lock icon if master lock is enabled
        lockButton.querySelector('i').className = `fas ${isMasterLockEnabled ? 'fa-lock' : 'fa-unlock'}`;
        
        // Update class - add 'locked' class if master lock is enabled
        lockButton.classList.toggle('locked', isMasterLockEnabled);
    }

    _showSettingsMenu(button) {
        // Use the ControlsManager to toggle the menu
        BG3Hotbar.controlsManager.toggleMenu('settingsMenu', button, () => {
            // Create the menu
            const menu = document.createElement('div');
            menu.classList.add('bg3-hud', 'menu-container', 'visible');
            
            // Position the menu relative to the settings button
            const buttonRect = button.getBoundingClientRect();
            menu.style.position = 'absolute';
            menu.style.left = `${buttonRect.width + 8}px`; // 8px gap
            menu.style.bottom = '0';
            menu.style.zIndex = '1000';
            
            // Get menu items from ControlsManager
            const menuItems = BG3Hotbar.controlsManager.getSettingsMenuItems();
            
            menuItems.forEach(item => {
                if (item.type === 'divider') {
                    const divider = document.createElement('div');
                    divider.classList.add('menu-divider');
                    menu.appendChild(divider);
                    return;
                }
                
                const menuItem = document.createElement('div');
                menuItem.classList.add('menu-item');
                
                // Create icon
                const icon = document.createElement('i');
                icon.className = `fas ${item.icon} menu-item-icon`;
                menuItem.appendChild(icon);
                
                // Create label
                const label = document.createElement('span');
                label.className = 'menu-item-label';
                label.textContent = item.label;
                menuItem.appendChild(label);
                
                menuItem.addEventListener('click', () => {
                    // Call the appropriate method on the UI
                    this.ui[item.action]();
                    
                    // Close the menu
                    BG3Hotbar.controlsManager.closeAllMenus();
                });
                
                menu.appendChild(menuItem);
            });
            
            return menu;
        });
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
} 