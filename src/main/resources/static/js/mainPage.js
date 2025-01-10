// Simple Countdown Timer
class CountdownTimer {
    constructor() {
        // Initialize timer state with saved time or default
        const savedTime = localStorage.getItem('selectedTime');
        this.timeLeft = savedTime ? parseInt(savedTime) : 25 * 60;     // Use saved time or 25 minutes
        this.selectedTime = savedTime ? parseInt(savedTime) : 25 * 60;  // Store user's selected time
        this.isRunning = false;
        this.timerId = null;
        this.MIN_TIME = 0;           // Minimum time (0 minutes)
        this.MAX_TIME = 60 * 60;     // Maximum time (60 minutes)
        this.TIME_STEP = 5 * 60;     // 5 minutes in seconds

        // Get DOM elements
        this.timerDisplay = document.querySelector('.timer-text');
        this.startButton = document.querySelector('.start-button');
        this.resetButton = document.querySelector('.reset-button');
        this.navButtons = document.querySelectorAll('.nav-button');

        // Bind event listeners
        this.startButton.addEventListener('click', () => this.toggleTimer());
        this.resetButton.addEventListener('click', () => this.resetTimer());
        this.navButtons[0].addEventListener('click', () => this.adjustTime(-this.TIME_STEP));
        this.navButtons[1].addEventListener('click', () => this.adjustTime(this.TIME_STEP));

        // Initial display update
        this.updateDisplay();
        this.updateButtonVisibility();
    }

    adjustTime(seconds) {
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
            this.pauseTimer();
            this.startButton.textContent = 'START';
        } else {
            this.startTimer();
            this.startButton.textContent = 'PAUSE';
        }
        this.updateButtonVisibility();
    }

    startTimer() {
        this.isRunning = true;
        this.timerId = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateDisplay();
            } else {
                this.pauseTimer();
                this.startButton.textContent = 'START';
                this.updateButtonVisibility();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        clearInterval(this.timerId);
    }

    resetTimer() {
        this.timeLeft = this.selectedTime;  // Reset to selected time
        this.pauseTimer();
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
        if (this.isRunning) {
            this.resetButton.classList.add('hidden');
        } else {
            this.resetButton.classList.remove('hidden');
        }
    }

    updateNavButtons() {
        // Disable left button if at minimum time
        this.navButtons[0].disabled = this.timeLeft <= this.MIN_TIME;
        
        // Disable right button if at maximum time
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

// Initialize timer when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const timer = new CountdownTimer();
});