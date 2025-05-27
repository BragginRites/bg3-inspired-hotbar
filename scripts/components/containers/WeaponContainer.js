import { BG3CONFIG } from "../../utils/config.js";
import { BG3Component } from "../component.js";

export class WeaponContainer extends BG3Component {
    constructor(data) {
        super(data);
        this.components = {
            combat: [],
            weapon: []
        }
    }

    get classes() {
        return ["bg3-weapon-container"]
    }

    get activeSet() {
        return this.actor.getFlag(BG3CONFIG.MODULE_NAME, 'activeSet') ?? 0;
    }

    set activeSet(index) {
        this.actor.setFlag(BG3CONFIG.MODULE_NAME, 'activeSet', index);
        this.element.setAttribute('data-active-set', index);
        for(let i = 0; i < this.components.weapon.length; i++) {
            const container = this.components.weapon[i].element;
            if(i === index) container.removeAttribute('data-tooltip');
            else {
                container.dataset.tooltip = `Click: Switch to weapon set #${i+1}`;
                container.dataset.tooltipDirection = i === index + 1 || (index === this.components.weapon.length - 1 && i === 0) ? 'UP' : 'DOWN';
            };
        }
    }

    async autoEquipWeapons(c) {}

    async switchSet(c) {
        if(c.index === this.activeSet && c.oldWeapons === c.data.items) return;
        if(game.settings.get(BG3CONFIG.MODULE_NAME, 'enableWeaponAutoEquip')) this.autoEquipWeapons(c);
        this.activeSet = c.index;
    }

    async render() {
        await super.render();
        this.components.weapon.forEach(c => {
            c.element.addEventListener('click', async (e) => this.switchSet(c));
        });
        this.switchSet(this.components.weapon[this.activeSet]);
        return this.element;
    }

    async _renderInner() {
        await super._renderInner();
        this.components = {
            combat: [],
            weapon: []
        };
        // Weapons Containers
        this.components.weapon = this.data.weapon.map((gridData, i) => {
            const container = new CONFIG.BG3HUD.CORE.GRID(gridData);
            container.index = i;
            container.id = 'weapon';
            container.element.setAttribute('data-container-index', i);
            container._parent = this;

            return container;
        });
        
        for(const cell of this.components.weapon) this.element.appendChild(cell.element);
        await Promise.all(this.components.weapon.map((cell) => cell.render()));

        // Combat Container
        const combatContainer = new CONFIG.BG3HUD.CORE.GRID(this.data.combat[0]);
        combatContainer.locked = game.settings.get(BG3CONFIG.MODULE_NAME, 'lockCombatContainer');
        combatContainer.id = 'combat';
        this.components.combat.push(combatContainer);
        this.element.appendChild(combatContainer.element);
        await combatContainer.render();
        combatContainer.element.classList.toggle('hidden', !game.settings.get(BG3CONFIG.MODULE_NAME, 'showCombatContainer'));
    }
}