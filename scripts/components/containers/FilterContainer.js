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

    get filterData() {
        const filterData = [
            {
                id: 'action',
                label: 'Action',
                symbol: 'fa-circle',
                class: ['action-type-button'],
                color: BG3CONFIG.COLORS.ACTION
            },
            {
                id: 'bonus',
                label: 'Bonus Action',
                symbol: 'fa-triangle',
                class: ['action-type-button'],
                color: BG3CONFIG.COLORS.BONUS
            },
            {
                id: 'reaction',
                label: 'Reaction',
                symbol: 'fa-sparkle',
                class: ['action-type-button'],
                color: BG3CONFIG.COLORS.REACTION
            },
            {
                id: 'feature',
                label: 'Feature',
                symbol: 'fa-star',
                class: ['action-type-button'],
                color: BG3CONFIG.COLORS.FEATURE_HIGHLIGHT
            }
        ]

        // Add cantrip spell
        let cantrips = this.actor.items.filter(i => i.type==="spell" && i.system.level===0)
        if(cantrips.length) {
          filterData.push({
              id: 'spell',
              label: 'Cantrip',
              level: 0,
              max: 1,
              value: 1,
              class: ['spell-level-button', 'spell-cantrip-box'],
              color: BG3CONFIG.COLORS.SPELL_SLOT
          });
        }

        // Then add regular spell levels
        for (let level = 1; level <= 9; level++) {
            const spellLevelKey = `spell${level}`;
            const spellLevel = this.actor.system.spells?.[spellLevelKey];
            
            if (spellLevel?.max > 0) {
                filterData.push({
                    id: 'spell',
                    label: 'Spell Level',
                    level: level,
                    value: spellLevel.value,
                    max: spellLevel.max,
                    short: this._getRomanNumeral(level),
                    class: ['spell-level-button'],
                    color: BG3CONFIG.COLORS.SPELL_SLOT
                });
            }
        }

        // Add pact magic if it exists
        const pactMagic = this.actor.system.spells?.pact;
        if (pactMagic?.max > 0) {
            filterData.push({
                id: 'spell',
                isPact: true,
                label: 'Pact Magic',
                short: 'P',
                max: pactMagic.max,
                value: pactMagic.value,
                class: ['spell-level-button', 'spell-pact-box'],
                color: BG3CONFIG.COLORS.PACT_MAGIC
            });
        }

        // Add apothecary magic from SCGD if it exists
        const apothecaryMagic = this.actor.system.spells?.apothecary;
        if (apothecaryMagic?.max > 0) {
            filterData.push({
                id: 'spell',
                isApothecary: true,
                label: 'Apothecary Magic',
                short: 'A',
                max: apothecaryMagic.max,
                value: apothecaryMagic.value,
                class: ['spell-level-button', 'spell-apothecary-box'],
                color: BG3CONFIG.COLORS.APOTHECARY_MAGIC
            });
        }

        return filterData;
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
        const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
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
                if(filter.data.isPact) return cell.dataset.preparationMode === 'pact';
                else if(filter.data.isApothecary) return cell.dataset.preparationMode === 'apothecary';
                else return parseInt(cell.dataset.level) === filter.data.level;
            case 'feature':
                return cell.dataset.itemType === 'feat';
            default:
                return filter.data.id === cell.dataset.actionType || cell.dataset.activityActionTypes?.split(',').includes(filter.data.id);
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
        
    _checkBonusReactionUsed() {
        // effect._id === "dnd5ebonusaction"
        // effect._id === "dnd5ereaction000"
        if(!game.settings.get(BG3CONFIG.MODULE_NAME,'synchroBRMidiQoL') || !ui.BG3HOTBAR.components.container.components.activeContainer) return;

        const bonusFilter = this.components.find(f => f.data.id === 'bonus'),
            reactionFilter = this.components.find(f => f.data.id === 'reaction');

        if((ui.BG3HOTBAR.components.container.components.activeContainer.activesList.find(a => a._id === 'dnd5ebonusaction') && !this.used.includes(bonusFilter)) || (!ui.BG3HOTBAR.components.container.components.activeContainer.activesList.find(a => a._id === 'dnd5ebonusaction') && this.used.includes(bonusFilter))) this.used = bonusFilter;

        if((ui.BG3HOTBAR.components.container.components.activeContainer.activesList.find(a => a._id === 'dnd5ereaction000') && !this.used.includes(reactionFilter)) || (!ui.BG3HOTBAR.components.container.components.activeContainer.activesList.find(a => a._id === 'dnd5ereaction000') && this.used.includes(reactionFilter))) this.used = reactionFilter;
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
                            label: item.name,
                            // pills: item.system.requirements ? item.system.requirements.split(';') : null
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
        
        this.components = this.filterData.map((filter) => new FilterButton(filter, this));
        for(const filter of this.components) this.element.appendChild(filter.element);
        await Promise.all(this.components.map((filter) => filter.render()));

        await this.getExtendedFilter();

        return this.element;
    }
}

