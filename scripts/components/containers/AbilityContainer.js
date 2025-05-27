import { BG3Component } from "../component.js";

export class AbilityContainer extends BG3Component {
    constructor(data) {
        super(data);
    }

    get classes() {
        return ["ability-button"]
    }

    async _registerEvents() {    
        this.element.addEventListener('click', (event) => CONFIG.BG3HUD.CORE.MENU.toggle(this.getMenuData(), this, event));
        if(!!this.getInitMethod()) {
            this.element.querySelector('.fa-dice-d20').addEventListener('contextmenu', async (event) => {
                this.getInitMethod()({ rerollInitiative: true, createCombatants: true, event });
            });
        }
    }

    getInitMethod() {
        return false;
    }

    getMenuBtns() {
        return {};
    }

    getMenuData() {
        return {
            position: 'top',
            event: 'click',
            name: 'baseMenu',
            keepOpen: true,
            closeParent: true,
            buttons: this.getMenuBtns()
        };
    };
}