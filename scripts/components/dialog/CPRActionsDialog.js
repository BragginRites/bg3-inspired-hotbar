import { BG3CONFIG } from "../../utils/config.js";

export class CPRActionsDialog extends FormApplication {
    constructor () {
        super();
    }

    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            id: "bg3-inspired-hotbar-setting-dialog",
            template: `modules/${BG3CONFIG.MODULE_NAME}/templates/dialog/cpr-actions-dialog.hbs`,
            title: "BG3.Settings.Menu.CPR.UpTo6",
            height: "auto",
            submitOnClose: false
        };
    }

    async getData() {
        return super.getData();
    }

    activateListeners(html) {
        super.activateListeners(html);
        html[0].querySelectorAll("input.cpr-actions").forEach((input) => {
            input.addEventListener("change", (event) => {
                this.element[0].querySelector('.grid-2').dataset.selected = this.element[0].querySelectorAll('input.cpr-actions:checked').length;
            });
        });
    }

    async _onSubmit(event) {
        event.preventDefault();
        const inputs = this.element[0].querySelectorAll('input.cpr-actions:checked');
        game.settings.set(BG3CONFIG.MODULE_NAME, 'choosenCPRActions', [...inputs].map(i => i.id));
        this.close();
    }
}