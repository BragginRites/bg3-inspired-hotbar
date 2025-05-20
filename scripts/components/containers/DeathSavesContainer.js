import { BG3CONFIG } from "../../utils/config.js";
import { BG3Component } from "../component.js";

export class DeathSavesContainer extends BG3Component {
    constructor(data) {
        super(data);
        
        this.lastHpValue = null;  // Track HP changes
        
        this.stabilizationTimer = null;  // Add timer reference
        this.isStabilizing = false;      // Add stabilization state
    }

    get classes() {
        return [...["bg3-death-saves-container"], ...(game.settings.get(BG3CONFIG.MODULE_NAME, 'showDeathSavingThrow') === 'only' ? ['death-only-skull'] : [])]
    }

    getData() {
        return {display: false};
    }

    isVisible() {
        return false;
    }

    get visible() {
        return this.isVisible();
    }

    async skullClick(event) {
        event.preventDefault();
        event.stopPropagation();
        return null;
    }

    async _registerEvents() {
        this.element.querySelector('.death-saves-skull').addEventListener('click', this.skullClick.bind(this));

        this.element.querySelector('.death-saves-skull').addEventListener('contextmenu', async (event) => {
            event.preventDefault();
            event.stopPropagation();
                
            if (!this.actor || this.actor.type !== 'character') return;

            // Reset both successes and failures to 0
            if(this.getData().data1?.update) await this.getData().data1.update(0);
            if(this.getData().data2?.update) await this.getData().data2.update(0);

            // Update the UI
            const successBoxes = this.element.querySelectorAll('.death-save-box.success');
            const failureBoxes = this.element.querySelectorAll('.death-save-box.failure');

            // Unmark all boxes
            successBoxes.forEach(box => box.classList.remove('marked'));
            failureBoxes.forEach(box => box.classList.remove('marked'));
        });

        this.element.querySelectorAll('.death-save-box.success').forEach((s) => s.addEventListener('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                
                if (!this.actor || this.actor.type !== 'character') return;

                // Get all success boxes
                const successBoxes = [...this.element.querySelectorAll('.death-save-box.success')];
                const clickedIndex = successBoxes.indexOf(event.currentTarget);

                // Update all boxes based on clicked position
                successBoxes.forEach((box, index) => {
                    // Mark boxes from the bottom up to the clicked box, unmark the rest
                    box.classList.toggle('marked', index >= clickedIndex);
                });

                // Update the actor with the number of successes (3 - clicked index)
                if(this.getData().data1?.update) await this.getData().data1.update(this.getData().data1.max - clickedIndex);
            })
        );

        this.element.querySelectorAll('.death-save-box.failure').forEach((s) => s.addEventListener('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                
                if (!this.actor || this.actor.type !== 'character') return;

                // Get all failure boxes
                const failureBoxes = [...this.element.querySelectorAll('.death-save-box.failure')];
                const clickedIndex = failureBoxes.indexOf(event.currentTarget);

                // Update all boxes based on clicked position
                failureBoxes.forEach((box, index) => {
                    // Mark boxes from the top up to the clicked box, unmark the rest
                    box.classList.toggle('marked', index <= clickedIndex);
                });

                // Update the actor with the number of failures (clicked index + 1)
                if(this.getData().data2?.update) await this.getData().data2.update(clickedIndex + 1);
            })
        );
    }
}