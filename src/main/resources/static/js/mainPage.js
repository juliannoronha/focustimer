// Particle effect configuration
const particleConfig = {
    interval: 3000,      // How often to create new particles
    duration: 20000,     // How long each particle lasts
    minSize: 6,          // Minimum particle size
    maxSize: 10,         // Maximum particle size
    colors: ['#fcd6e3', '#fdf1f5', '#ffb6c1'], // Theme colors for particles
};

// Create and animate particles
function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random size
    const size = Math.random() * (particleConfig.maxSize - particleConfig.minSize) + particleConfig.minSize;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Random position
    particle.style.left = Math.random() * window.innerWidth + 'px';
    
    // Random color from theme
    particle.style.backgroundColor = particleConfig.colors[Math.floor(Math.random() * particleConfig.colors.length)];
    
    // Add to document
    document.body.appendChild(particle);
    
    // Remove after animation completes
    setTimeout(() => {
        particle.remove();
    }, particleConfig.duration);
}

// Start creating particles
function initParticles() {
    setInterval(createParticle, particleConfig.interval);
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
});
