class TaskManager {
    constructor() {
        // Initialize click sound
        this.clickSound = new Audio('/audio/start-sound.mp3');
        this.clickSound.volume = 0.5;

        // Initialize single creation sound
        this.createSound = new Audio('/audio/notecreate.mp3');
        this.createSound.volume = 0.8;

        // Initialize writing sound
        this.writeSound = new Audio('/audio/notewrite.mp3');
        this.writeSound.volume = 1;
        
        // Initialize delete sound
        this.deleteSound = new Audio('/audio/notedelete.mp3');
        this.deleteSound.volume = 0.5;

        // Initialize checkbox sound
        this.checkboxSound = new Audio('/audio/checkbox.mp3');
        this.checkboxSound.volume = 0.2;
        
        // Define the total duration of the writing audio file (in seconds)
        this.writeSoundDuration = 17;
        
        // Add typing sound debounce timer
        this.typingTimer = null;

        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.container = document.querySelector('.tasks-container');
        this.tasksList = document.querySelector('.tasks-list');
        this.inputContainer = document.querySelector('.task-input-container');
        
        // Bind event listeners
        document.querySelector('.add-task-btn').addEventListener('click', () => {
            this.clickSound.currentTime = 0;
            this.clickSound.play().catch(error => {
                console.log("Audio playback failed:", error);
            });
            this.showTaskInput();
        });

        // Add typing sound event listener
        document.querySelector('.task-input').addEventListener('input', () => {
            // Clear any existing timer
            if (this.typingTimer) {
                clearTimeout(this.typingTimer);
                this.writeSound.pause();
                this.writeSound.currentTime = 0;
            }
            
            // Play random 3-second segment of writing sound
            const randomStartTime = Math.random() * (this.writeSoundDuration - 3);
            this.writeSound.currentTime = randomStartTime;
            this.writeSound.play().catch(error => {
                console.log("Writing sound playback failed:", error);
            });
            
            // Stop after 3 seconds
            this.typingTimer = setTimeout(() => {
                this.writeSound.pause();
                this.writeSound.currentTime = 0;
                this.typingTimer = null;
            }, 3000);
        });

        document.querySelector('.save-task').addEventListener('click', () => this.saveTask());
        document.querySelector('.cancel-task').addEventListener('click', () => this.hideTaskInput());
        
        // Initial render
        this.renderTasks();
    }

    showTaskInput() {
        this.inputContainer.classList.remove('hidden');
        document.querySelector('.task-input').focus();
    }

    hideTaskInput() {
        this.inputContainer.classList.add('hidden');
        document.querySelector('.task-input').value = '';
    }

    saveTask() {
        const taskText = document.querySelector('.task-input').value.trim();
        const prioritySelect = document.querySelector('.task-priority').value;
        
        if (taskText) {
            const task = {
                id: Date.now(),
                text: taskText,
                date: new Date().toISOString(),
                completed: false,
                priority: prioritySelect
            };
            
            // Stop any ongoing writing sound
            if (this.typingTimer) {
                clearTimeout(this.typingTimer);
                this.writeSound.pause();
                this.writeSound.currentTime = 0;
            }

            // Play creation sound
            this.createSound.currentTime = 0;
            this.createSound.play().catch(error => {
                console.log("Task creation sound playback failed:", error);
            });
            
            this.tasks.unshift(task);
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
            this.renderTasks();
            this.hideTaskInput();
        }
    }

    renderTasks() {
        this.tasksList.innerHTML = this.tasks.map((task, index) => `
            <div class="task-item ${task.completed ? 'completed' : ''} priority-${task.priority}" 
                 draggable="true" 
                 data-id="${task.id}"
                 data-index="${index}">
                <div class="task-content" onclick="taskManager.toggleTaskComplete(${task.id})">
                    <div class="task-checkbox">
                        <input type="checkbox" ${task.completed ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </div>
                    <div class="task-text">
                        <p>${task.text}</p>
                        <small>${new Date(task.date).toLocaleDateString()}</small>
                    </div>
                </div>
                <button class="delete-task">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `).join('');

        // Add drag event listeners to all tasks
        const taskElements = document.querySelectorAll('.task-item');
        taskElements.forEach(task => {
            task.addEventListener('dragstart', this.handleDragStart.bind(this));
            task.addEventListener('dragover', this.handleDragOver.bind(this));
            task.addEventListener('drop', this.handleDrop.bind(this));
            task.addEventListener('dragenter', this.handleDragEnter.bind(this));
            task.addEventListener('dragleave', this.handleDragLeave.bind(this));
        });

        // Add existing delete button listeners
        document.querySelectorAll('.delete-task').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = parseInt(button.closest('.task-item').dataset.id);
                this.deleteTask(taskId);
            });
        });
    }

    deleteTask(taskId) {
        const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (!taskElement) return;

        // Play delete sound
        this.deleteSound.currentTime = 0;
        this.deleteSound.play().catch(error => {
            console.log("Delete sound playback failed:", error);
        });

        taskElement.classList.add('deleting');
        
        setTimeout(() => {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
            this.renderTasks();
        }, 300);
    }

    toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
            if (task.completed) {
                // If it's currently completed, add was-completed before unchecking
                taskElement.classList.add('was-completed');
            }
            task.completed = !task.completed;
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
            
            // Play checkbox sound
            this.checkboxSound.currentTime = 0;
            this.checkboxSound.play().catch(error => {
                console.log("Checkbox sound playback failed:", error);
            });
            
            // Update the UI immediately without full re-render
            taskElement.classList.toggle('completed');
            const checkbox = taskElement.querySelector('input[type="checkbox"]');
            checkbox.checked = task.completed;
            
            // Remove was-completed class after animation completes
            setTimeout(() => {
                taskElement.classList.remove('was-completed');
            }, 300);
        }
    }

    // Drag event handlers
    handleDragStart(e) {
        e.target.classList.add('dragging');
        
        // Create a custom drag image
        const dragImage = e.target.cloneNode(true);
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        
        // Set the custom drag image
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        e.dataTransfer.setData('text/plain', e.target.dataset.index);
        
        // Remove the temporary element after drag starts
        requestAnimationFrame(() => {
            document.body.removeChild(dragImage);
        });
    }

    handleDragOver(e) {
        e.preventDefault();
    }

    handleDragEnter(e) {
        e.preventDefault();
        const taskItem = e.target.closest('.task-item');
        if (taskItem && !taskItem.classList.contains('dragging')) {
            taskItem.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        const taskItem = e.target.closest('.task-item');
        if (taskItem) {
            taskItem.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const dropZone = e.target.closest('.task-item');
        
        if (dropZone) {
            const dropIndex = parseInt(dropZone.dataset.index);
            dropZone.classList.remove('drag-over');
            
            // Reorder tasks array
            const [draggedTask] = this.tasks.splice(draggedIndex, 1);
            this.tasks.splice(dropIndex, 0, draggedTask);
            
            // Save to localStorage
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
            
            // Render immediately
            this.renderTasks();
            
            // Add animation class to the newly rendered task
            const updatedTask = document.querySelector(`.task-item[data-id="${draggedTask.id}"]`);
            if (updatedTask) {
                updatedTask.classList.add('dropped');
                setTimeout(() => {
                    updatedTask.classList.remove('dropped');
                }, 300);
            }
        }
        
        document.querySelector('.dragging')?.classList.remove('dragging');
    }
}

// Initialize tasks when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});
