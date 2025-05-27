import { BG3Component } from "../component.js";


export class ActiveButton extends BG3Component {
    constructor(data, parent) {
        super(data, parent);
    }

    get classes() {
        return ['active-effect-icon'];
    } 

    async getData() {
        return this.data.item;
    }

    get dataTooltip() {
        return {type: 'advanced'};
    }

    get itemLabel() {
        return this.data.item.label;
    }

    async _registerEvents() {
        this.element.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Update the effect's disabled status
            await this.data.item.update({ disabled: !this.data.item.disabled });
            this.update();
        });
        
        this.element.addEventListener("contextmenu", async (e) => {
            e.preventDefault();
            const dialog = new Dialog({
              title: "Delete Effect",
              content: `<p>Are you sure you want to delete the effect "${this.itemLabel}"?</p>`,
              buttons: {
                delete: {
                    icon: '<i class="fas fa-trash"></i>',
                    label: "Delete",
                    callback: async () => {
                        await this.data.item.delete();
                        this._parent.render();
                    }
                },
                cancel: {
                  icon: '<i class="fas fa-times"></i>',
                  label: "Cancel"
                }
              },
              default: "cancel"
            });
            dialog.render(true);
        });
    }

    async update() {
        await super.update();
        this.element.classList.toggle('disabled', this.data.item.disabled);
    }

    async render() {
        await super.render();
        this.element.dataset.uuid = this.data.item.uuid;
        await this.update();
        return this.element;
    }
}