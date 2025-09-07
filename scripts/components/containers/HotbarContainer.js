import { BG3Component } from "../component.js";
import { ActiveContainer } from "./ActiveContainer.js";
import { ControlContainer } from "./ControlContainer.js";
import { DragBar } from "./DragBar.js";
import { FilterContainer } from "./FilterContainer.js";
import { GridContainer } from "./GridContainer.js";
import { PassiveContainer } from "./PassiveContainer.js";

export class HotbarContainer extends BG3Component {
    constructor(data) {
        super(data);
        this.components = {hotbar:[]};
    }

    get classes() {
        return ["bg3-hotbar-container"]
    }

    async render() {
        await super.render();
        this.components = {};

        if(ui.BG3HOTBAR.manager.actor) {
            this.components.passiveContainer = new PassiveContainer();
            this.components.activeContainer = new ActiveContainer();
            this.components.filterContainer = new FilterContainer();
        }
        this.components.controlContainer = new ControlContainer();

        const toRender = Object.values(this.components);
        this.components.hotbar = [];

        for(let i = 0; i < this.data.length; i++) {
            const gridData = this.data[i],
                container = new GridContainer(gridData);
            container.index = i;
            container.id = 'hotbar';
            this.components.hotbar.push(container);
            toRender.push(container);
            if(i < this.data.length - 1) {
                const dragBar = new DragBar({index: i}, this);
                toRender.push(dragBar);
            }
        }

        // propagate stable references to child components created here
        for (const c of toRender) {
            if (c && !Array.isArray(c)) {
                c._stableToken = this._stableToken ?? ui.BG3HOTBAR.manager.token ?? null;
                c._stableActor = this._stableActor ?? ui.BG3HOTBAR.manager.actor ?? null;
            }
        }

        for(const container of toRender) this.element.appendChild(container.element);
        await Promise.all(toRender.map((container) => container.render()));
        return this.element;
    }
}