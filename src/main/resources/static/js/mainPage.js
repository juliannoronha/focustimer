class CountdownTimer {
    constructor() {
        // Initialize audio for different actions
        this.startSound = new Audio('/audio/start-sound.mp3');
        this.pauseSound = new Audio('/audio/start-sound.mp3');
        this.resetSound = new Audio('/audio/start-sound.mp3');
        this.adjustSound = new Audio('/audio/start-sound.mp3');
        this.tickingSound = new Audio('/audio/clockticking.mp3');
        
        // Set volume for all sounds
        [this.startSound, this.pauseSound, this.resetSound, this.adjustSound].forEach(sound => {
            sound.volume = 0.5; // Set volume to 50%
        });
        
        // Set ticking sound properties
        this.tickingSound.volume = 0.3; // Lower volume for background ticking
        this.tickingSound.loop = true; // Enable looping for continuous ticking
        
        // Timer durations
        this.FOCUS_TIME = 25 * 60;  // 25 minutes
        this.BREAK_TIME = 5 * 60;   // 5 minutes
        
        // Initialize timer state
        this.currentMode = 'focus';  // 'focus' or 'break'
        this.timeLeft = this.FOCUS_TIME;
        this.selectedTime = this.FOCUS_TIME;
        this.isRunning = false;
        this.timerId = null;
        this.isMuted = false;
        this.MIN_TIME = 0;           // Minimum time (0 minutes)
        this.MAX_TIME = 60 * 60;     // Maximum time (60 minutes)
        this.TIME_STEP = 5 * 60;     // 5 minutes in seconds

        // Get DOM elements
        this.timerDisplay = document.querySelector('.timer-text');
        this.startButton = document.querySelector('.start-button');
        this.resetButton = document.querySelector('.reset-button');
        this.navButtons = document.querySelectorAll('.nav-button');
        this.muteButton = document.querySelector('.mute-button');
        this.timerTabs = document.querySelectorAll('.timer-tab');

        // Bind event listeners
        this.startButton.addEventListener('click', () => this.toggleTimer());
        this.resetButton.addEventListener('click', () => this.resetTimer());
        this.navButtons[0].addEventListener('click', () => this.adjustTime(-this.TIME_STEP));
        this.navButtons[1].addEventListener('click', () => this.adjustTime(this.TIME_STEP));
        this.muteButton.addEventListener('click', () => this.toggleMute());
        this.timerTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchMode(tab.dataset.mode));
        });

        // Initial display update
        this.updateDisplay();
        this.updateButtonVisibility();
    }

    adjustTime(seconds) {
        // Reset and play adjust sound
        this.adjustSound.currentTime = 0;  // Reset the audio to start
        this.adjustSound.play().catch(error => {
            console.log("Audio playback failed:", error);
        });

        // If timer was paused, force a complete reset before adjusting time
        if (!this.isRunning && this.timeLeft !== this.selectedTime) {
            this.resetTimer();
        }
        
        const newTime = this.timeLeft + seconds;
        
        if (newTime < this.MIN_TIME) {
            this.timeLeft = this.MIN_TIME;
        } else if (newTime > this.MAX_TIME) {
            this.timeLeft = this.MAX_TIME;
        } else {
            this.timeLeft = newTime;
        }
        
        // Store the selected time and save to localStorage
        this.selectedTime = this.timeLeft;
        localStorage.setItem('selectedTime', this.selectedTime.toString());
        
        // Enhanced visual feedback
        this.timerDisplay.classList.add('time-updated');
        setTimeout(() => {
            this.timerDisplay.classList.remove('time-updated');
        }, 600);
        
        this.updateDisplay();
        this.updateButtonVisibility(); // Ensure reset button visibility is updated
    }

    toggleTimer() {
        if (this.isRunning) {
            // Play pause sound
            this.pauseSound.play().catch(error => {
                console.log("Audio playback failed:", error);
            });
            this.pauseTimer();
            this.startButton.textContent = 'START';
        } else {
            // Play start sound
            this.startSound.play().catch(error => {
                console.log("Audio playback failed:", error);
            });
            this.startTimer();
            this.startButton.textContent = 'PAUSE';
        }
        this.updateButtonVisibility();
    }
    // Adjust here for clock ticking effect - controls the visual and audio feedback
    // of time passing while the timer is running

    startTimer() {
        this.isRunning = true;
        // Remove paused class if it exists
        this.timerDisplay.classList.remove('paused');
        
        // Start the ticking sound with a delay if not muted
        if (!this.isMuted) {
            setTimeout(() => {
                this.tickingSound.play().catch(error => {
                    console.log("Ticking sound playback failed:", error);
                });
            }, 510); // 300ms delay before starting the ticking sound
        }

        // Show mute button
        this.muteButton.classList.remove('hidden');
        
        // Disable navigation buttons while timer is running
        this.navButtons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        });
        
        this.timerId = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateDisplay();
            } else {
                // Timer completed
                if (this.currentMode === 'focus') {
                    // Switch to break mode
                    this.switchMode('break');
                    this.startTimer();
                } else {
                    this.pauseTimer();
                    this.startButton.textContent = 'START';
                    this.updateButtonVisibility();
                }
            }
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        clearInterval(this.timerId);
        
        // Stop the ticking sound
        this.tickingSound.pause();
        this.tickingSound.currentTime = 0;

        // Hide mute button
        this.muteButton.classList.add('hidden');
        
        // Re-enable navigation buttons and update their state
        this.updateNavButtons();
        
        // Add paused class for animation
        this.timerDisplay.classList.add('paused');
        // Remove the class after animation completes
        setTimeout(() => {
            this.timerDisplay.classList.remove('paused');
        }, 300);
    }

    resetTimer() {
        // Play reset sound
        this.resetSound.play().catch(error => {
            console.log("Audio playback failed:", error);
        });
        
        // Hide mute button
        this.muteButton.classList.add('hidden');
        
        this.timeLeft = this.selectedTime;  // Reset to selected time
        this.pauseTimer();
        this.startButton.textContent = 'START';
        this.updateDisplay();
        this.updateButtonVisibility();
    }

    switchMode(mode) {
        if (this.currentMode === mode) return;
        
        this.currentMode = mode;
        this.selectedTime = mode === 'focus' ? this.FOCUS_TIME : this.BREAK_TIME;
        this.timeLeft = this.selectedTime;
        
        // Update UI
        this.timerTabs.forEach(tab => {
            if (tab.dataset.mode === mode) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Reset timer state
        if (this.isRunning) {
            this.pauseTimer();
        }
        this.startButton.textContent = 'START';
        this.updateDisplay();
        this.updateButtonVisibility();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update navigation buttons state
        this.updateNavButtons();
    }

    updateButtonVisibility() {
        // Add a small delay to ensure proper transition
        if (this.isRunning) {
            this.resetButton.style.opacity = '0';
            document.querySelector('.timer-tabs').style.opacity = '0';
            
            setTimeout(() => {
                this.resetButton.classList.add('hidden');
                document.querySelector('.timer-tabs').classList.add('hidden');
            }, 300); // Match the transition duration in CSS
        } else {
            this.resetButton.classList.remove('hidden');
            document.querySelector('.timer-tabs').classList.remove('hidden');
            
            // Force a reflow
            this.resetButton.offsetHeight;
            document.querySelector('.timer-tabs').offsetHeight;
            
            this.resetButton.style.opacity = '1';
            document.querySelector('.timer-tabs').style.opacity = '1';
        }
    }

    updateNavButtons() {
        if (this.isRunning) {
            // Disable all navigation buttons while timer is running
            this.navButtons.forEach(button => {
                button.disabled = true;
                button.style.opacity = '0.5';
                button.style.cursor = 'not-allowed';
            });
        } else {
            // Only disable buttons based on time limits when timer is not running
            this.navButtons[0].disabled = this.timeLeft <= this.MIN_TIME;
            this.navButtons[1].disabled = this.timeLeft >= this.MAX_TIME;
            
            // Update button styles based on disabled state
            this.navButtons.forEach(button => {
                if (button.disabled) {
                    button.style.opacity = '0.5';
                    button.style.cursor = 'not-allowed';
                } else {
                    button.style.opacity = '1';
                    button.style.cursor = 'pointer';
                }
            });
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.muteButton.textContent = '🔇';
            this.tickingSound.pause();
        } else {
            this.muteButton.textContent = '🔊';
            if (this.isRunning) {
                this.tickingSound.play().catch(error => {
                    console.log("Ticking sound playback failed:", error);
                });
            }
        }
    }
}

// Initialize timer when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const timer = new CountdownTimer();
});
