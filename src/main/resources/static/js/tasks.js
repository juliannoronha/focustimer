class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.container = document.querySelector('.tasks-container');
        this.tasksList = document.querySelector('.tasks-list');
        this.inputContainer = document.querySelector('.task-input-container');
        
        // Bind event listeners
        document.querySelector('.add-task-btn').addEventListener('click', () => this.showTaskInput());
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
            
            this.tasks.unshift(task);
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
            this.renderTasks();
            this.hideTaskInput();
        }
    }

    renderTasks() {
        this.tasksList.innerHTML = this.tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''} priority-${task.priority}" data-id="${task.id}">
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

        // Add event listeners to delete buttons
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
}

// Initialize tasks when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});
