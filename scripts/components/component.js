import { BG3CONFIG } from '../utils/config.js';

export class BG3Component {
    constructor(data, parent) {
        this.data = data;
        this.components = [];
        this._parent = parent ?? null;
        this.element = document.createElement(this.elementType);
        this.element.classList.add(...this.classes);
    }
    
    get template() {
        return `${BG3CONFIG.COMPONENTS_PATH}${this.constructor.name}.hbs`;
    }

    get classes() {
        return [];
    }

    get elementType() {
        return this.data?.type ?? "div";
    }
    
    get token() {
        return ui.BG3HOTBAR.manager.token;
    }
    
    get actor() {
        return ui.BG3HOTBAR.manager.actor;
    }

    async getData() {
        return {};
    }

    get visible() {
        return true;
    }

    async loadTemplate(data) {
        try {
            const testTpl = await renderTemplate(this.template, data);
            return testTpl;
        } catch (error) {
            return $(`<${this.elementType}>`).prop('outerHTML');
        }
    }

    addComponent(component) {
        this.components.push(component);
    }

    setComponentsVisibility() {
        this.components.forEach(c => c.setVisibility());
    }

    setVisibility() {
        this.element.classList.toggle("hidden", !this.visible);
    }

    async _registerEvents() {
        if(this.data?.events) {
            Object.entries(this.data.events).forEach(([trigger, fn]) => {
                this.element.addEventListener(trigger, fn.bind(this));
            })
        }
    }

    get dataTooltip() {
        return null;
    }

    async setTooltip() {
        if(this.dataTooltip) {
            switch (this.dataTooltip.type) {
                case 'basic':
                    this.element.title = this.dataTooltip.content;
                    break;    
                case 'simple':
                    this.element.dataset.tooltip = this.dataTooltip.content;
                    this.element.dataset.tooltipDirection = this.dataTooltip.direction ?? 'UP';
                    break;   
                case 'advanced':
                    const uuid = this.data?.uuid ?? this.data?.item?.uuid ?? this.data.item?.slug ?? this.data.slug;
                    if(uuid) {
                        const exclude = false;
                        if(exclude) break;
                        const targetElement = this.element.firstElementChild ?? this.element;
                        targetElement.dataset.tooltip = `<section class="loading" data-uuid="${uuid}"><i class="fas fa-spinner fa-spin-pulse"></i></section>`;
                        targetElement.dataset.tooltipClass = `dnd5e2 dnd5e-tooltip item-tooltip bg3-tooltip`;
                        targetElement.dataset.tooltipDirection="UP";
                    }
                    break;        
                default:
                    break;
            }
        } else return;
    }

    async update() {}

    async render() {
        await this._renderInner();
        await this._registerEvents();
        return this.element;
    }

    async _renderInner() {
        const data = await this.getData();
        const rendered = await this.loadTemplate(data);
        const tempElement = document.createElement("div");
        tempElement.innerHTML = rendered;
        this.element.innerHTML = tempElement.firstElementChild.innerHTML;
        this.setVisibility();
        await this.setTooltip();
    }
}