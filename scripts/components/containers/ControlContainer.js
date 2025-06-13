import { BaseButton } from "../buttons/BaseButton.js";
import { BG3Component } from "../component.js";
import { BG3CONFIG } from "../../utils/config.js";
import { MenuContainer } from "./MenuContainer.js";
import { ControlsManager } from "../../managers/ControlsManager.js";

export class ControlContainer extends BG3Component {
    constructor(data) {
        super(data);
    }

    get classes() {
        return [...["bg3-control-container"], ...(game.settings.get(BG3CONFIG.MODULE_NAME, 'masterLockEnabled')) ? ['locked'] : []]
    }

    get btnData() {
        const buttons = [
            this._getAddRowButton(),
            this._getRemoveRowButton(),
            this._getLockButton(),
            this._getSettingsButton()
        ];

        if (this._shouldShowGMHotbarToggle()) {
            buttons.unshift(this._getGMHotbarToggleButton());
        }

        return buttons;
    }

    _getAddRowButton() {
        return {
            type: 'div',
            key: 'controlPlus',
            class: ["hotbar-control-button"],
            icon: 'fa-plus',
            title: 'Add Row',
            events: {
                'click': () => {
                    ui.BG3HOTBAR.components.container.components.hotbar.forEach(c => {
                        c.data.rows++;
                        c.render();
                    });
                    ui.BG3HOTBAR.manager.persist();
                }
            }
        };
    }

    _getRemoveRowButton() {
        return {
            type: 'div',
            key: 'controlMinus',
            class: ["hotbar-control-button"],
            icon: 'fa-minus',
            title: 'Remove Row',
            events: {
                'click': () => {
                    if (ui.BG3HOTBAR.components.container.components.hotbar[0].data.rows > 1) {
                        ui.BG3HOTBAR.components.container.components.hotbar.forEach(c => {
                            c.data.rows--;
                            c.render();
                        });
                        ui.BG3HOTBAR.manager.persist();
                    }
                }
            }
        };
    }

    _getLockButton() {
        return {
            type: 'div',
            key: 'controlLock',
            class: [
                "hotbar-control-button",
                ...(game.settings.get(BG3CONFIG.MODULE_NAME, 'masterLockEnabled') ? ['locked'] : [])
            ],
            icon: 'fa-unlock',
            title: 'Lock hotbar settings<br>(Right-click for options)',
            hasChildren: true,
            events: {
                'click': () => {
                    const settings = game.settings.get(BG3CONFIG.MODULE_NAME, 'lockSettings');
                    if (!Object.values(settings).some(s => s)) {
                        ui.notifications.warn("Please right-click the lock button to select which settings to lock.");
                    } else {
                        ControlsManager.updateMasterLock();
                    }
                }
            }
        };
    }

    _getSettingsButton() {
        return {
            type: 'div',
            key: 'controlSettings',
            class: ["hotbar-control-button"],
            icon: 'fa-cog',
            title: 'Settings',
            hasChildren: true,
            events: {
                'click': () => {
                    // Evento tratado no _registerEvents
                }
            }
        };
    }

    _shouldShowGMHotbarToggle() {
        return game.user.isGM &&
            game.settings.get(BG3CONFIG.MODULE_NAME, 'enableGMHotbar');
    }

    _getGMHotbarToggleButton() {
        return {
            type: 'div',
            key: 'toggleGMHotbar',
            class: ["hotbar-control-button"],
            icon: 'fa-random',
            title: 'Toggle between GM Hotbar and Token Hotbar',
            events: {
                'click': () => {
                    const token = canvas.tokens.controlled[0];
                    const isUsingGM = !ui.BG3HOTBAR.manager.actor;

                    if (isUsingGM && token) {
                        ui.BG3HOTBAR.overrideGMHotbar = false;
                        ui.BG3HOTBAR.generate(token);
                    } else {
                        ui.BG3HOTBAR.overrideGMHotbar = true;
                        ui.BG3HOTBAR.generate(null);
                    }
                }
            }
        };
    }

    getSettingsMenu() {
        return {
            position: 'bottomright',
            event: 'click',
            name: 'baseMenu',
            closeParent: true,
            buttons: {
                resetSettings: {
                    label: game.i18n.localize("BG3.Hotbar.SettingsMenu.ResetLayout"),
                    icon: 'fas fa-rotate',
                    click: async () => {
                        ui.BG3HOTBAR.components.container.components.hotbar.forEach(container => {
                            container.data.rows = BG3CONFIG.ROWS;
                            container.data.cols = BG3CONFIG.INITIAL_COLS;
                            ui.BG3HOTBAR.manager.containers[container.id][container.index].rows = BG3CONFIG.ROWS;
                            ui.BG3HOTBAR.manager.containers[container.id][container.index].cols = BG3CONFIG.INITIAL_COLS;
                            container.render();
                        });
                        await ui.BG3HOTBAR.manager.persist();
                    }
                },
                clearSettings: {
                    label: game.i18n.localize("BG3.Hotbar.SettingsMenu.ClearAllItems"),
                    icon: 'fas fa-trash',
                    click: async () => {
                        ui.BG3HOTBAR.components.container.components.hotbar.forEach(container => {
                            container.data.items = {};
                            ui.BG3HOTBAR.manager.containers[container.id][container.index].items = {};
                            container.render();
                        });
                        ui.BG3HOTBAR.components.weapon.components.weapon.forEach(container => {
                            container.data.items = {};
                            ui.BG3HOTBAR.manager.containers[container.id][container.index].items = {};
                            container.render();
                        });
                        if(!game.settings.get(BG3CONFIG.MODULE_NAME, 'lockCombatContainer')) {
                            ui.BG3HOTBAR.components.weapon.components.combat.forEach(container => {
                                container.data.items = {};
                                ui.BG3HOTBAR.manager.containers[container.id][container.index].items = {};
                                container.render();
                            });
                        };
                        await ui.BG3HOTBAR.manager.persist();
                        
                    }
                },
                divider: {},
                importSettings: {
                    label: game.i18n.localize("BG3.Hotbar.SettingsMenu.ImportLayout"),
                    icon: 'fas fa-file-import',
                    click: () => {
                        // Create file input
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.json';
                        
                        input.onchange = async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = async (e) => {
                              try {
                                const layout = JSON.parse(e.target.result);
                                // Apply the layout
                                ui.BG3HOTBAR.manager.containers = layout;
                                await ui.BG3HOTBAR.manager.persist();
                                // Recreate UI with new layout
                                // this.destroy();
                                ui.BG3HOTBAR.refresh();
                              } catch (error) {
                                console.error('Failed to import layout:', error);
                                ui.notifications.error('Failed to import layout');
                              }
                            };
                            reader.readAsText(file);
                          }
                        };
                        
                        input.click();
                    }
                },
                exportSettings: {
                    label: game.i18n.localize("BG3.Hotbar.SettingsMenu.ExportLayout"),
                    icon: 'fas fa-file-export',
                    click: () => {
                        // Export current layout as JSON
                        const layout = ui.BG3HOTBAR.manager.containers;
                        const dataStr = JSON.stringify(layout, null, 2);
                        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                        
                        const exportName = 'bg3-hotbar-layout.json';
                        
                        const linkElement = document.createElement('a');
                        linkElement.setAttribute('href', dataUri);
                        linkElement.setAttribute('download', exportName);
                        linkElement.click();
                    }
                }
            }
        }
    };

    getLockMenu() {
        return {
            position: 'bottomright',
            event: 'contextmenu',
            name: 'baseMenu',
            keepOpen: true,
            closeParent: true,
            buttons: {
                deselect: {
                    label: ui.BG3HOTBAR.manager.canGMHotbar() ? 'Keep GM Hotbar' : 'Deselecting Token',
                    icon: 'fas fa-user-slash',
                    class: ControlsManager.getLockSetting('deselect') ? 'checked' : '',
                    custom: '<div class="menu-item-checkbox "><i class="fas fa-check"></i></div>',
                    click: () => ControlsManager.updateLockSetting('deselect')
                },
                opacity: {
                    label: 'Opacity',
                    icon: 'fas fa-eye',
                    class: ControlsManager.getLockSetting('opacity') ? 'checked' : '',
                    custom: '<div class="menu-item-checkbox "><i class="fas fa-check"></i></div>',
                    click: () => ControlsManager.updateLockSetting('opacity')
                },
                dragDrop: {
                    label: 'Drag & Drop',
                    icon: 'fas fa-arrows-alt',
                    class: ControlsManager.getLockSetting('dragDrop') ? 'checked' : '',
                    custom: '<div class="menu-item-checkbox "><i class="fas fa-check"></i></div>',
                    click: () => ControlsManager.updateLockSetting('dragDrop')
                }
            }
        }
    };

    _registerEvents() {
        this.element.querySelector('[data-key="controlSettings"]').addEventListener('click', (event) => MenuContainer.toggle(this.getSettingsMenu(), this.element.querySelector('[data-key="controlSettings"]'), event));
        this.element.querySelector('[data-key="controlLock"]').addEventListener('contextmenu', (event) => MenuContainer.toggle(this.getLockMenu(), this.element.querySelector('[data-key="controlLock"]'), event));
    }

    async _renderInner() {
        await super._renderInner();
        if(game.settings.get(BG3CONFIG.MODULE_NAME, 'fadeControlsMenu')) this.element.classList.add('fade');
        const buttons = this.btnData.map((btn) => new BaseButton(btn));
        for(const btn of buttons) this.element.appendChild(btn.element);
        await Promise.all(buttons.map((btn) => btn.render()));
    }
}