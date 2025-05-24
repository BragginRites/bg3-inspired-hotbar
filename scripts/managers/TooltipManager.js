import { BG3CONFIG } from "../utils/config.js";

export class BG3TooltipManager {
    constructor() {
        this.savedEnrichers = {};
        this._saveEnrichers();
        this._init();
    }

    get enrichers() {
        return CONFIG.TextEditor.enrichers ?? CONFIG.TextEditor
    }

    _init() {
        const oldDismiss = TooltipManager.prototype.dismissLockedTooltips;
        TooltipManager.prototype.dismissLockedTooltips = function() {
            if(!this.tooltip.classList.contains('bg3-tooltip')) oldDismiss.bind(this)();
        }
        
        function handle_mousedown(e){
            e.preventDefault();
            const tooltip = {};
            tooltip.pageX0 = e.pageX;
            tooltip.pageY0 = e.pageY;
            tooltip.elem = this;
            tooltip.offset0 = $(this).offset();
            tooltip.moved = false;
        
            function handle_dragging(e){
                e.preventDefault();
                var left = tooltip.offset0.left + (e.pageX - tooltip.pageX0);
                var top = tooltip.offset0.top + (e.pageY - tooltip.pageY0);
                if(!tooltip.moved) {
                    tooltip.elem.style.removeProperty('bottom');
                    tooltip.moved = true;
                }
                $(tooltip.elem)
                .offset({top: top, left: left});
            }
        
            function handle_mouseup(e){
                e.preventDefault();
                $(this)
                .off('mousemove', handle_dragging)
                .off('mouseup', handle_mouseup);
            }
        
            $(this)
            .on('mouseup', handle_mouseup)
            .on('mousemove', handle_dragging);
        }
        
        $('body').on('mousedown', '.locked-tooltip.bg3-tooltip', handle_mousedown);
        this._extendTooltipInit();
    }

    _extendTooltipInit() {
        return;
    }

    _saveEnrichers() {
        return;
    }
    
    _tooltipRangeDamage() {    
        return;
    }

    _resetEnrichers(enrichers) {
        for(const enricher of enrichers) {
            if(this.savedEnrichers[enricher]) {
                const enr = this.enrichers.find(e => e.id == `${enricher}Enricher`);
                if(enr) enr.enricher = this.savedEnrichers[enricher];
            }
        }
    }
}