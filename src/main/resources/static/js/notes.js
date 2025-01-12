class NotesManager {
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
        
        // Define the total duration of the writing audio file (in seconds)
        this.writeSoundDuration = 17;
        
        // Add typing sound debounce timer
        this.typingTimer = null;
        
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.container = document.querySelector('.notes-container');
        this.notesList = document.querySelector('.notes-list');
        this.inputContainer = document.querySelector('.note-input-container');
        
        // Bind event listeners
        document.querySelector('.add-note-btn').addEventListener('click', () => {
            this.clickSound.currentTime = 0;
            this.clickSound.play().catch(error => {
                console.log("Audio playback failed:", error);
            });
            this.showNoteInput();
        });

        // Add typing sound event listener
        document.querySelector('.note-input').addEventListener('input', () => {
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
            }, 1000);
        });

        document.querySelector('.save-note').addEventListener('click', () => this.saveNote());
        document.querySelector('.cancel-note').addEventListener('click', () => this.hideNoteInput());
        
        // Initial render
        this.renderNotes();
    }

    showNoteInput() {
        this.inputContainer.classList.remove('hidden');
        document.querySelector('.note-input').focus();
    }

    hideNoteInput() {
        this.inputContainer.classList.add('hidden');
        document.querySelector('.note-input').value = '';
    }

    saveNote() {
        const noteText = document.querySelector('.note-input').value.trim();
        if (noteText) {
            const note = {
                id: Date.now(),
                text: noteText,
                date: new Date().toISOString()
            };
            
            this.notes.unshift(note);
            localStorage.setItem('notes', JSON.stringify(this.notes));
            this.renderNotes();
            this.hideNoteInput();

            // Stop any ongoing writing sound
            if (this.typingTimer) {
                clearTimeout(this.typingTimer);
                this.writeSound.pause();
                this.writeSound.currentTime = 0;
            }

            // Play creation sound
            this.createSound.currentTime = 0;
            this.createSound.play().catch(error => {
                console.log("Note creation sound playback failed:", error);
            });
        }
    }

    renderNotes() {
        this.notesList.innerHTML = this.notes.map((note, index) => `
            <div class="note-item" 
                 draggable="true" 
                 data-id="${note.id}"
                 data-index="${index}">
                <div class="note-content">
                    <p>${note.text}</p>
                    <small>${new Date(note.date).toLocaleDateString()}</small>
                </div>
                <button class="delete-note">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `).join('');

        // Add drag event listeners to all notes
        const noteElements = document.querySelectorAll('.note-item');
        noteElements.forEach(note => {
            note.addEventListener('dragstart', this.handleDragStart.bind(this));
            note.addEventListener('dragover', this.handleDragOver.bind(this));
            note.addEventListener('drop', this.handleDrop.bind(this));
            note.addEventListener('dragenter', this.handleDragEnter.bind(this));
            note.addEventListener('dragleave', this.handleDragLeave.bind(this));
        });

        // Add existing delete button listeners
        document.querySelectorAll('.delete-note').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const noteId = parseInt(button.closest('.note-item').dataset.id);
                this.deleteNote(noteId);
            });
        });
    }

    deleteNote(noteId) {
        const noteElement = document.querySelector(`.note-item[data-id="${noteId}"]`);
        if (!noteElement) return;

        // Play delete sound
        this.deleteSound.currentTime = 0;
        this.deleteSound.play().catch(error => {
            console.log("Delete sound playback failed:", error);
        });

        noteElement.classList.add('deleting');
        
        setTimeout(() => {
            // Remove from array
            this.notes = this.notes.filter(note => note.id !== noteId);
            // Update localStorage
            localStorage.setItem('notes', JSON.stringify(this.notes));
            // Re-render notes
            this.renderNotes();
        }, 300);
    }

    createNoteElement(noteText) {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        
        const noteContent = document.createElement('div');
        noteContent.className = 'note-content';
        noteContent.textContent = noteText;

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-note';
        deleteButton.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
        `;
        
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteNote(noteItem);
        });

        noteItem.appendChild(noteContent);
        noteItem.appendChild(deleteButton);
        
        return noteItem;
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
        const noteItem = e.target.closest('.note-item');
        if (noteItem && !noteItem.classList.contains('dragging')) {
            noteItem.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        const noteItem = e.target.closest('.note-item');
        if (noteItem) {
            noteItem.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const dropZone = e.target.closest('.note-item');
        
        if (dropZone) {
            const dropIndex = parseInt(dropZone.dataset.index);
            dropZone.classList.remove('drag-over');
            
            // Reorder notes array
            const [draggedNote] = this.notes.splice(draggedIndex, 1);
            this.notes.splice(dropIndex, 0, draggedNote);
            
            // Save to localStorage
            localStorage.setItem('notes', JSON.stringify(this.notes));
            
            // Re-render notes
            this.renderNotes();
        }
        
        document.querySelector('.dragging')?.classList.remove('dragging');
    }
}

// Initialize notes when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const notesManager = new NotesManager();
});
