import { BG3Component } from "../component.js";
import { fromUuid } from "../../utils/foundryUtils.js";
import { ControlsManager } from "../../managers/ControlsManager.js";
import { MenuContainer } from "./MenuContainer.js";
import { BG3UTILS } from "../../utils/utils.js";

export class GridCell extends BG3Component {
    constructor(data, parent) {
        super(data, parent);
        this.type = null;
    }

    get classes() {
        return ['hotbar-cell', 'drag-cursor'];
    }

    get slotKey() {
        return this.element.dataset.slot;
    }

    get locked() {
        return this._parent.locked;
    }

    get dataTooltip() {
        return {type: 'advanced'};
    }

    getActionType(itemData) {
        return null;
    }

    getPreparationMode(itemData) {
        return null;
    }

    async getData() {
        let itemData = await this.item,
            data = super.getData();
        if(itemData) {
            data = {...data, ...{
                    uuid: itemData.uuid,
                    name: itemData.name,
                    icon: itemData.img,
                    actionType: this.getActionType(itemData),
                    itemType: itemData.type,
                    quantity: itemData.system?.quantity && itemData.system?.quantity > 1 ? itemData.system?.quantity : false
                }
            };
        }
        return data;
    }

    get item() {
        return BG3UTILS.getItem.bind(this)(this.data?.item, this.actor);
    }

    async getItemUses() {
        return null;
    }

    async getItemMenuBtns() {
        return {};
    }

    async getItemMenu() {
        const systemBtns = await this.getItemMenuBtns();
        return {
            position: 'topright2',
            event: 'contextmenu',
            name: 'baseMenu',
            closeParent: true,
            standalone: true,
            buttons: {
                ...systemBtns,
                ...(Object.keys(systemBtns).length ? {div1: {label: 'divider', visibility: !this.data.item}} : {}),
                ...{
                    macro: {
                        label: game.i18n.format("SIDEBAR.Create", {type: 'Macro'}),
                        icon: 'fas fa-code',
                        visibility: !!this.data.item || !!ui.BG3HOTBAR.manager.actor || !ui.BG3HOTBAR.manager.canGMHotbar(),
                        click: () => {
                            this.menuItemAction('macro');
                        }
                    },
                    edit: {
                        label: game.i18n.localize("BG3.Hotbar.ContextMenu.EditItem"),
                        icon: 'fas fa-edit',
                        visibility: !this.data.item,
                        click: () => {
                            if(!this.data.item) return;
                            this.menuItemAction('edit');
                        }
                    },
                    remove: {
                        label: game.i18n.localize("BG3.Hotbar.ContextMenu.Remove"),
                        icon: 'fas fa-trash',
                        visibility: !this.data.item,
                        click: async () => {
                            if(!this.data.item) return;
                            await this.menuItemAction('remove');
                            if(this._parent.id === 'weapon') this._parent._parent.switchSet(this._parent._parent.components.weapon[this._parent._parent.activeSet]);
                        }
                    },
                    divider: {label: 'divider', visibility: !this.data.item},
                    populate: {
                        label: 'Auto-Populate This Container', icon: 'fas fa-magic',
                        visibility: this._parent.data.delOnly || ui.BG3HOTBAR.manager.canGMHotbar(),
                        click: () => {
                            this._parent.menuItemAction('populate');
                        }
                    },
                    sort: {
                        label: 'Sort Items In This Container', icon: 'fas fa-sort',
                        visibility: this._parent.data.delOnly || ui.BG3HOTBAR.manager.canGMHotbar(),
                        click: () => {
                            this._parent.menuItemAction('sort');
                        }
                    },
                    clear: {
                        label: 'Clear Container', icon: 'fas fa-trash-alt',
                        click: () => {
                            this._parent.menuItemAction('clear');
                            if(this._parent.id === 'weapon') this._parent._parent.switchSet(this._parent._parent.components.weapon[this._parent._parent.activeSet]);
                        }
                    }
                }
            }
        };
    }

    async menuItemAction(action) {
        if(!this.data.item) return;
        switch (action) {
            case 'edit':
                try {
                    const itemData = await this.item;
                    if (itemData?.sheet) itemData.sheet.render(true);
                } catch (error) {
                    console.error("BG3 Inspired Hotbar | Error editing item:", error);
                    ui.notifications.error(`Error editing item: ${error.message}`);
                }
                break;
            case 'activity':
                try {
                    const itemData = await this.item;
                    if (itemData?.sheet) {
                        const sheet = itemData.sheet.render(true);
                        if (sheet?.activateTab) {
                            setTimeout(() => {
                                try {
                                    sheet.activateTab("activities");
                                } catch (err) {
                                    // No activities tab found
                                }
                            }, 100);
                        }
                    }
                } catch (error) {
                    console.error("BG3 Inspired Hotbar | Error configuring activities:", error);
                    ui.notifications.error(`Error configuring activities: ${error.message}`);
                }
                break;
            case 'remove':
                delete this.data.item;
                delete ui.BG3HOTBAR.manager.containers[this._parent.id][this._parent.index].items[this.slotKey];
                await this._renderInner();
                await ui.BG3HOTBAR.manager.persist();
                break;
            case 'macro':
                try {
                    const cls = getDocumentClass("Macro"),
                        macro = new cls({name: cls.defaultName({type: "chat"}), type: "chat", scope: "global"}),
                        newMacro = macro.sheet.render(true),
                        saveSubmit = newMacro._onSubmit,
                        currentSlot = this;
                    newMacro._onSubmit = async (...args) => {
                        await saveSubmit.bind(newMacro)(...args);
                        if(currentSlot && newMacro.object.uuid) {
                            const newItem = {uuid: newMacro.object.uuid};
                            currentSlot.data.item = newItem;
                            // Update manager stored data
                            ui.BG3HOTBAR.manager.containers[currentSlot._parent.id][currentSlot._parent.index].items[currentSlot.slotKey] = newItem;        
                            await currentSlot._renderInner();
                            await ui.BG3HOTBAR.manager.persist();
                        }
                    }                        
                } catch (error) {
                    console.error("BG3 Inspired Hotbar | Error new macro:", error);
                    ui.notifications.error(`Error new macro: ${error.message}`);
                }
                break;
            default:
                break;
        }
    }

    async useItem(item, e, override) {
        let used = false,
            options = {};
        if(item.execute) item.execute();
        else if(item.use) {
            options = {
                configureDialog: false,
                legacy: false,
                event: e
            };
            used = await item.use(options, { event: e });
        } else if(item.consume) {
            item.consume(e);
            if(item.toChat) item.toChat(e);
            used = await this.useItem(item, this.data.override.level ?? item.system.level);
        } else if(item.sheet?.render) item.sheet.render(true);
        else item.toChat(e);
        return used;
    }

    async _registerEvents() {
        this.element.addEventListener('click', async (e) => {
            e.preventDefault();
            const item = await this.item;
            if(!item) return;
            if(!item.uuid && !item.slug) {
                ChatMessage.create({
                user: game.user,
                speaker: {
                    actor: this.actor,
                    token: this.actor.token,
                    alias: this.actor.name
                },
                content: `\n<div class="dnd5e2 chat-card item-card" data-display-challenge="">\n\n<section class="card-header description collapsible">\n\n<header class="summary">\n<img class="gold-icon" src="${item.img ?? item.icon}">\n<div class="name-stacked border">\n<span class="title">${item.name}</span>\n<span class="subtitle">\nFeature\n</span>\n</div>\n<i class="fas fa-chevron-down fa-fw"></i>\n</header>\n\n<section class="details collapsible-content card-content">\n<div class="wrapper">\n${item.description}\n</div>\n</section>\n</section>\n\n\n</div>\n`
                });
                return;
            }
            if(item) {
                try {
                    let used = await this.useItem(item, e, this.data.item.override);
                    if(used) this._renderInner();
                } catch (error) {
                    console.error("BG3 Inspired Hotbar | Error using item:", error);
                    ui.notifications.error(`Error using item: ${error.message}`);
                }
            } else {
                
            }
        });
        
        this.element.addEventListener('contextmenu', async (e) => MenuContainer.toggle(await this.getItemMenu(), this, e));
        
        this.element.addEventListener('mouseenter', (e) => {});
        
        this.element.addEventListener('mouseleave', (e) => {});
        
        this.element.addEventListener('dragstart', (e) => {
            if (ControlsManager.isSettingLocked('dragDrop') || this._parent?.locked || !this.data.item) {
                e.preventDefault();
                return;
            }

            document.body.classList.add('dragging-active');
            document.body.classList.add('drag-cursor');
            this.element.classList.add("dragging");
            if(game.tooltip) game.tooltip.deactivate()

            ui.BG3HOTBAR.dragDropManager.dragSourceCell = this;
        });
        
        this.element.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (ControlsManager.isSettingLocked('dragDrop') || this._parent?.locked) return;
            e.dataTransfer.dropEffect = "move";
            this.element.classList.add("dragover");
        });
        
        this.element.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (ControlsManager.isSettingLocked('dragDrop') || this._parent?.locked) return;

            this.element.classList.remove("dragover");

            await ui.BG3HOTBAR.dragDropManager.proceedDrop(this, e);

            if(this._parent.id === 'weapon') this._parent._parent.switchSet(this._parent);
        });
        
        this.element.addEventListener('dragenter', (e) => {
            e.preventDefault();
            if (ControlsManager.isSettingLocked('dragDrop') || this._parent?.locked) return;
            this.element.classList.add("dragover");
        });
        
        this.element.addEventListener('dragleave', (e) => {
            e.preventDefault();
            if (ControlsManager.isSettingLocked('dragDrop') || this._parent?.locked) return;
            this.element.classList.remove("dragover");
        });
        
        this.element.addEventListener('dragend', (e) => {
            document.body.classList.remove('dragging-active');
            document.body.classList.remove('drag-cursor');
            this.element.classList.remove("dragging");
            this.element.classList.remove("dragover");
        });
    }

    async _renderInner() {
        await super._renderInner();
        const slotKey = `${this.data.col}-${this.data.row}`;
        this.element.setAttribute('data-slot', slotKey);
        this.element.setAttribute('draggable', !!this.data.item);
        this.element.classList.toggle('has-item', !!this.data.item);
        if(this.data.item) {
            const itemData = await this.item;
            if(itemData) {
                this.element.dataset.actionType = this.getActionType(itemData);
                this.element.dataset.itemType = itemData.type;
                switch (itemData.type) {
                    case 'spell':
                        this.element.dataset.preparationMode = this.getPreparationMode(itemData);
                        this.element.dataset.level = this.data.item.override?.level ?? itemData.system.level;
                        break;
                    case 'feat':
                        this.element.dataset.featType = itemData.system?.type?.value || 'default';
                        break;
                    default:
                        if(this._parent.id === 'weapon' && this.data.col === 0 && this.data.row === 0) {
                            const is2h = BG3UTILS.check2Handed(this);
                            this.element.classList.toggle('has-2h', is2h);
                            if(is2h) {
                                const data = await this.getData();
                                this._parent.element.style.setProperty('--bg-2h', `url(${data.icon.startsWith('http') ? '' : '/'}${data.icon})`);
                            } else this._parent.element.style.removeProperty('--bg-2h');
                        }
                        break;
                }
            }
        } else if($(this.element).hasClass('has-2h')) {
            this.element.classList.remove('has-2h');
            this._parent.element.style.removeProperty('--bg-2h');
        }
    }
}