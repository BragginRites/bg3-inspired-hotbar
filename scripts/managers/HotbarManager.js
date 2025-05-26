// Hotbar Manager Component

import { BG3CONFIG } from '../utils/config.js';

export class HotbarManager {
    constructor() {

        this.containers = {};
        this.currentTokenId = null;

        this.globalMenu = null;
        
        this._initializeContainers();
    }

    get token() {
        return canvas?.tokens?.get(this.currentTokenId) ?? null;
    }

    get actor() {
        return this.token?.actor ?? null;
    }

    async _initializeContainers() {
        Object.entries(BG3CONFIG.CONTAINERSDATA).forEach(([index, data]) => {
            this.containers[index] = [];
            for(let i = 0; i < data.count; i++) {
                this.containers[index].push({...foundry.utils.deepClone(data.config), ...{id: `${index}-container`, index: i}});
            }
        });
        if(this.canGMHotbar() && !game.settings.get(BG3CONFIG.MODULE_NAME, 'gmHotbarInit')) {
            const compendium = await game.packs.get("bg3-inspired-hotbar.bg3-inspired-hud");
            if(!compendium) return;
            let ids = compendium.folders.find(f => f.name === 'GM Hotbar').contents?.map(m => m.uuid);
            const systemCompendium = await game.packs.get(`bg3-hud-${game.system.id}.bg3-inspired-hud`);
            if(systemCompendium) {
                ids = [...ids, ...systemCompendium.folders.find(f => f.name === 'GM Hotbar').contents?.map(m => m.uuid)]
            }
            let containerId = 0,
                containerRow = 0,
                containerCol = 0;
            for(let i = 0; i < ids.length; i++) {
                if(containerCol >= this.containers.hotbar[containerId].cols) {
                    containerRow++;
                    containerCol = 0;
                }
                if(containerRow >= this.containers.hotbar[containerId].rows && containerCol >= this.containers.hotbar[containerId].cols) {
                    containerId++;
                    containerRow = 0;
                    containerCol = 0;
                }
                if(containerId >= this.containers.hotbar.length) break;
                this.containers.hotbar[containerId].items[`${containerCol}-${containerRow}`] = {uuid: ids[i]};
                containerCol++;
            }
            await this.persist();
            await game.settings.set(BG3CONFIG.MODULE_NAME, 'gmHotbarInit', true);

        }
    }

    convertOldFormat(savedData) {
        return [foundry.utils.deepClone(savedData.containers), foundry.utils.deepClone(savedData.weaponsContainers), foundry.utils.deepClone(savedData.combatContainer)];
    }

    canGMHotbar() {
        return !this.actor && game.user.isGM && game.settings.get(BG3CONFIG.MODULE_NAME, 'enableGMHotbar') && game.settings.get(BG3CONFIG.MODULE_NAME, 'uiEnabled');
    }
    
    // Clean up specific token data
    async cleanupTokenData(tokenId) {
        const token = canvas.tokens.get(tokenId);
        if (!token) return;

        // For unlinked tokens, also remove the flag data
        if (token.actor && !token.actorLink) {
            await token.actor.unsetFlag(BG3CONFIG.MODULE_NAME, BG3CONFIG.CONTAINERS_NAME);
        }
    }

    async _loadTokenData() {
        if((!this.token || !this.actor) && !this.canGMHotbar()) return;
        const containersData = this.actor ? this.actor.getFlag(BG3CONFIG.MODULE_NAME, BG3CONFIG.CONTAINERS_NAME) : game.settings.get(BG3CONFIG.MODULE_NAME, 'gmHotbarData'),
            savedData = this.actor?.getFlag(BG3CONFIG.MODULE_NAME, BG3CONFIG.FLAG_NAME) ?? null;
        
        if(containersData) {
            this.containers = foundry.utils.deepClone(containersData);
            // Update Chris Premade Common Actions Section if needed
            if(this.containers.combat?.[0]?.items) {
                if(game.modules.get("chris-premades")?.active) {
                    if(game.modules.get("tidy5e-sheet")?.active) {
                        for(const key in this.containers.combat[0].items) {
                            const item = this.actor.items.find(i => i.uuid === this.containers.combat[0].items[key].uuid);
                            if(item && item.getFlag('chris-premades', 'info')?.source === 'chris-premades' && item.getFlag('tidy5e-sheet', 'section') !== 'CHRISPREMADES.Generic.Actions') item.setFlag('tidy5e-sheet', 'section', 'CHRISPREMADES.Generic.Actions')
                        }
                    }
                } else {
                    // Temp update for common macros for DnD5e
                    const newMacro = (uuid) => {
                        return {
                            "Compendium.bg3-inspired-hotbar.bg3-inspired-hud.Macro.4D8OF8M1WStezKYR": "Compendium.bg3-hud-dnd5e.bg3-inspired-hud.Macro.4D8OF8M1WStezKYR", // Hide
                            "Compendium.bg3-inspired-hotbar.bg3-inspired-hud.Macro.6g71bgb70KdiCFxI": "Compendium.bg3-hud-dnd5e.bg3-inspired-hud.Macro.6g71bgb70KdiCFxI", // Dodge
                            "Compendium.bg3-inspired-hotbar.bg3-inspired-hud.Macro.IfZ3MIJtHIfEDliQ": "Compendium.bg3-hud-dnd5e.bg3-inspired-hud.Macro.IfZ3MIJtHIfEDliQ", // Disengage
                            "Compendium.bg3-inspired-hotbar.bg3-inspired-hud.Macro.OViSCOuazyVf3UgO": "Compendium.bg3-hud-dnd5e.bg3-inspired-hud.Macro.OViSCOuazyVf3UgO", // Shove
                            "Compendium.bg3-inspired-hotbar.bg3-inspired-hud.Macro.aHwa1znbrf2SO5zu": "Compendium.bg3-hud-dnd5e.bg3-inspired-hud.Macro.aHwa1znbrf2SO5zu", // Grapple
                            "Compendium.bg3-inspired-hotbar.bg3-inspired-hud.Macro.qlKPuaLsELZFx0Sn": "Compendium.bg3-hud-dnd5e.bg3-inspired-hud.Macro.qlKPuaLsELZFx0Sn", // Dash
                        }[uuid];
                    };
                    let needSave = false;
                    for(const k in this.containers.combat[0].items) {
                        const v = this.containers.combat[0].items[k];
                        if(v?.uuid && v.uuid.includes('bg3-inspired-hotbar') && newMacro(v.uuid)){
                            this.containers.combat[0].items[k] = {uuid: newMacro(v.uuid)};
                            needSave = true;
                        }
                    }
                    if(needSave) await this.persist();
                }
            }
        } else if(savedData) {
            let hotbarContainersData;
            if (Array.isArray(savedData)) {
                // Old format: direct array of containers
                hotbarContainersData = foundry.utils.deepClone(savedData);
                this.portraitVisible = true; // Default for old format
                // Using old data format, portrait defaulted to hidden
            } else {
                const [hotbarData, weaponData, combatData] = this.convertOldFormat(savedData);
                if(Array.isArray(hotbarData)) {
                    hotbarData.forEach(c => {
                        this.containers.hotbar[c.index].cols = c.cols;
                        this.containers.hotbar[c.index].rows = c.rows;
                        this.containers.hotbar[c.index].items = c.items;
                    });
                }
                if(Array.isArray(weaponData)) {
                    weaponData.forEach(c => {
                        this.containers.weapon[c.index].cols = c.cols;
                        this.containers.weapon[c.index].rows = c.rows;
                        this.containers.weapon[c.index].items = c.items;
                    });
                }
                if(Array.isArray(combatData)) {
                    combatData.forEach(c => {
                        this.containers.combat[c.index].cols = c.cols;
                        this.containers.combat[c.index].rows = c.rows;
                        this.containers.combat[c.index].items = c.items;
                    });
                }
            }
        } else {
            // No saved data so we create blank ones
            await this._initializeContainers();
        }
    }

    async socketUpdateData(actor, changes) {
        if(this.currentTokenId) {
            // Check if this update affects our current token to force UI update
            const token = canvas.tokens.get(this.currentTokenId);
            if (!!token && this.actor?.id === actor.id && !!ui.BG3HOTBAR.element?.[0]) {
                await ui.BG3HOTBAR.generate(token);
            }
        }
    }

    async persist() {
        if(this.actor) this.actor.setFlag(BG3CONFIG.MODULE_NAME, BG3CONFIG.CONTAINERS_NAME, this.containers);
        else if(this.canGMHotbar()) game.settings.set(BG3CONFIG.MODULE_NAME, 'gmHotbarData', this.containers);
    }
} 