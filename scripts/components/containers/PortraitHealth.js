import { BG3Component } from "../component.js";
import { BG3CONFIG } from "../../utils/config.js";

export class PortraitHealth extends BG3Component {
    constructor(data, parent) {
        super(data, parent);
    }

    get classes() {
        return ["hp-text"]
    }

    async getData() {
        return {
            enabled: game.settings.get(BG3CONFIG.MODULE_NAME, 'showHPText'),
            health: this._parent.health,
            hpControls: game.settings.get(BG3CONFIG.MODULE_NAME, 'enableHPControls') && ui.BG3HOTBAR.manager.actor?.canUserModify(game.user, "update")
        };
    }

    async _registerEvents() {
        $(this.element).on('click', '.hp-control-death', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if(this.actor.system.attributes.hp.value > 0) this.actor.update({'system.attributes.hp.value': 0});
        });

        $(this.element).on('click', '.hp-control-full', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if(this.actor.system.attributes.hp.value < this.actor.system.attributes.hp.max) this.actor.update({'system.attributes.hp.value': this.actor.system.attributes.hp.max});
        });

        $(this.element).on('click', '.hp-input', (event) => {
            event.preventDefault();
            event.stopPropagation();
        }).on('keydown', '.hp-input', (event) => {
            if ( (event.code === "Enter") || (event.code === "NumpadEnter") ) event.currentTarget.blur();
        }).on('focusin', '.hp-input', (event) => {
            event.target.select();
            const parent = event.target.closest('.hp-text');
            if(parent) parent.dataset.hpLocked = true;
        }).on('focusout', '.hp-input', async (event) => {
            const inputValue = event.currentTarget.value.trim(),
                {value, delta, isDelta} = this._parseAttributeInput(event.currentTarget.value.trim());
            await this.actor.modifyTokenAttribute('attributes.hp', isDelta ? delta : value, isDelta);
            if(isDelta && event.target.value === inputValue) event.target.value = this.actor.system.attributes.hp.value;
            const parent = event.target.closest('.hp-text');
            if(parent) parent.dataset.hpLocked = false;
        });
    }
    
    _parseAttributeInput(input) {
        const isEqual = input.startsWith("=");
        const isDelta = input.startsWith("+") || input.startsWith("-");
        const current = this.actor.system.attributes.hp.value;
        let v;

        // Explicit equality
        if ( isEqual ) input = input.slice(1);

        // Percentage change
        if ( input.endsWith("%") ) {
            const p = Number(input.slice(0, -1)) / 100;
            v = this.actor.system.attributes.hp.max * p;
        }

        // Additive delta
        else v = Number(input);

        // Return parsed input
        const value = isDelta ? current + v : v;
        const delta = isDelta ? v : undefined;
        return {value, delta, isDelta};
    }

    async updateHPText() {
        const text = this.element.querySelector('.hp-text');
        if(text) text.parentNode.removeChild(text);
        if(game.settings.get(BG3CONFIG.MODULE_NAME, 'showHPText')) {
            try {
                const portraitContainer = $(this.element).find('.portrait-image-container').get(0),
                    data = {
                        health: this.health,
                        hpControls: game.settings.get(BG3CONFIG.MODULE_NAME, 'enableHPControls')
                    },
                    textTpl = await renderTemplate(`${BG3CONFIG.COMPONENTS_PATH}PortraitHealth.hbs`, data);
                portraitContainer.append($(textTpl).get(0));
            } catch (error) {
                return 'Error while rendering Token HP Text.';
            }
        }
    }

    async render() {
        await super.render();
        if(!game.settings.get(BG3CONFIG.MODULE_NAME, 'enableHPControls') || !ui.BG3HOTBAR.manager.actor.canUserModify(game.user, "update")) this.element.style.setProperty('pointer-events', 'none');
        else this.element.style.removeProperty('pointer-events');
        return this.element;
    }
}