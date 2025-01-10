class NotesManager {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.container = document.querySelector('.notes-container');
        this.notesList = document.querySelector('.notes-list');
        this.inputContainer = document.querySelector('.note-input-container');
        
        // Bind event listeners
        document.querySelector('.add-note-btn').addEventListener('click', () => this.showNoteInput());
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
        }
    }

    renderNotes() {
        this.notesList.innerHTML = this.notes.map(note => `
            <div class="note-item" data-id="${note.id}">
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

        // Add event listeners to delete buttons
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
}

// Initialize notes when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const notesManager = new NotesManager();
});
