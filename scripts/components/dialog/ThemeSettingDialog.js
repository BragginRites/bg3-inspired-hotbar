import { BG3CONFIG } from "../../utils/config.js";

export class ThemeSettingDialog extends FormApplication {
    constructor () {
        super();
    }

    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            title: 'Theme settings',
            id: "bg3-inspired-hotbar-theme-settings",
            template: `modules/${BG3CONFIG.MODULE_NAME}/templates/dialog/theme-dialog.hbs`,
            height: "auto",
            submitOnClose: false
        };
    }

    async getData() {
        const dataKeys = [],
            configData = {};
        for(let i = 0; i < dataKeys.length; i++) {
            const setting = game.settings.settings.get(`${BG3CONFIG.MODULE_NAME}.${dataKeys[i]}`);
            if(setting.scope === 'client' || game.user.isGM) configData[dataKeys[i]] = game.settings.get(BG3CONFIG.MODULE_NAME, dataKeys[i]);
        }
        const themeList = game.user.hasPermission('FILES_BROWSE') ? await this.generateThemeList(game.settings.get(BG3CONFIG.MODULE_NAME, 'themeOption')) : false;

        const dataInput = [
            {
                name: 'General',
                hint: 'Parameters applied to all others below if not specified.',
                categories: [
                    {
                        headers: ['', 'Normal', 'Hover'],
                        fields: [
                            { id: 'bg3-border-color', label: 'Border Color', hasHover: true, field: {type: 'color', value: '', value2: ''}},
                            { id: 'bg3-background-color', label: 'Background Color', hasHover: true, field: {type: 'color', value: '', value2: ''}},
                            { id: 'bg3-text-color', label: 'Text Color', hasHover: true, field: {type: 'color', value: '', value2: ''}},
                            { id: 'bg3-text-secondary-color', label: 'Text Secondary Color', hasHover: true, field: {type: 'color', value: '', value2: ''}}
                        ]
                    },
                    {
                        fields: [
                            { id:'bg3-border-size', label: 'Border size', field: {type: 'number', value: '', min: 0, max: 10, unit:'px'}}
                        ]
                    }
                ]
            },
            {
                name: 'Portrait',
                hint: '',
                categories: [
                    {
                        fields: [{ id:'bg3-portrait-size', label: 'Size', field: {type: 'number', value: '', min: 100, max: 300, unit:'px'}}]
                    }
                ]
            },
            {
                name: 'Hotbar',
                hint: '',
                categories: [
                    {
                        headers: ['Sub-Container', 'Normal', 'Hover'],
                        fields: [{ id:'bg3-hotbar-sub-background-color', label: 'Background Color', field: {type: 'color', value: '', value2: ''}},
                        { id:'bg3-hotbar-drag-color', label: 'Dragbar/Controls Color', hasHover: true, field: {type: 'color', value: '', value2: ''}}]
                    },
                    {
                        headers: ['Cell', 'Normal', 'Hover'],
                        fields: [{ id:'bg3-hotbar-border-color', label: 'Border Color', hasHover: true, field: {type: 'color', value: '', value2: ''}},
                        { id:'bg3-hotbar-background-color', label: 'Background Color', hasHover: true, field: {type: 'color', value: '', value2: ''}},
                        { id:'bg3-hotbar-text-color', label: 'Text Color', hasHover: true, field: {type: 'color', value: '', value2: ''}}]
                    },
                    {
                        fields: [{ id:'bg3-hotbar-cell-size', label: 'Cell size', field: {type: 'number', value: '', min: 10, max: 200, unit:'px'}},
                        { id:'bg3-hotbar-border-size', label: 'Border size', field: {type: 'number', value: '', min: 0, max: 10, unit:'px'}}]
                    }
                ]
            },
            {
                name: 'Weapons Sets',
                categories: [
                    {
                        headers: ['', 'Normal', 'Hover'],
                        fields: [{ id:'bg3-weapon-border-color', label: 'Border Color', hasHover: true, field: {type: 'color', value: '', value2: ''}},
                        { id:'bg3-weapon-background-color', label: 'Background Color', hasHover: true, field: {type: 'color', value: '', value2: ''}},
                        { id:'bg3-weapon-text-color', label: 'Text Color', hasHover: true, field: {type: 'color', value: '', value2: ''}}]
                    }
                    ,
                    {
                        fields: [
                            { id:'bg3-weapon-cell-size', label: 'Cell size', field: {type: 'number', value: '', min: 10, max: 200, unit:'px'}},
                            { id:'bg3-weapon-border-size', label: 'Border size', field: {type: 'number', value: '', min: 0, max: 10, unit:'px'}}]
                    }
                ]
            },
            {
                name: 'Filters',
                hint: '',
                categories: [
                    {
                        headers: ['', 'Normal', 'Hover'],
                        fields: [{ id:'bg3-filter-border-color', label: 'Border Color', hasHover: true, field: {type: 'color', value: '', value2: ''}},
                        { id:'bg3-filter-background-color', label: 'Background Color', hasHover: true, field: {type: 'color', value: '', value2: ''}},
                        { id:'bg3-filter-text-color', label: 'Text Color', hasHover: true, field: {type: 'color', value: '', value2: ''}}]
                    },
                    {
                        fields: [{ id:'bg3-filter-cell-size', label: 'Cell size', field: {type: 'number', value: '', min: 10, max: 200, unit:'px'}},
                            { id:'bg3-filter-border-size', label: 'Border size', field: {type: 'number', value: '', min: 0, max: 10, unit:'px'}}]
                    }
                ]
            },
            {
                name: 'Passive Effects',
                hint: '',
                categories: [
                    {
                        headers: ['', 'Normal', 'Hover'],
                        fields: [{ id:'bg3-passive-border-color', label: 'Border Color', hasHover: true, field: {type: 'color', value: '', value2: ''}},
                        { id:'bg3-passive-background-color', label: 'Background Color', hasHover: true, field: {type: 'color', value: '', value2: ''}},
                        { id:'bg3-passive-text-color', label: 'Text Color', hasHover: true, field: {type: 'color', value: '', value2: ''}}]
                    },
                    {
                        fields: [{ id:'bg3-passive-cell-size', label: 'Cell size', field: {type: 'number', value: '', min: 10, max: 200, unit:'px'}},
                            { id:'bg3-passive-border-size', label: 'Border size', field: {type: 'number', value: '', min: 0, max: 10, unit:'px'}}]
                    }
                ]
            },
            {
                name: 'Active Effects',
                hint: '',
                categories: [
                    {
                        headers: ['', 'Normal', 'Hover'],
                        fields: [{ id:'bg3-active-border-color', label: 'Border Color', hasHover: true, field: {type: 'color', value: '', value2: ''}},
                        { id:'bg3-active-background-color', label: 'Background Color', hasHover: true, field: {type: 'color', value: '', value2: ''}},
                        { id:'bg3-active-text-color', label: 'Text Color', hasHover: true, field: {type: 'color', value: '', value2: ''}}]
                    },
                    {
                        fields: [{ id:'bg3-active-cell-size', label: 'Cell size', field: {type: 'number', value: '', min: 10, max: 200, unit:'px'}},
                            { id:'bg3-active-border-size', label: 'Border size', field: {type: 'number', value: '', min: 0, max: 10, unit:'px'}}]
                    }
                ]
            },
            {
                name: 'Rest Turn Buttons',
                hint: '',
                categories: [
                    {
                        headers: ['Rest Buttons', 'Normal', 'Hover'],
                        fields: [{ id:'bg3-rest-border-color', label: 'Border Color', hasHover: true, field: {type: 'color', value: '', value2: ''}},
                        { id:'bg3-rest-background-color', label: 'Background Color', hasHover: true, field: {type: 'color', value: '', value2: ''}},
                        { id:'bg3-rest-text-color', label: 'Text Color', hasHover: true, field: {type: 'color', value: '', value2: ''}}]
                    },
                    {
                        headers: ['Turn Button', 'Normal', 'Hover'],
                        fields: [{ id:'bg3-turn-border-color', label: 'Border Color', hasHover: true, field: {type: 'color', value: '', value2: ''}},
                        { id:'bg3-turn-background-color', label: 'Background Color', hasHover: true, field: {type: 'color', value: '', value2: ''}},
                        { id:'bg3-turn-text-color', label: 'Text Color', hasHover: true, field: {type: 'color', value: '', value2: ''}}]
                    },
                    {
                        fields: [{ id:'bg3-rest-border-size', label: 'Border size', field: {type: 'number', value: '', min: 0, max: 10, unit:'px'}}]
                    }
                ]
            }
        ];

        return {configData, dataInput, themeList, canExport: game.user.hasPermission('FILES_UPLOAD')};
    }

    async _render(force, options) {
        await super._render(force, options);
        const themeFile = game.settings.get(BG3CONFIG.MODULE_NAME, 'themeOption') && game.settings.get(BG3CONFIG.MODULE_NAME, 'themeOption') !== 'custom' ? await ThemeSettingDialog.loadThemeFile(game.settings.get(BG3CONFIG.MODULE_NAME, 'themeOption')) : game.settings.get(BG3CONFIG.MODULE_NAME, 'themeCustom'),
            themeData = {...BG3CONFIG.BASE_THEME, ...themeFile};
        $('[name="bg3-inspired-hotbar.themeOption"]').val(game.settings.get(BG3CONFIG.MODULE_NAME, 'themeOption'));
        this.loadThemeData(themeData);
    }

    loadThemeData(themeData) {
        Object.entries(themeData).forEach(([index, value]) => {
            const element = $(`[name="${index.replace('--','')}"]`);
            if(element.length) {
                value = value.replace(element[0].dataset.unit, '');
                if (value.includes('var(')) {
                    const linkedValue = themeData[value.replace('var(','').replace(')','')].replace(element[0].dataset.unit, '');
                    if(linkedValue && element[0].placeholder !== undefined) {
                        element[0].placeholder = linkedValue;
                        if(element[0].hasAttribute('is')) {
                            element[0].style.backgroundColor = linkedValue;
                            element[0].style.color = game.modules.get("colorsettings").api.getTextColor(linkedValue, 1);
                        }
                    }
                } else {
                    if(element[0].value !== undefined) {
                        element[0].value = value;
                        if(element[0].hasAttribute('is')) {
                            element[0].style.backgroundColor = value;
                            element[0].style.color = game.modules.get("colorsettings").api.getTextColor(value, 0.5);
                        }
                    }
                }
            }
        })

    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('.css-var').on('change', event => {
            const themeInput = this.element[0].querySelector('[name="bg3-inspired-hotbar.themeOption"]');
            if(!themeInput) return;
            if(themeInput.value !== 'custom') themeInput.value = 'custom';
            if(themeInput.value === 'custom') {
                const themeData = {...BG3CONFIG.BASE_THEME, ...this.generateThemeData()};
                this.loadThemeData(themeData);
            }
        });
        html.find('[name="bg3-inspired-hotbar.themeOption"]').on('change', async (event) => {
            if(event.target.value !== 'custom') {
                const themeFile = await ThemeSettingDialog.loadThemeFile(event.target.value),
                    themeData = {...BG3CONFIG.BASE_THEME, ...themeFile};
                this.loadThemeData(themeData);
            }
        });
    }

    static async loadThemeFile(theme) {
        let file;
        file = await fetch(`modules/${BG3CONFIG.MODULE_NAME}/scripts/themes/${theme}.json`);
        if (!file.ok) file = await fetch(`modules/${BG3CONFIG.MODULE_NAME}/storage/themes/${theme}.json`);
        if (!file.ok) {
            ui.notifications.error("BG3 HUD Inspired: Theme not found");
            game.settings.set(BG3CONFIG.MODULE_NAME, 'themeOption', 'default');
            file = await fetch(`modules/${BG3CONFIG.MODULE_NAME}/scripts/themes/default.json`);
        }
        const json = await file.json();
        return json;
    }

    async generateThemeList(current) {
        if(current === undefined) current = game.settings.get(BG3CONFIG.MODULE_NAME, 'themeOption');
        current = current.toLowerCase();

        let coreThemes = (await FilePicker.browse("user", `modules/${BG3CONFIG.MODULE_NAME}/scripts/themes`, { extensions: [".json"] })).files;
        if(coreThemes.length) coreThemes = coreThemes.map(t => t.split("/")[t.split("/").length - 1].replace(/\.json/gi, ""));
        let customThemes = (await FilePicker.browse("user", `modules/${BG3CONFIG.MODULE_NAME}/storage/themes`, { extensions: [".json"] })).files;
        if(customThemes.length) customThemes = customThemes.map(t => t.split("/")[t.split("/").length - 1].replace(/\.json/gi, ""));

        let html = `<option value="custom">Custom</option><optgroup label="Core">${coreThemes.map(t => `<option data-folder="scripts" value="${t}">${t}</option>`).join('')}</optgroup><optgroup label="Custom">${customThemes.map(t => `<option data-folder="storage" value="${t}">${t}</option>`).join('')}</optgroup>`;
        
        return html;
    }

    generateThemeData() {
        const form = this.element[0].querySelectorAll('.css-var'),
            cssVars = {};
        for (let i = 0; i < form.length; i++) {
            let value = form[i].type == 'checkbox' ? form[i].checked : form[i].value;
            if(value) cssVars[`--${form[i].name}`] = value + (form[i].dataset.unit ?? '');
        };
        return cssVars;
    }

    async _onSubmit(event) {
        event.preventDefault();
        switch (event.submitter.dataset.type) {
            case 'export':
                this.createTheme();
                break;
            default:
                const themeInput = this.element[0].querySelector('[name="bg3-inspired-hotbar.themeOption"]'),
                    themeValue = themeInput?.value ?? 'custom',
                    themeScope = this.element[0].querySelector('[name="bg3-inspired-hotbar.scopeTheme"]');
                await game.settings.set(BG3CONFIG.MODULE_NAME, 'themeOption', themeValue);
                if(game.settings.get(BG3CONFIG.MODULE_NAME, 'themeOption') === 'custom') {
                    const form = this.element[0].querySelectorAll('.css-var'),
                        cssVars = this.generateThemeData();
                    await game.settings.set(BG3CONFIG.MODULE_NAME, 'themeCustom', cssVars);
                }
                ui.BG3HOTBAR._applyTheme();
                if(game.user.isGM && themeScope) {
                    if(game.settings.get(BG3CONFIG.MODULE_NAME, 'scopeTheme') !== themeScope.checked) {{
                        await game.settings.set(BG3CONFIG.MODULE_NAME, 'scopeTheme', themeScope.checked);
                        SettingsConfig.reloadConfirm({world: true});
                    }}
                }
                this.close();
                break;
        }
    }

    createTheme() {
        new Dialog({
            title: 'Export Theme',
            content: `<form id="bg-3-hud-export-theme">
                <div class="form-group">
                    <label>Theme Name:</label>
                    <input type="text" name="bg3ThemeName">
                </div>
            </form>`,
            buttons: {
                cancel: {
                    label: "Cancel",
                    callback: (event) => {
                        return true;
                    },
                },
                export: {
                    label: "Export",
                    callback: (event) => {
                        console.log(event);
                        const themeData = this.generateThemeData(),
                            themeName = $(event).find('input[name="bg3ThemeName"]').val();
                        const theme = new File([new Blob([JSON.stringify(themeData)], { type: "application/json" })], `${themeName}.json`);
                        FilePicker.uploadPersistent(BG3CONFIG.MODULE_NAME, "themes", theme).then(async (response) => {
                            const themeList = await this.generateThemeList(themeName);
                            $('[name="bg3-inspired-hotbar.themeOption"]').empty();
                            $('[name="bg3-inspired-hotbar.themeOption"]').append(themeList);
                            $('[name="bg3-inspired-hotbar.themeOption"]').val(themeName);
                        });
                    }
                }
            },
            default: "export",
            render: (html) => {
                let $dialog = $(html);
                $dialog.find('button[data-button="export"]').prop("disabled", true);
                $dialog.find('input[name="bg3ThemeName"]').on("keyup", (event) => {
                    let $input = $dialog.find('input[name="bg3ThemeName"]');
                    $input.val(
                        $input
                            .val()
                            .replace(/[^a-z0-9]/gi, "-")
                            .replace(/-{2,}/g, "-")
                            .toLowerCase(),
                    );
                    $dialog.find('button[data-button="export"]').prop("disabled", $input.val().length <= 1);
                });
                $dialog.find('input[name="bg3ThemeName"]').focus();
            }
        }).render(true);
    }
}