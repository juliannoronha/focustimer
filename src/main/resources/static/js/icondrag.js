class IconManager {
    constructor() {
        this.icons = document.querySelectorAll('.draggable-icon');
        this.activeIcon = null;
        this.offset = { x: 0, y: 0 };
        
        // Define preset sizes (in pixels)
        this.presetSizes = [50, 75, 100, 150];
        this.currentSizeIndex = 1; // Start with default size (75px)
        
        // Load saved positions and sizes
        this.loadPositions();
        
        this.icons.forEach(icon => {
            icon.addEventListener('mousedown', (e) => this.handleMouseDown(e, icon));
            icon.addEventListener('dblclick', (e) => this.handleDoubleClick(e, icon));
            
            // Set initial position if saved
            const position = this.getPosition(icon.id);
            if (position) {
                icon.style.left = position.x + 'px';
                icon.style.top = position.y + 'px';
                icon.style.width = position.width + 'px';
                this.currentSizeIndex = this.findClosestPresetIndex(position.width);
            } else {
                // Default staggered positions if none saved
                const index = Array.from(this.icons).indexOf(icon);
                icon.style.left = `${20 + (index * 30)}px`;
                icon.style.top = `${20 + (index * 30)}px`;
                icon.style.width = '75px';
            }
        });
        
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDragging());
    }
    
    handleDoubleClick(e, icon) {
        e.preventDefault();
        // Cycle to next preset size
        this.currentSizeIndex = (this.currentSizeIndex + 1) % this.presetSizes.length;
        const newSize = this.presetSizes[this.currentSizeIndex];
        
        // Add animation class
        icon.classList.add('size-changing');
        
        // Apply new size with animation
        icon.style.width = newSize + 'px';
        
        // Remove animation class after animation completes
        setTimeout(() => {
            icon.classList.remove('size-changing');
        }, 300);
        
        // Save new size
        this.savePosition(icon.id, {
            x: parseInt(icon.style.left),
            y: parseInt(icon.style.top),
            width: newSize
        });
    }
    
    findClosestPresetIndex(width) {
        return this.presetSizes.reduce((closest, size, index) => {
            const currentDiff = Math.abs(size - width);
            const closestDiff = Math.abs(this.presetSizes[closest] - width);
            return currentDiff < closestDiff ? index : closest;
        }, 0);
    }
    
    handleMouseDown(e, icon) {
        e.preventDefault();
        this.activeIcon = icon;
        icon.classList.add('dragging');
        
        const rect = icon.getBoundingClientRect();
        this.offset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    drag(e) {
        if (!this.activeIcon) return;
        
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const iconRect = this.activeIcon.getBoundingClientRect();
        
        // Calculate new position with boundaries
        let newX = e.clientX - this.offset.x;
        let newY = e.clientY - this.offset.y;
        
        // Prevent dragging outside viewport
        newX = Math.max(0, Math.min(newX, viewportWidth - iconRect.width));
        newY = Math.max(0, Math.min(newY, viewportHeight - iconRect.height));
        
        this.activeIcon.style.left = newX + 'px';
        this.activeIcon.style.top = newY + 'px';
        
        this.savePosition(this.activeIcon.id, {
            x: newX,
            y: newY,
            width: parseInt(this.activeIcon.style.width)
        });
    }
    
    stopDragging() {
        if (!this.activeIcon) return;
        this.activeIcon.classList.remove('dragging');
        this.activeIcon = null;
    }
    
    savePosition(iconId, position) {
        const positions = JSON.parse(localStorage.getItem('heartPositions') || '{}');
        positions[iconId] = position;
        localStorage.setItem('heartPositions', JSON.stringify(positions));
    }
    
    getPosition(iconId) {
        const positions = JSON.parse(localStorage.getItem('heartPositions') || '{}');
        return positions[iconId];
    }
    
    loadPositions() {
        const positions = JSON.parse(localStorage.getItem('heartPositions') || '{}');
        this.icons.forEach(icon => {
            const position = positions[icon.id];
            if (position) {
                icon.style.left = position.x + 'px';
                icon.style.top = position.y + 'px';
                icon.style.width = position.width + 'px';
            }
        });
    }
}

// Initialize icon manager when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.iconManager = new IconManager();
});
