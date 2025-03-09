import { CONFIG } from '../utils/config.js';

export class SettingsMenu {
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
        const lockButton = this._createButton(
            Object.values(this.ui._lockSettings).some(v => v) ? 'fa-lock' : 'fa-unlock',
            'Lock hotbar settings (Right-click for options)',
            () => this._handleLockClick(lockButton)
        );
        if (Object.values(this.ui._lockSettings).some(v => v)) lockButton.classList.add('locked');
        lockButton.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this._showLockContextMenu(e, lockButton);
        });

        // Settings button
        const settingsButton = this._createButton('fa-cog', 'Settings', () => this._showSettingsMenu(settingsButton));

        // Add buttons to column
        this.element.appendChild(addRowButton);
        this.element.appendChild(removeRowButton);
        this.element.appendChild(lockButton);
        this.element.appendChild(settingsButton);

        // Add the column to the hotbar container
        this.ui.element.appendChild(this.element);
    }

    _createButton(iconClass, title, clickHandler) {
        const button = document.createElement('div');
        button.classList.add('hotbar-control-button');
        button.innerHTML = `<i class="fas ${iconClass}"></i>`;
        button.title = title;
        button.addEventListener('click', clickHandler);
        
        return button;
    }

    _showLockContextMenu(event, lockButton) {
        event.preventDefault();
        event.stopPropagation();

        // Remove any existing context menu
        const existingMenu = document.querySelector('.lock-context-menu');
        if (existingMenu) existingMenu.remove();

        // Create context menu
        const menu = document.createElement('div');
        menu.classList.add('lock-context-menu', 'visible');

        // Create menu items
        const items = [
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

        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.classList.add('menu-item');
            menuItem.title = item.hint;
            
            const isSelected = this.ui._lockSettings[item.key];
            menuItem.innerHTML = `
                <i class="fas ${item.icon} menu-item-icon"></i>
                <span class="menu-item-label">${item.name}</span>
                <div class="menu-item-checkbox ${isSelected ? 'checked' : ''}">
                    ${isSelected ? '<i class="fas fa-check"></i>' : ''}
                </div>
            `;

            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Toggle selection state without applying the lock
                this.ui._lockSettings[item.key] = !this.ui._lockSettings[item.key];
                
                // Update checkbox display
                const checkbox = menuItem.querySelector('.menu-item-checkbox');
                if (this.ui._lockSettings[item.key]) {
                    checkbox.classList.add('checked');
                    checkbox.innerHTML = '<i class="fas fa-check"></i>';
                } else {
                    checkbox.classList.remove('checked');
                    checkbox.innerHTML = '';
                }

                // Save settings
                game.settings.set(CONFIG.MODULE_NAME, 'lockSettings', this.ui._lockSettings);

                // Update lock button appearance based on if any options are selected
                const anySelected = Object.values(this.ui._lockSettings).some(v => v);
                if (anySelected) {
                    lockButton.classList.add('has-selection');
                } else {
                    lockButton.classList.remove('has-selection');
                }
            });

            menu.appendChild(menuItem);
        });

        // Add menu to button wrapper
        lockButton.appendChild(menu);

        // Close menu when clicking outside
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && e.target !== lockButton) {
                menu.remove();
                document.removeEventListener('mousedown', closeMenu);
            }
        };
        document.addEventListener('mousedown', closeMenu);
    }

    _handleLockClick(lockButton) {
        // Check if any lock settings are selected
        const hasSelectedOptions = Object.values(this.ui._lockSettings).some(v => v);
        
        if (!hasSelectedOptions && !this.ui._isLocked) {
            ui.notifications.warn("Please right-click the lock button to select which settings to lock.");
            return;
        }

        // Toggle the overall lock state
        this.ui._isLocked = !this.ui._isLocked;
        this.ui.manager._isLocked = this.ui._isLocked;
        
        // Update button appearance
        if (this.ui._isLocked) {
            lockButton.innerHTML = '<i class="fas fa-lock"></i>';
            lockButton.classList.add('locked');
        } else {
            lockButton.innerHTML = '<i class="fas fa-unlock"></i>';
            lockButton.classList.remove('locked');
            
            // If no token is selected and deselect lock is off, hide the hotbar
            if (!canvas.tokens.controlled.length && !this.ui._lockSettings.deselect) {
                this.ui.destroy();
                this.ui.manager.currentTokenId = null;
            }
        }
        
        // Save the settings
        game.settings.set(CONFIG.MODULE_NAME, 'lockSettings', this.ui._lockSettings);
    }

    _showSettingsMenu(button) {
        const menu = document.createElement('div');
        menu.classList.add('settings-menu', 'visible');

        const menuItems = [
            { label: game.i18n.localize("BG3.Hotbar.SettingsMenu.ResetLayout"), action: () => this.ui.resetLayout(), icon: 'fa-rotate' },
            { label: game.i18n.localize("BG3.Hotbar.SettingsMenu.ClearAllItems"), action: () => this.ui.clearAllItems(), icon: 'fa-trash' },
            { type: 'divider' },
            { label: game.i18n.localize("BG3.Hotbar.SettingsMenu.ImportLayout"), action: () => this.ui.importLayout(), icon: 'fa-file-import' },
            { label: game.i18n.localize("BG3.Hotbar.SettingsMenu.ExportLayout"), action: () => this.ui.exportLayout(), icon: 'fa-file-export' }
        ];

        menuItems.forEach(item => {
            if (item.type === 'divider') {
                const divider = document.createElement('div');
                divider.classList.add('settings-menu-divider');
                menu.appendChild(divider);
                return;
            }

            const menuItem = document.createElement('div');
            menuItem.classList.add('menu-item');
            menuItem.innerHTML = `
                <i class="fas ${item.icon} settings-menu-item-icon"></i>
                <span class="settings-menu-item-label">${item.label}</span>
            `;
            menuItem.addEventListener('click', () => {
                item.action();
                menu.remove();
            });
            menu.appendChild(menuItem);
        });

        button.appendChild(menu);

        // Close menu when clicking outside
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && e.target !== button) {
                menu.remove();
                document.removeEventListener('mousedown', closeMenu);
            }
        };
        document.addEventListener('mousedown', closeMenu);
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
} 