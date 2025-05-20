import { AutoPopulateDialog } from "../../features/AutoPopulateFeature.js";
import { AutoSort } from "../../features/AutoSort.js";
import { BG3Component } from "../component.js";
import { GridCell } from "./GridCell.js";

export class GridContainer extends BG3Component {
    constructor(data) {
        super(data);
        this.index = 0;
        this.id = null;
        this.targetItem = null;
        this.locked = false;
    }

    get classes() {
        return [...['bg3-hotbar-subcontainer'], ...(this.data?.class ?? [])];
    }

    async menuItemAction(action) {
        switch (action) {
            case 'populate':
                const dialog = new AutoPopulateDialog(this);
                dialog.render(true);
                break;
            case 'sort':
                await AutoSort.sortContainer(this);
                break;
            case 'clear':
                ui.BG3HOTBAR.manager.containers[this.id][this.index].items = {};
                this.data.items = {};
                await this.render();
                await ui.BG3HOTBAR.manager.persist();
                break;
            default:
                break;
        }
    }

    async render() {
        await super.render();
        this.components = [];
        this.element.style.setProperty('--cols', this.data.cols);
        this.element.style.setProperty('--rows', this.data.rows);
        for(let r = 0; r < this.data.rows; r++) {
            for(let c = 0; c < this.data.cols; c++) {
                const item = this.data?.items?.[`${c}-${r}`] ?? null,
                    cell = new GridCell({row: r, col: c, item: item}, this);
                this.addComponent(cell);
            }
        }
        for(const cell of this.components) this.element.appendChild(cell.element);
        await Promise.all(this.components.map((cell) => cell.render()));
        
        return this.element;
    }
}