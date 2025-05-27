import { BG3CONFIG } from "./config.js";

export const BG3UTILS = {
    getItem: async function(item, actor) {
        if(!item) return;
        if(item.uuid && fromUuid) return await fromUuid(item.uuid);
        else return item;
    },
    check2Handed: function(cell) {
        return false;
    },
    firstUpper: function(string) {
        if (!string.length) return string;
        
        return string[0].toUpperCase() + string.substr(1);
    },
    replacewords: function(text, words = {}){
        let localtext = text;
        
        for (let word of Object.keys(words)) {
            localtext = localtext.replace("{" + word + "}", words[word]);
        }
            
        return localtext;
    },
    damageToRange: async function(formula) {
        if(game.settings.get(BG3CONFIG.MODULE_NAME, 'showDamageRanges') && formula) {
            const minRoll = Roll.create(formula).evaluate({ minimize: true }),
                maxRoll = Roll.create(formula).evaluate({ maximize: true });
            return `${Math.floor((await minRoll).total)}-${Math.ceil((await maxRoll).total)}`;
        } else return formula;
    },
    isTokenLinked: function(actor, tokenId) {
        // Get the token from the canvas
        const token = canvas.tokens.get(tokenId);
        
        // If we have a token, check its document's actorLink property
        if (token) {
            return token.document.actorLink;
        }
        
        // If no token found, assume it's linked if it's not a synthetic token actor
        return !actor.isToken;
    },
    patchFunc: (prop, func, type = "WRAPPER") => {
        let nonLibWrapper = () => {
            const oldFunc = eval(prop);
            eval(`${prop} = function (event) {
                return func.call(this, ${type != "OVERRIDE" ? "oldFunc.bind(this)," : ""} ...arguments);
            }`);
        }
        if (game.modules.get("lib-wrapper")?.active) {
            try {
                libWrapper.register("po0lp-personal-module", prop, func, type);
            } catch (e) {
                nonLibWrapper();
            }
        } else {
            nonLibWrapper();
        }
    },
    getDamageIcon: (type) => {
        return {
            "acid": "fa-flask",
            "bludgeoning": "fa-hammer",
            "cold": "fa-snowflake",
            "electricity": "fa-bolt",
            "fire": "fa-fire",
            "vitality": "fa-sun",
            "void": "fa-skull",
            "piercing": "fa-bow-arrow",
            "slashing": "fa-axe",
            "sonic": "fa-waveform-lines",
            "spirit": "fa-ghost",
            "mental": "fa-brain",
            "poison": "fa-spider",
            "blood": "fa-droplet",
            "precision": "fa-crosshairs",
            "healing": "fa-heart"
        }[type];
    },
    formatSettingsDetails: (moduleName, data) => {
        const bg3Tab = $(`section[data-tab="${moduleName}"]`).eq(0);
        if(!bg3Tab) return;
        for(const detail of data) {
            let toShow = false;
            const generalDetails = $('<details>').addClass('bg3-settings-section'),
                contentDetails = $('<div>');
            if(detail.isOpen) generalDetails.attr('open', '');
            generalDetails.append($('<summary>').html(game.i18n.localize(detail.label))).append(contentDetails);
            for(const category of detail.categories) {
                if(category.label) contentDetails.append($('<div>').addClass('form-group group-header').html(game.i18n.localize(category.label)));
                for(const field of category.fields) {
                    const fieldName = `${moduleName}.${field}`,
                        childContainer = $(`[name="${fieldName}"]`).length ? $(`[name="${fieldName}"]`) : $(`button[data-key="${fieldName}"]`);
                    if(game.settings.menus.get(fieldName)?.visible && !game.settings.menus.get(fieldName).visible()) childContainer.attr('disabled', true);
                    if(childContainer.length) toShow = true;
                    else continue;
                    contentDetails.append(childContainer.parents('div.form-group:first'));
                }
            }
            if(toShow) bg3Tab.append(generalDetails);
        }
    },
    itemIsPassive: function(item) {
        return false;
    }
}