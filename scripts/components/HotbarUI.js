// HotbarUI.js
import { CONFIG } from '../utils/config.js';
import { GridContainer } from './GridContainer.js';
import { ContextMenu } from './ContextMenu.js';
import { PortraitCard } from './PortraitCard.js';
import { FilterContainer } from './FilterContainer.js';
import { ControlsContainer } from './ControlsContainer.js';
import { PassivesContainer } from './PassivesContainer.js';
import { ActiveEffectsContainer } from './ActiveEffectsContainer.js';
import { TooltipFactory } from '../tooltip/TooltipFactory.js';
import { DragDropManager } from '../managers/DragDropManager.js';
import { BG3Hotbar } from '../bg3-hotbar.js';

class HotbarUI {
  constructor(manager) {
    this.manager = manager;
    this.element = null;
    this.subContainer = null;
    this.gridContainers = [];
    this.contextMenu = null;
    this.portraitCard = null;
    this.filterContainer = null;
    this.controlsContainer = null;
    this.passivesContainer = null;
    this.activeEffectsContainer = null;
    this._fadeTimeout = null;
    this.dragDropManager = new DragDropManager(this);

    // Initialize bound methods as class properties
    this._handleMouseMove = (event) => {
      if (!this.element || !this.element.isConnected || 
          (BG3Hotbar.controlsManager.isLockSettingEnabled('opacity') && 
           BG3Hotbar.controlsManager.isMasterLockEnabled())) return;
      // Check if mouse is over any element from our module
      const isOverModule = event.target?.closest('#bg3-hotbar-container') !== null;
      this._updateFadeState(!isOverModule);
    };

    this._handleKeyDown = (event) => {
      // Stub for keyboard event handling
      // Implementation can be added later if needed
    };
    
    this._createUI();
    this._initializeFadeOut();
  }

  _createUI() {
    // Check if UI is enabled in settings
    if (!game.settings.get(CONFIG.MODULE_NAME, 'uiEnabled')) {
      // Clean up any existing UI
      if (this.element) {
        this.destroy();
      }
      return;
    }

    // Remove existing UI if it exists
    if (this.element) {
      this.destroy();
    }

    // Create main container with transition
    this.element = document.createElement("div");
    this.element.id = "bg3-hotbar-container";
    this.element.classList.add("bg3-hud");
    this.element.style.transition = "transform 0.3s ease-in-out, opacity 0.3s ease-in-out";
    this.element.style.opacity = game.settings.get(CONFIG.MODULE_NAME, 'normalOpacity');
    this.element.style.setProperty('--bg3-scale-ui', game.settings.get(CONFIG.MODULE_NAME, 'uiScale')/100);
        
    // Create sub container
    this.subContainer = document.createElement("div");
    this.subContainer.classList.add("bg3-hotbar-subcontainer");
    this.element.appendChild(this.subContainer);

    
    // Create passives container
    this.passivesContainer = new PassivesContainer(this);
    this.subContainer.appendChild(this.passivesContainer.element);
    
    // Create active effects container
    this.activeEffectsContainer = new ActiveEffectsContainer(this);
    this.subContainer.appendChild(this.activeEffectsContainer.element);

    // Create grid containers based on manager's data
    this.gridContainers = this.manager.containers.map((containerData, index) => {
      const container = new GridContainer(this, containerData, index);
      return container;
    });

    // Add drag bars between containers
    this.gridContainers.forEach((container, index) => {
      this.subContainer.appendChild(container.element);
      if (index < this.gridContainers.length - 1) {
        const dragBar = this._createDragBar(index);
        this.subContainer.appendChild(dragBar);
      }
    });

    // Create context menu
    this.contextMenu = new ContextMenu(this);

    // Create filter container
    this.filterContainer = new FilterContainer(this);
    this.subContainer.appendChild(this.filterContainer.element);

    // Create portrait card for first container
    if (this.gridContainers.length > 0) {
      const firstContainer = this.gridContainers[0];
      this.portraitCard = new PortraitCard(firstContainer);
      this.subContainer.appendChild(this.portraitCard.element);
    }

    // Create settings menu with control column
    this.controlsContainer = new ControlsContainer(this);

    // Add keyboard event listener
    document.addEventListener('keydown', this._handleKeyDown);

    // Append to document
    document.body.appendChild(this.element);

    // Initial render
    this.render();
  }

  /**
   * Creates a drag bar between two containers for resizing columns.
   */
  _createDragBar(index) {
    const dragBar = document.createElement('div');
    dragBar.classList.add('hotbar-drag-bar');
    
    // Track drag state
    let isDragging = false;
    let startX = 0;
    let startLeftCols = 0;
    let startRightCols = 0;
    let totalCols = 0;
    let cellWidth = 0;
    
    // Create indicator as child of drag bar
    const dragIndicator = document.createElement('div');
    dragIndicator.classList.add('drag-indicator');
    dragBar.appendChild(dragIndicator);
    
    // Mouse down event to start dragging
    dragBar.addEventListener('mousedown', (e) => {
      e.preventDefault();
      
      // Initialize drag state
      isDragging = true;
      startX = e.clientX;
      startLeftCols = this.gridContainers[index].data.cols;
      startRightCols = this.gridContainers[index + 1].data.cols;
      totalCols = startLeftCols + startRightCols;
      
      // Get the cell width from the container
      const containerRect = this.gridContainers[index].element.getBoundingClientRect();
      cellWidth = containerRect.width / startLeftCols;
      
      // Add visual feedback classes
      dragBar.classList.add('dragging');
      dragIndicator.classList.add('visible');
      document.body.classList.add('dragging-active');
      this.element.classList.add('dragging-in-progress');
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });
    
    // Define event handlers
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      // Calculate the delta in pixels
      const deltaX = e.clientX - startX;
      
      // Calculate the delta in columns (can be fractional)
      const deltaColsFractional = deltaX / cellWidth;
      
      // Calculate potential new column counts
      const newLeftCols = Math.max(1, Math.min(totalCols - 1, startLeftCols + deltaColsFractional));
      const newRightCols = Math.max(1, startRightCols - deltaColsFractional);
      
      // Only proceed if both containers would have at least 1 column
      if (newLeftCols >= 1 && newRightCols >= 1) {
        // Update the drag indicator position
        const containerRect = this.gridContainers[index].element.getBoundingClientRect();
        const containerBounds = this.element.getBoundingClientRect();
        const newX = containerRect.left - containerBounds.left + (newLeftCols * cellWidth);
        dragIndicator.style.transform = `translateX(${deltaX}px)`;
      }
    };
    
    const handleMouseUp = (e) => {
      if (!isDragging) return;
      
      // Calculate the final delta
      const deltaX = e.clientX - startX;
      const deltaColsFractional = deltaX / cellWidth;
      
      // Round to the nearest column
      const deltaColsRounded = Math.round(deltaColsFractional);
      
      // Only apply changes if we've moved at least half a column
      if (Math.abs(deltaColsFractional) >= 0.5) {
        // Calculate new column counts
        const newLeftCols = Math.max(1, Math.min(totalCols - 1, startLeftCols + deltaColsRounded));
        const newRightCols = Math.max(1, startRightCols - deltaColsRounded);
        
        // Update both containers' column counts
        this.gridContainers[index].data.cols = newLeftCols;
        this.gridContainers[index + 1].data.cols = newRightCols;
        
        // Render both containers with new column counts
        this.gridContainers[index].render();
        this.gridContainers[index + 1].render();
        
        // Save the changes
        this.manager.persist();
      }
      
      // Clean up
      isDragging = false;
      dragIndicator.classList.remove('visible');
      dragIndicator.style.transform = '';
      dragBar.classList.remove('dragging');
      document.body.classList.remove('dragging-active');
      this.element.classList.remove('dragging-in-progress');
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    // Clean up function for when the UI is destroyed
    dragBar._cleanup = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    return dragBar;
  }

  /**
   * Re-render everything.
   */
  async render() {
    // Render grid containers
    this.gridContainers.forEach(container => {
      container.render();
    });

    // Update filter container
    if (this.filterContainer) {
      this.filterContainer.render();
    }

    // Update portrait card
    if (this.portraitCard) {
      const token = canvas.tokens.get(this.manager.currentTokenId);
      if (token?.actor) {
        this.portraitCard.update(token.actor);
      }
    }

    // Update passives container
    if (this.passivesContainer) {
      await this.passivesContainer.update();
    }

    // Update active effects container
    if (this.activeEffectsContainer) {
      await this.activeEffectsContainer.update();
    }
  }

  /**
   * Destroy the UI and clean up.
   */
  destroy() {
    // Remove all event listeners
    document.removeEventListener('keydown', this._handleKeyDown);
    
    // Clean up drag bars
    this.element.querySelectorAll('.hotbar-drag-bar').forEach(bar => {
      if (bar._cleanup) bar._cleanup();
    });
    
    // Remove the element from the DOM
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    // Clean up portrait card
    if (this.portraitCard && typeof this.portraitCard.destroy === 'function') {
      this.portraitCard.destroy();
    }
    
    // Clean up filter container
    if (this.filterContainer && typeof this.filterContainer.destroy === 'function') {
      this.filterContainer.destroy();
    }
    
    // Clean up controls container
    if (this.controlsContainer && typeof this.controlsContainer.destroy === 'function') {
      this.controlsContainer.destroy();
    }
    
    // Clean up context menu
    if (this.contextMenu && typeof this.contextMenu.destroy === 'function') {
      this.contextMenu.destroy();
    }

    document.removeEventListener('mousemove', this._handleMouseMove);
    if (this._fadeTimeout) {
      clearTimeout(this._fadeTimeout);
      this._fadeTimeout = null;
    }

    // Clean up passives container
    if (this.passivesContainer) {
      this.passivesContainer.destroy();
      this.passivesContainer = null;
    }

    // Clean up active effects container
    if (this.activeEffectsContainer) {
      this.activeEffectsContainer.destroy();
      this.activeEffectsContainer = null;
    }
  }

  // Add these new methods for the settings menu actions
  resetLayout() {
    // Reset to default layout
    this.gridContainers.forEach(container => {
      container.data.rows = CONFIG.ROWS;
      container.data.cols = CONFIG.INITIAL_COLS;
      container.render();
    });
    this.manager.persist();
  }

  clearAllItems() {
    // Clear all items from all containers
    this.gridContainers.forEach(container => {
      container.data.items = {};
      container.render();
    });
    this.manager.persist();
  }

  async importLayout() {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const layout = JSON.parse(e.target.result);
            // Apply the layout
            this.manager.containers = layout;
            await this.manager.persist();
            // Recreate UI with new layout
            this.destroy();
            this._createUI();
          } catch (error) {
            console.error('Failed to import layout:', error);
            ui.notifications.error('Failed to import layout');
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  }

  exportLayout() {
    // Export current layout as JSON
    const layout = this.manager.containers;
    const dataStr = JSON.stringify(layout, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportName = 'bg3-hotbar-layout.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  }

  async update(token) {
    if (!token) return;
    
    const actor = token.actor;
    if (!actor) return;
    
    // Update all components with the new actor
    for (const container of this.gridContainers) {
      container.lastKnownActorId = actor.id;
      container.render();
    }
    
    if (this.portraitCard) {
      this.portraitCard.update(actor);
    }
  }

  _initializeFadeOut() {
    // Add mousemove listener to document
    document.addEventListener('mousemove', this._handleMouseMove);
    
    // Set initial state
    this._updateFadeState(false);
  }

  _updateFadeState(shouldFade) {
    // Clear any existing timeout
    if (this._fadeTimeout) {
      clearTimeout(this._fadeTimeout);
      this._fadeTimeout = null;
    }

    // If opacity is locked and master lock is enabled, always use normal opacity
    if (BG3Hotbar.controlsManager.isLockSettingEnabled('opacity') && 
        BG3Hotbar.controlsManager.isMasterLockEnabled()) {
      this.element.classList.remove('faded');
      this.element.style.opacity = game.settings.get(CONFIG.MODULE_NAME, 'normalOpacity');
      return;
    }

    // If we shouldn't fade or mouse is over module
    if (!shouldFade) {
      this.element.classList.remove('faded');
      this.element.style.opacity = game.settings.get(CONFIG.MODULE_NAME, 'normalOpacity');
      return;
    }

    // Set timeout to fade
    const delay = game.settings.get(CONFIG.MODULE_NAME, 'fadeOutDelay') * 1000;
    this._fadeTimeout = setTimeout(() => {
      if (this.element?.isConnected) {
        this.element.classList.add('faded');
        this.element.style.opacity = game.settings.get(CONFIG.MODULE_NAME, 'fadedOpacity');
      }
    }, delay);
  }

  // Update methods that other components can call
  updateOpacity() {
    const isFaded = this.element?.classList.contains('faded');
    this._updateFadeState(isFaded);
  }

  updateFadeDelay() {
    const isFaded = this.element?.classList.contains('faded');
    this._updateFadeState(isFaded);
  }
}

export { HotbarUI };
