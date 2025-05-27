import { BG3Component } from "../component.js";


export class FilterButton extends BG3Component {
    constructor(data, parent) {
        super(data, parent);
    }

    get classes() {
        return this.data.class;
    }

    get isPact() {
        return false;
    }

    get isApothecary() {
        return false;
    }

    get level() {
        return 1;
    }

    async getData() {
        return this.data;
    }

    get dataTooltip() {
        let desc = '';
        switch (this.data.id) {
            case 'free':
            case 'action':
            case 'bonus':
            case 'reaction':
                desc = `<div class="custom-tooltip"><h4 style="--data-color:${this.data.color}"><i class="fas ${this.data.symbol}"></i>${this.data.label}<i class="fas ${this.data.symbol}"></i></h4><p class="notes"><i>Left Click to highlight items using this resource.</i></p><p class="notes"><i>Right Click to grey out.</i></p></div>`; 
                break;
            case 'feature':
                desc = `<div class="custom-tooltip"><h4 style="--data-color:${this.data.color}"><i class="fas ${this.data.symbol}"></i>Feature<i class="fas ${this.data.symbol}"></i></h4><p class="notes"><i>Left Click to highlight items of type feature.</i></p><p class="notes"><i>Right Click to grey out.</i></p></div>`; 
                break;
            case 'spell':
                const label = !this.data.preparationMode && this.data.level > 0 ? `${this.data.label} ${this.data.level}` : this.data.label;
                desc = `<div class="custom-tooltip"><h4 style="--data-color:${this.data.color}">${label}</h4><p class="notes"><i>Left Click to highlight items using this slot.</i></p><p class="notes"><i>Right Click to grey out.</i></p></div>`; 
                break;
            default:
                desc = this.data.custom?.tooltip ? `<div class="custom-tooltip dnd5e2"><h4 style="--data-color:${this.data.color}">${this.data.custom?.tooltip?.label}</h4></div>` : false;
                break;
        }
        return {type: 'simple', content: desc};
    }

    async _registerEvents() {
        this.element.addEventListener("click", (e) => {
            e.preventDefault();
            if(this.data.custom || this._parent.used.includes(this)) return;
            this._parent.highlighted = this;
        });

        this.element.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            if(this.data.custom) return;
            this._parent.used = this;
        });
    }

    async render() {
        await super.render();
        this.element.style.color = this.data.color;
        if(this.data.background) this.element.style.backgroundImage = `url(${this.data.background})`;
        return this.element;
    }
}