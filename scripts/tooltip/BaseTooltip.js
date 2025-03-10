// BaseTooltip.js
import { getItemDetails } from "../utils/tooltipUtils.js";
import { CONFIG } from "../utils/config.js";
import { TooltipFactory } from "./TooltipFactory.js";

function nukeBackgrounds(element) {
  // Force remove ALL backgrounds with a more generic approach
  const style = document.createElement('style');
  style.textContent = `
    /* Target all enriched elements */
    .tooltip-enriched-content [data-*],
    .tooltip-enriched-content .inline-roll,
    .tooltip-enriched-content .reference-link,
    .tooltip-enriched-content .condition-reference,
    .tooltip-enriched-content .effect-button,
    .tooltip-enriched-content [data-reference],
    .tooltip-enriched-content [data-condition],
    .tooltip-enriched-content [data-effect] {
      all: revert !important;
      background: none !important;
      background-color: transparent !important;
      background-image: none !important;
      color: #cc3333 !important;
      text-decoration: underline !important;
      border: 1px solid rgba(204, 51, 51, 0.3) !important;
      border-radius: 2px !important;
      padding: 0 2px !important;
      margin: 0 !important;
      box-shadow: none !important;
      font-family: inherit !important;
      font-size: inherit !important;
    }

    /* Ensure buttons look clickable */
    .tooltip-enriched-content .effect-button,
    .tooltip-enriched-content [data-effect] {
      cursor: pointer !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 4px !important;
    }

    /* Remove any possible icons or backgrounds */
    .tooltip-enriched-content [data-*]:before,
    .tooltip-enriched-content [data-*]:after,
    .tooltip-enriched-content .inline-roll:before,
    .tooltip-enriched-content .inline-roll:after,
    .tooltip-enriched-content .reference-link:before,
    .tooltip-enriched-content .reference-link:after {
      content: none !important;
      display: none !important;
    }
  `;
  element.appendChild(style);

  // Also forcefully remove inline styles from any enriched elements
  element.querySelectorAll('[data-*], .inline-roll, .reference-link, .condition-reference, .effect-button, [data-reference], [data-condition], [data-effect]').forEach(el => {
    el.removeAttribute('style');
    Object.assign(el.style, {
      background: 'none',
      backgroundColor: 'transparent',
      backgroundImage: 'none',
      boxShadow: 'none',
      color: '#cc3333',
      textDecoration: 'underline',
      border: '1px solid rgba(204, 51, 51, 0.3)',
      borderRadius: '2px',
      padding: '0 2px',
      margin: '0'
    });
  });
}

export class BaseTooltip {
  // Static map to track pinned tooltips by item ID/UUID
  static pinnedTooltips = new Map();
  // Track current tooltips by type
  static currentTooltips = new Map();
  static pendingTooltipTimers = new Map();

  constructor(item) {
    this.item = item;
    this.element = null;
    this._pinned = false;
    this._isHighlighted = false;
    this._isDragging = false;
    this.tooltipType = "base"; // Subclasses should override this
  }

  static getTooltipDelay() {
    return game.settings.get(CONFIG.MODULE_NAME, 'tooltipDelay') ?? CONFIG.TOOLTIP_DELAY;
  }

  static cleanup(tooltipType) {
    // Clear pending tooltip timer for this type
    if (this.pendingTooltipTimers.has(tooltipType)) {
      clearTimeout(this.pendingTooltipTimers.get(tooltipType));
      this.pendingTooltipTimers.delete(tooltipType);
    }
    
    // Remove existing tooltip of this type
    const existingTooltip = this.currentTooltips.get(tooltipType);
    if (existingTooltip && !existingTooltip._pinned) {
      existingTooltip.remove();
      this.currentTooltips.delete(tooltipType);
    }
  }

  // Static method to create and attach a tooltip with delay
  static async createWithDelay(item, cell, event, isUpdating = false) {
    // Don't create new tooltips while updating
    if (isUpdating) return null;

    // Check for existing pinned tooltip first
    const existingTooltip = this.getPinnedTooltip(item);
    if (existingTooltip) {
      existingTooltip.highlight(true);
      return existingTooltip;
    }

    // Clear any existing timer for this type
    this.cleanup(item.type || "base");

    // Get tooltip delay from settings
    const tooltipDelay = this.getTooltipDelay();

    // Create and attach tooltip immediately if delay is 0
    if (tooltipDelay === 0) {
      const tooltip = await TooltipFactory.create(item);
      if (tooltip) {
        tooltip.attach(cell, event);
        return tooltip;
      }
      return null;
    }

    // Otherwise, create a delayed tooltip
    return new Promise((resolve) => {
      const timer = setTimeout(async () => {
        if (!document.body.classList.contains('dragging-active')) {
          const tooltip = await TooltipFactory.create(item);
          if (tooltip) {
            tooltip.attach(cell, event);
            resolve(tooltip);
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
        this.pendingTooltipTimers.delete(item.type || "base");
      }, tooltipDelay);

      this.pendingTooltipTimers.set(item.type || "base", timer);
    });
  }

  // Static method to find existing pinned tooltip
  static getPinnedTooltip(item) {
    const itemId = item.uuid || item.id;
    return this.pinnedTooltips.get(itemId);
  }

  // Static method to register a pinned tooltip
  static registerPinnedTooltip(item, tooltip) {
    const itemId = item.uuid || item.id;
    this.pinnedTooltips.set(itemId, tooltip);
  }

  // Static method to unregister a pinned tooltip
  static unregisterPinnedTooltip(item) {
    const itemId = item.uuid || item.id;
    this.pinnedTooltips.delete(itemId);
  }

  attach(cell, event) {
    // Avoid showing tooltips during dragging operations
    if (document.body.classList.contains("dragging-active")) {
      return;
    }

    // Clean up existing tooltip of the same type
    BaseTooltip.cleanup(this.tooltipType);

    // Remove any existing tooltip on the cell of the same type
    if (cell._hotbarTooltips?.get(this.tooltipType)) {
      const existingTooltip = cell._hotbarTooltips.get(this.tooltipType);
      if (existingTooltip._pinned) {
        existingTooltip.highlight(true);
        return;
      }
      existingTooltip.remove();
      cell._hotbarTooltips.delete(this.tooltipType);
    }

    // Store reference to this tooltip
    BaseTooltip.currentTooltips.set(this.tooltipType, this);

    // Create or get tooltip container
    let tooltipContainer = document.getElementById('bg3-tooltip-container');
    if (!tooltipContainer) {
        tooltipContainer = document.createElement('div');
        tooltipContainer.id = 'bg3-tooltip-container';
        tooltipContainer.classList.add('bg3-hud');
        document.body.appendChild(tooltipContainer);
    }

    // Create the tooltip element
    this.element = document.createElement("div");
    this.element.classList.add("bg3-hud", "custom-tooltip");
    this.element.dataset.type = this.tooltipType;
    this.element._tooltip = this;
    this._cell = cell;

    // Initialize cell's tooltip map if needed
    if (!cell._hotbarTooltips) {
      cell._hotbarTooltips = new Map();
    }

    // Build the content (subclasses override this method)
    this.buildContent();

    // Set up event listeners now that we have an element
    this._setupEventListeners();

    // Append to tooltip container instead of body
    tooltipContainer.appendChild(this.element);
    this.positionTooltip(event);

    // Save reference to tooltip on cell
    cell._hotbarTooltips.set(this.tooltipType, this);
  }

  // Override this method in subclasses to add custom content.
  buildContent() {
    if (!this.item) return;

    // Create main content container
    const content = document.createElement("div");
    content.classList.add("tooltip-content");

    // Icon
    const icon = document.createElement("img");
    icon.src = this.item.img || this.item.icon || "";
    icon.alt = this.item.name || "";
    icon.classList.add("tooltip-icon");
    content.appendChild(icon);

    // Name
    const nameEl = document.createElement("div");
    nameEl.classList.add("tooltip-name");
    nameEl.textContent = this.item.name || "";
    content.appendChild(nameEl);

    // Get common details (activation, range, target, duration)
    const details = getItemDetails(this.item);
    const detailsEl = document.createElement("div");
    detailsEl.classList.add("tooltip-details-list");
    
    // Build details HTML
    const detailsHTML = [];
    if (details.castingTime) detailsHTML.push(`<div><strong>Action:</strong> ${details.castingTime}</div>`);
    if (details.range) detailsHTML.push(`<div><strong>Range:</strong> ${details.range}</div>`);
    if (details.target) detailsHTML.push(`<div><strong>Target:</strong> ${details.target}</div>`);
    if (details.duration) detailsHTML.push(`<div><strong>Duration:</strong> ${details.duration}</div>`);
    
    if (detailsHTML.length > 0) {
      detailsEl.innerHTML = detailsHTML.join('');
      content.appendChild(detailsEl);
    }

    // Description
    if (this.item.system?.description?.value) {
      // Description header
      const descHeader = document.createElement("div");
      descHeader.classList.add("tooltip-description-header");
      descHeader.textContent = "Description";
      content.appendChild(descHeader);

      const descContainer = document.createElement("div");
      descContainer.classList.add("tooltip-description-container");
      
      const descEl = document.createElement("div");
      descEl.classList.add("tooltip-description");
      descContainer.appendChild(descEl);

      // Prepare roll data with activity context
      const rollData = this.item.getRollData ? this.item.getRollData() : {};
      if (this.item.selectedActivity) {
        rollData.activity = this.item.selectedActivity.id;
        // Include activity-specific data for lookups
        Object.assign(rollData, {
          save: this.item.selectedActivity.data.save || {},
          range: this.item.selectedActivity.data.range || {},
          target: this.item.selectedActivity.data.target || {},
          damage: this.item.selectedActivity.data.damage || {},
          duration: this.item.selectedActivity.data.duration || {}
        });
      }
      
      // Asynchronously enrich the description
      TextEditor.enrichHTML(this.item.system.description.value, {
        rollData: rollData,
        async: true,
        secrets: false,
        entities: true,
        links: true,
        rolls: true,
        relativeTo: this.item,
        activityId: this.item.selectedActivity?.id,
        removeBackground: true
      }).then(enrichedDesc => {
        descEl.innerHTML = enrichedDesc || "No description available.";
        // Nuke all backgrounds after enriching
        nukeBackgrounds(descEl);
        
        // Set up mutation observer to catch any dynamic changes
        const observer = new MutationObserver((mutations) => {
          mutations.forEach(() => nukeBackgrounds(descEl));
        });
        
        observer.observe(descEl, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class']
        });
        
        // Store observer reference for cleanup
        descEl._bgObserver = observer;
      });
      
      content.appendChild(descContainer);
    } else {
      const noDesc = document.createElement("div");
      noDesc.classList.add("tooltip-description");
      noDesc.textContent = "No description available.";
      content.appendChild(noDesc);
    }

    this.element.appendChild(content);
  }

  positionTooltip(event) {
    const padding = { right: 15, top: -10 };
    requestAnimationFrame(() => {
      // Guard: Ensure the element is still present before measuring it.
      if (!this.element) return;
      const tooltipRect = this.element.getBoundingClientRect();
      let left = event.clientX + padding.right;
      let top = event.clientY + padding.top - tooltipRect.height;
      if (left + tooltipRect.width > window.innerWidth) {
        left = event.clientX - tooltipRect.width - padding.right;
      }
      if (top < 0) top = event.clientY + 20;
      this.element.style.left = `${left}px`;
      this.element.style.top = `${top}px`;
      this.element.classList.add("visible");
    });
  }

  _setupEventListeners() {
    // Combined mouse down handler for both dragging and pin/unpin
    this.element.addEventListener("mousedown", (evt) => {
      if (evt.button === 1) { // Middle mouse button
        evt.preventDefault();
        evt.stopPropagation();
        if (this._pinned) {
          this.unpin();
        } else {
          this.pin();
        }
      } else if (evt.button === 0 && this._pinned) { // Left click on pinned tooltip
        evt.preventDefault();
        evt.stopPropagation();
        this.onMouseDown(evt);
      }
    });

    // Follow cursor if not pinned
    const onMouseMove = (evt) => {
      if (!this.element || this._pinned || this._isDragging) return;
      this.onCellMouseMove(evt);
    };
    this._cell.addEventListener("mousemove", onMouseMove);

    const onMouseLeave = () => {
      if (!this._pinned || this._isDragging) this.remove();
      else this.highlight(false);
    };
    this._cell.addEventListener("mouseleave", onMouseLeave);

    // Middle-click on cell to pin/unpin
    this._cell.addEventListener("mousedown", (evt) => {
      if (evt.button === 1) { // Middle mouse button
        evt.preventDefault();
        evt.stopPropagation();
        if (this._pinned) {
          this.unpin();
        } else {
          this.pin();
        }
      }
    });

    // Store event handlers for cleanup
    this._eventHandlers = {
      onMouseMove,
      onMouseLeave
    };
  }

  onMouseDown(evt) {
    if (evt.button !== 0) return;
    evt.preventDefault();
    if (!this._pinned) return;
    this.element.classList.add("dragging");
    const startX = evt.clientX;
    const startY = evt.clientY;
    const origRect = this.element.getBoundingClientRect();
    const origLeft = origRect.left;
    const origTop = origRect.top;
    const onDragMove = (e) => {
      let newX = origLeft + e.clientX - startX;
      let newY = origTop + e.clientY - startY;
      const tooltipRect = this.element.getBoundingClientRect();
      if (newX + tooltipRect.width > window.innerWidth - 10)
        newX = window.innerWidth - tooltipRect.width - 10;
      if (newY + tooltipRect.height > window.innerHeight - 10)
        newY = window.innerHeight - tooltipRect.height - 10;
      if (newX < 10) newX = 10;
      if (newY < 10) newY = 10;
      this.element.style.left = `${newX}px`;
      this.element.style.top = `${newY}px`;
    };
    const onDragEnd = () => {
      window.removeEventListener("mousemove", onDragMove);
      window.removeEventListener("mouseup", onDragEnd);
      this.element.classList.remove("dragging");
    };
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", onDragEnd);
  }

  onCellMouseMove(evt) {
    if (!this.element || this._pinned || this._isDragging) return;
    const padding = { right: 15, top: -10 };
    const tooltipRect = this.element.getBoundingClientRect();
    let left = evt.clientX + padding.right;
    let top = evt.clientY + padding.top - tooltipRect.height;
    if (left + tooltipRect.width > window.innerWidth)
      left = evt.clientX - tooltipRect.width - padding.right;
    if (top < 0) top = evt.clientY + 20;
    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }

  onCellMouseLeave() {
    if (!this._pinned || this._isDragging) this.remove();
    else this.highlight(false);
  }

  pin() {
    if (!this.element) return;
    this._pinned = true;
    this.element.classList.add("pinned");
    BaseTooltip.registerPinnedTooltip(this.item, this);
  }

  unpin() {
    if (!this.element) return;
    this._pinned = false;
    this.element.classList.remove("pinned");
    BaseTooltip.unregisterPinnedTooltip(this.item);
    this.remove();
  }

  remove() {
    // Clean up any observers
    this.element?.querySelectorAll('*').forEach(el => {
      if (el._bgObserver) {
        el._bgObserver.disconnect();
        delete el._bgObserver;
      }
    });
    
    // Clear this tooltip if it's the current one of its type
    if (BaseTooltip.currentTooltips.get(this.tooltipType) === this) {
      BaseTooltip.currentTooltips.delete(this.tooltipType);
    }
    if (this._pinned) {
      BaseTooltip.unregisterPinnedTooltip(this.item);
    }
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      
      // Clean up empty tooltip container
      const container = document.getElementById('bg3-tooltip-container');
      if (container && !container.hasChildNodes()) {
          container.remove();
      }
    }
    if (this._cell) {
      // Remove event listeners
      if (this._eventHandlers) {
        this._cell.removeEventListener("mousemove", this._eventHandlers.onMouseMove);
        this._cell.removeEventListener("mouseleave", this._eventHandlers.onMouseLeave);
      }
      
      this._cell._hotbarTooltips?.delete(this.tooltipType);
      if (this._cell._hotbarTooltips?.size === 0) {
        delete this._cell._hotbarTooltips;
      }
      this._cell = null;
    }
    this.element = null;
  }

  highlight(show) {
    if (!this.element) return;
    if (this._isHighlighted === show) return;
    this._isHighlighted = show;
    if (show) {
      this.element.classList.add("highlighted");
    } else {
      this.element.classList.remove("highlighted");
    }
  }

  // Add unhighlight method as an alias for highlight(false)
  unhighlight() {
    this.highlight(false);
  }
}
