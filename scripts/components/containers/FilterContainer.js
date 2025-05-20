import { BG3Component } from "../component.js";
import { BG3CONFIG } from "../../utils/config.js";
import { FilterButton } from "../buttons/filterButton.js";

export class FilterContainer extends BG3Component {
    constructor(data) {
        super(data);
        this.components = [];
        this._used = [];
        this._highlighted = null;
    }

    get classes() {
        return [...['bg3-filter-subcontainer'], ...(this.checkSpellPoint() ? ["filter-spell-point"] : [])];
    }

    getFilterData() {
        return [];
    }

    get highlighted() {
        return this._highlighted;
    }
    
    set highlighted(value) {
        this._highlighted = this._highlighted === value ? null : value;
        this.updateCellFilterState();
    }
    
    get used() {
        return this._used;
    }
    
    set used(value) {
        if(this._used.includes(value)) this._used.splice(this._used.indexOf(value), 1);
        else {
            this._used.push(value);
            if(this._highlighted === value) this._highlighted = null;
        }
        this.updateCellFilterState();
    }

    _getRomanNumeral(num) {
        const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
        return romanNumerals[num - 1] || num.toString();
    }

    resetUsedActions() {
        this._used = [];
        this.updateCellFilterState();
    }

    checkSpellPoint() {
        return game.modules.get("dnd5e-spellpoints")?.active && this.actor.items.find(i => i.system.identifier == "spell-points");
    }

    getDataToCompare(filter, cell) {
        if(!filter) return false;
        switch (filter.data.id) {
            case 'spell':
                if(filter.data.preparationMode) return cell.dataset.preparationMode === filter.data.preparationMode;
                else return parseInt(cell.dataset.level) === filter.data.level;
            case 'feature':
                return cell.dataset.itemType === 'feat';
            default:
                return filter.data.id === cell.dataset.actionType;
        }
    }
        
    updateCellFilterState() {
        for(const filter of this.components) {
            const isUsed = this.used.includes(filter);
            filter.element.style.borderColor = this._highlighted === filter && !isUsed ? filter.data.color : 'transparent';
            filter.element.classList.toggle('used', isUsed);
        }
        $('.bg3-hotbar-container .bg3-hotbar-subcontainer .has-item').each(async (index, cell) => {
            try {
                const isUsed = !!this._used.filter(f => this.getDataToCompare(f, cell) === true).length,
                    isHighlighted = this.getDataToCompare(this._highlighted, cell);
                cell.classList.toggle('used', isUsed);
                if(!this.highlighted) {
                    cell.dataset.highlight = false;
                    return;
                }
                cell.dataset.highlight = isHighlighted && !isUsed ? 'highlight' : 'excluded';
            } catch (error) {
                console.error("Error updating highlights:", error);
            }
        })
    }

    _autoCheckUsed() {
        return;
    }

    async getExtendedFilter() {
        if(!game.settings.get(BG3CONFIG.MODULE_NAME, 'showExtendedFilter')) return;
        const resources = [],
            color = '#d5a25b';
        for(const item of this.actor.items) {
            if(item.hasLimitedUses && item.name && item.type === 'feat') {
                resources.push(new FilterButton({
                    color: color,
                    class: ['filter-spell-point', 'filter-custom'],
                    background: item.img,
                    custom: {
                        value: item.system.uses.value,
                        max: item.system.uses.max,
                        tooltip: {
                            label: item.name
                        }
                    }
                }, this));
            }
        }
        for(const resourceId in this.actor.system.resources) {
            const oResource = this.actor.system.resources[resourceId];
            if(oResource.value && oResource.label && oResource.label !== '') {
                resources.push(new FilterButton({
                    color: color,
                    class: ['filter-spell-point', 'filter-custom'],
                    background: null,
                    custom: {
                        value: oResource.value,
                        max: oResource.max,
                        tooltip: {
                            label: oResource.label
                        }
                    }
                }, this));
            }
        }
        await Promise.all(resources.map(async (filter) => {
            this.element.appendChild(filter.element);
            await filter.render();
        }));
    }

    async updateExtendedFilter() {
        $(this.element).find('.filter-custom').remove();
        await this.getExtendedFilter();
    }

    async render() {
        await super.render();
        this.components = this.getFilterData().map((filter) => new FilterButton(filter, this));
        for(const filter of this.components) this.element.appendChild(filter.element);
        await Promise.all(this.components.map((filter) => filter.render()));

        await this.getExtendedFilter();

        return this.element;
    }
}