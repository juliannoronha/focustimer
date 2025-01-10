class HeartManager {
    constructor() {
        this.hearts = document.querySelectorAll('.draggable-heart');
        this.activeHeart = null;
        this.offset = { x: 0, y: 0 };
        
        // Define preset sizes (in pixels)
        this.presetSizes = [50, 75, 100, 150];
        this.currentSizeIndex = 1; // Start with default size (50px)
        
        // Load saved positions and sizes
        this.loadPositions();
        
        this.hearts.forEach(heart => {
            heart.addEventListener('mousedown', (e) => this.handleMouseDown(e, heart));
            heart.addEventListener('dblclick', (e) => this.handleDoubleClick(e, heart));
            
            // Set initial position if saved
            const position = this.getPosition(heart.id);
            if (position) {
                heart.style.left = position.x + 'px';
                heart.style.top = position.y + 'px';
                heart.style.width = position.width + 'px';
                // Find the closest preset size index
                this.currentSizeIndex = this.findClosestPresetIndex(position.width);
            } else {
                // Default positions if none saved
                heart.style.left = '20px';
                heart.style.top = '20px';
                heart.style.width = '50px';
            }
        });
        
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDragging());
    }
    
    handleDoubleClick(e, heart) {
        e.preventDefault();
        // Cycle to next preset size
        this.currentSizeIndex = (this.currentSizeIndex + 1) % this.presetSizes.length;
        const newSize = this.presetSizes[this.currentSizeIndex];
        
        // Add animation class
        heart.classList.add('size-changing');
        
        // Apply new size with animation
        heart.style.width = newSize + 'px';
        
        // Remove animation class after animation completes
        setTimeout(() => {
            heart.classList.remove('size-changing');
        }, 300);
        
        // Save new size
        this.savePosition(heart.id, {
            x: parseInt(heart.style.left),
            y: parseInt(heart.style.top),
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
    
    handleMouseDown(e, heart) {
        e.preventDefault();
        this.activeHeart = heart;
        heart.classList.add('dragging');
        
        const rect = heart.getBoundingClientRect();
        this.offset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    drag(e) {
        if (!this.activeHeart) return;
        
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const heartRect = this.activeHeart.getBoundingClientRect();
        
        // Calculate new position with boundaries
        let newX = e.clientX - this.offset.x;
        let newY = e.clientY - this.offset.y;
        
        // Prevent dragging outside viewport
        newX = Math.max(0, Math.min(newX, viewportWidth - heartRect.width));
        newY = Math.max(0, Math.min(newY, viewportHeight - heartRect.height));
        
        this.activeHeart.style.left = newX + 'px';
        this.activeHeart.style.top = newY + 'px';
        
        this.savePosition(this.activeHeart.id, {
            x: newX,
            y: newY,
            width: parseInt(this.activeHeart.style.width)
        });
    }
    
    stopDragging() {
        if (!this.activeHeart) return;
        this.activeHeart.classList.remove('dragging');
        this.activeHeart = null;
    }
    
    savePosition(heartId, position) {
        const positions = JSON.parse(localStorage.getItem('heartPositions') || '{}');
        positions[heartId] = position;
        localStorage.setItem('heartPositions', JSON.stringify(positions));
    }
    
    getPosition(heartId) {
        const positions = JSON.parse(localStorage.getItem('heartPositions') || '{}');
        return positions[heartId];
    }
    
    loadPositions() {
        const positions = JSON.parse(localStorage.getItem('heartPositions') || '{}');
        this.hearts.forEach(heart => {
            const position = positions[heart.id];
            if (position) {
                heart.style.left = position.x + 'px';
                heart.style.top = position.y + 'px';
                heart.style.width = position.width + 'px';
            }
        });
    }
}

// Initialize heart manager
document.addEventListener('DOMContentLoaded', () => {
    window.heartManager = new HeartManager();
});
