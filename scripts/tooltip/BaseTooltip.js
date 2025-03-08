// BaseTooltip.js
import { getItemDetails } from "../utils/tooltipUtils.js";

export class BaseTooltip {
  // Static map to track pinned tooltips by item ID/UUID
  static pinnedTooltips = new Map();

  constructor(item) {
    this.item = item;
    this.element = null;
    this._pinned = false;
    this._isHighlighted = false;
    this._isDragging = false;
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
    if (document.body.classList.contains("dragging-active")) return;

    // Remove any existing tooltip on the cell
    if (cell._hotbarTooltip) {
      if (cell._hotbarTooltip._pinned) {
        cell._hotbarTooltip.highlight(true);
        return;
      }
      cell._hotbarTooltip.remove();
      cell._hotbarTooltip = null;
    }

    // Create the tooltip element
    this.element = document.createElement("div");
    this.element.classList.add("custom-tooltip");
    this.element._tooltip = this;
    this._cell = cell;

    // Build the content (subclasses override this method)
    this.buildContent();

    // Set up event listeners now that we have an element
    this._setupEventListeners();

    // Append and position
    document.body.appendChild(this.element);
    this.positionTooltip(event);

    // Save reference to tooltip on cell
    cell._hotbarTooltip = this;
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
        activityId: this.item.selectedActivity?.id
      }).then(enrichedDesc => {
        descEl.innerHTML = enrichedDesc || "No description available.";
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
    // Mouse down: start dragging if pinned
    this.element.addEventListener("mousedown", this.onMouseDown.bind(this));

    // Middle-click on tooltip to pin/unpin
    this.element.addEventListener("mousedown", (evt) => {
      if (evt.button === 1) { // Middle mouse button
        evt.preventDefault();
        if (this._pinned) {
          this.unpin();
        } else {
          this.pin();
        }
      }
    });

    // Follow cursor if not pinned
    this._cell.addEventListener("mousemove", this.onCellMouseMove.bind(this));
    this._cell.addEventListener("mouseleave", this.onCellMouseLeave.bind(this));

    // Middle-click on cell to pin/unpin
    this._cell.addEventListener("mousedown", (evt) => {
      if (evt.button === 1) { // Middle mouse button
        evt.preventDefault();
        if (this._pinned) {
          this.unpin();
        } else {
          this.pin();
        }
      }
    });
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
    if (this._pinned) {
      BaseTooltip.unregisterPinnedTooltip(this.item);
    }
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    if (this._cell) {
      this._cell._hotbarTooltip = null;
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
