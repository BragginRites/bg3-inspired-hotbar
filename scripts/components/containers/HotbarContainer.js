import { BG3Component } from "../component.js";
import { DragBar } from "./DragBar.js";

export class HotbarContainer extends BG3Component {
    constructor(data, parent) {
        super(data, parent);
        this.components = {hotbar:[]};
    }

    get classes() {
        return ["bg3-hotbar-container"]
    }

    async render() {
        await super.render();
        this.components = {};

        if(this.actor) {
            this.components.passiveContainer = new CONFIG.BG3HUD.COMPONENTS.HOTBAR.PASSIVE();
            this.components.activeContainer = new CONFIG.BG3HUD.COMPONENTS.HOTBAR.ACTIVE();
            this.components.filterContainer = new CONFIG.BG3HUD.COMPONENTS.HOTBAR.FILTER();
        }
        this.components.controlContainer = new CONFIG.BG3HUD.COMPONENTS.HOTBAR.CONTROL();

        const toRender = Object.values(this.components);
        this.components.hotbar = [];

        for(let i = 0; i < this.data.length; i++) {
            const gridData = this.data[i],
                container = new CONFIG.BG3HUD.CORE.GRID(gridData);
            container.index = i;
            container.id = 'hotbar';
            this.components.hotbar.push(container);
            toRender.push(container);
            if(i < this.data.length - 1) {
                const dragBar = new DragBar({index: i}, this);
                toRender.push(dragBar);
            }
        }

        for(const container of toRender) this.element.appendChild(container.element);
        await Promise.all(toRender.map((container) => container.render()));
        return this.element;
    }
}