import { BG3Component } from "../component.js";

export class MenuContainer extends BG3Component {
    constructor(data, parent, event, standalone) {
        super(data);
        this._parent = parent;
        this.rendered = false;
        this.event = event;
        this.standalone = standalone ?? false;
        this.components = [];
    }

    get classes() {
        return ['bg3-menu-container'];
    }

    get parentElement() {
        return this._parent?.element ?? this._parent;
    }

    async getData() {
        return {buttons: this.data.buttons};
    }
    
    async _registerEvents() {
        if(this.data.buttons) {
            Object.entries(this.data.buttons).forEach(([k,b]) => {
                const btn = this.element.querySelector(`[data-key="${k}"]`);
                if(b.click || b.subMenu?.length) {
                    if(btn) btn.addEventListener('click', (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if(b.subMenu?.length) {
                            const oldComponents = this.components;
                            this.components = [];
                            b.subMenu.forEach(async sb => {
                                let newMenu = true;
                                if(oldComponents.length) {
                                    oldComponents.forEach(c => {
                                        if(c.data === sb) newMenu = false;
                                        if(sb.name && c?.data?.name === sb.name) c.destroy();
                                    });
                                }
                                if(!newMenu) return;
                                const subMenu = new CONFIG.BG3HUD.CORE.MENU(sb, btn, event, true);
                                this.components.push(subMenu);
                                subMenu.render();
                            })
                        }
                        else b.click(event);
                        if(!this.data.keepOpen && !b.keepOpen) {
                            if(ui.BG3HOTBAR.menuManager) ui.BG3HOTBAR.menuManager.destroy();
                            else this.destroy();
                        }
                    });
                }
                if(b.change) {
                    const input = btn.querySelector('select');
                    if(input) input.addEventListener('change', (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        b.change(event);
                        if(!this.data.keepOpen) {
                            if(ui.BG3HOTBAR.menuManager) ui.BG3HOTBAR.menuManager.destroy();
                            else this.destroy();
                        }
                    })
                }
            })
        } else this.element.style.display = 'none';

        this.outside = this._setupClickOutside.bind(this);
        document.addEventListener('click', this.outside);
    }

    _setupClickOutside(e) {
        if (!this.visible) return;
        
        // Check if the click is outside both the ability card and the ability button
        const isClickMenu = this.element.contains(e.target);
        const isClickOnButton = this.data.closeParent === true ? false : this.parentElement.contains(e.target);
        
        if (!isClickMenu && !isClickOnButton) this.destroy();
    }

    setPosition() {
        switch (this.data.position) {
            case 'mouse':
                this.element.style.top = `${this.event.offsetY}px`;
                this.element.style.left = `${this.event.offsetX}px`;
                break;        
            case 'target':
                const target = this.event.target;
                this.element.style.top = `${target.offsetTop}px`;
                this.element.style.left = `${target.offsetLeft + target.offsetWidth}px`;
                break;
            default:
                break;
        }
    }

    destroy() {
        if(this.components.length) {
            this.components.forEach(c => c.destroy());
        }
        document.removeEventListener('click', this.outside);
        if(this.element?.parentNode) this.element.parentNode.removeChild(this.element);
        this.rendered = false;
        if(!this.standalone) ui.BG3HOTBAR.menuManager = null;
    }

    async render() {
        if(!this.standalone) ui.BG3HOTBAR.menuManager = this;
        const html = await super.render();
        this.parentElement.appendChild(html);
        this.rendered = true;
        return html;
    }

    async _renderInner() {
        await super._renderInner();
        this.element.dataset.menuPosition = this.data.position;
        if(this.data.name) this.element.setAttribute('name', this.data.name);
        this.setPosition();
    }

    static async toggle(data, parent, event) {
        event.preventDefault();
        event.stopPropagation();
        if(game.tooltip) game.tooltip.deactivate()
        const oldParent = ui.BG3HOTBAR.menuManager?._parent;
        if(ui.BG3HOTBAR.menuManager) ui.BG3HOTBAR.menuManager.destroy();
        if(oldParent !== parent && !parent.locked) return new CONFIG.BG3HUD.CORE.MENU(data, parent, event).render();
    }
}