import { BG3Component } from "../component.js";

export class ActiveContainer extends BG3Component {
    constructor(data) {
        super(data);
    }

    get classes() {
        return ['bg3-actives-container'];
    }

    get activesList() {
        if(!this.token && !this.actor) return null;

        // Get active effects from the actor's sheet.
       return this.actor.effects?.contents || [];
    }

    async render() {
        await super.render();

        const activesList = this.activesList;
        if(activesList?.length === 0) this.element.style.visibility = 'hidden';
        else this.element.style.removeProperty('visibility');

        const actives = activesList.map((active) => new CONFIG.BG3HUD.BUTTONS.ACTIVE({item: active}, this));
        for(const active of actives) this.element.appendChild(active.element);
        await Promise.all(actives.map((active) => active.render()));
        
        return this.element;
    }
}