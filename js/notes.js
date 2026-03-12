/**
 * JSLab — Notes Engine
 * Handles rich text editing, saving to localStorage, deleting, and searching notes.
 */

document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = 'jslab_notes';
  let notes = [];
  let currentNoteId = null;

  // DOM Elements
  const notesListEl = document.getElementById('notes-list');
  const searchInput = document.getElementById('search-notes');
  const btnNewNote = document.getElementById('new-note-btn');
  const btnSaveNote = document.getElementById('save-note-btn');
  const btnDeleteNote = document.getElementById('delete-note-btn');
  const btnExportNote = document.getElementById('export-note-btn');
  const noteTitleInput = document.getElementById('note-title');
  const noteEditor = document.getElementById('note-editor');

  // Toolbar
  const btnBold = document.getElementById('btn-bold');
  const btnItalic = document.getElementById('btn-italic');
  const btnUnderline = document.getElementById('btn-underline');
  const btnCode = document.getElementById('btn-code');
  const btnUl = document.getElementById('btn-ul');
  const btnOl = document.getElementById('btn-ol');

  // Init
  loadNotes();
  renderNotesList();
  if (notes.length > 0) {
    openNote(notes[0].id);
  } else {
    createNewNote();
  }

  // --- Functions ---
  
  function loadNotes() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) notes = JSON.parse(data);
      else notes = [];
    } catch(e) {
      notes = [];
    }
    // Sort by updated latest first
    notes.sort((a,b) => b.updatedAt - a.updatedAt);
  }

  function saveNotesToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch(e) {
      alert("Error saving notes. LocalStorage might be full.");
    }
  }

  function renderNotesList(query = '') {
    notesListEl.innerHTML = '';
    
    let filtered = notes;
    if (query) {
      const q = query.toLowerCase();
      filtered = notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }

    if (filtered.length === 0) {
      notesListEl.innerHTML = '<p style="color:var(--text-secondary);font-size:13px;text-align:center;margin-top:20px;">No notes found.</p>';
      return;
    }

    filtered.forEach(note => {
      const div = document.createElement('div');
      div.className = 'note-item' + (note.id === currentNoteId ? ' active' : '');
      
      const title = document.createElement('div');
      title.className = 'note-item-title';
      title.textContent = note.title || 'Untitled Note';
      
      const date = document.createElement('div');
      date.className = 'note-item-date';
      date.textContent = new Date(note.updatedAt).toLocaleDateString() + ' ' + new Date(note.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

      div.appendChild(title);
      div.appendChild(date);
      
      div.addEventListener('click', () => {
        openNote(note.id);
      });

      notesListEl.appendChild(div);
    });
  }

  function createNewNote() {
    currentNoteId = 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2,9);
    noteTitleInput.value = '';
    noteEditor.innerHTML = '';
    btnDeleteNote.style.display = 'none';
    renderNotesList(searchInput.value);
    noteTitleInput.focus();
  }

  function openNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    currentNoteId = note.id;
    noteTitleInput.value = note.title;
    noteEditor.innerHTML = note.content;
    btnDeleteNote.style.display = 'inline-flex';
    renderNotesList(searchInput.value);
  }

  function saveCurrentNote() {
    const title = noteTitleInput.value.trim();
    const content = noteEditor.innerHTML;
    
    // Ignore if completely empty
    if (!title && !noteEditor.textContent.trim() && !content.includes('<img')) return;

    let note = notes.find(n => n.id === currentNoteId);
    if (!note) {
      note = {
        id: currentNoteId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        title: title || 'Untitled Note',
        content: content
      };
      notes.unshift(note);
    } else {
      note.title = title || 'Untitled Note';
      note.content = content;
      note.updatedAt = Date.now();
      // Move to top
      notes = notes.filter(n => n.id !== note.id);
      notes.unshift(note);
    }

    saveNotesToStorage();
    btnDeleteNote.style.display = 'inline-flex';
    renderNotesList(searchInput.value);
    
    // Log activity
    if (window.logActivity) window.logActivity("Updated note: " + note.title, "note");
    
    // visual feedback
    const originalText = btnSaveNote.innerHTML;
    btnSaveNote.innerHTML = '✅ Saved';
    setTimeout(() => { btnSaveNote.innerHTML = originalText; }, 2000);
  }

  function deleteCurrentNote() {
    if (!confirm("Are you sure you want to delete this note?")) return;
    
    notes = notes.filter(n => n.id !== currentNoteId);
    saveNotesToStorage();
    
    if (notes.length > 0) {
      openNote(notes[0].id);
    } else {
      createNewNote();
    }
  }

  // --- Events ---
  
  btnNewNote.addEventListener('click', createNewNote);
  btnSaveNote.addEventListener('click', saveCurrentNote);
  btnDeleteNote.addEventListener('click', deleteCurrentNote);
  if (btnExportNote) {
    btnExportNote.addEventListener('click', () => {
      const note = notes.find(n => n.id === currentNoteId);
      if (!note) return;
      // Naive HTML to Markdown conversion
      let mdContent = `# ${note.title || 'Untitled'}\n\n`;
      let content = note.content;
      content = content.replace(/<div>/gi, '\n');
      content = content.replace(/<\/div>/gi, '');
      content = content.replace(/<br>/gi, '\n');
      content = content.replace(/<p>/gi, '');
      content = content.replace(/<\/p>/gi, '\n\n');
      content = content.replace(/&nbsp;/gi, ' ');
      // Strip remaining HTML
      mdContent += content.replace(/<[^>]*>?/gm, '');

      const blob = new Blob([mdContent.trim()], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      let safeFilename = (note.title || 'note').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = safeFilename + '.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  searchInput.addEventListener('input', (e) => {
    renderNotesList(e.target.value);
  });

  // Auto-save logic (debounced)
  let autoSaveTimeout;
  const triggerAutoSave = () => {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      saveCurrentNote();
    }, 2000); // auto save 2 seconds after stopped typing
  };

  noteTitleInput.addEventListener('input', triggerAutoSave);
  noteEditor.addEventListener('input', triggerAutoSave);

  // Ctrl+S / Cmd+S to save explicitly
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveCurrentNote();
    }
  });

  // --- Toolbar Commands ---
  
  function execCmd(command, value = null) {
    document.execCommand(command, false, value);
    noteEditor.focus();
    triggerAutoSave();
  }

  btnBold.addEventListener('click', () => execCmd('bold'));
  btnItalic.addEventListener('click', () => execCmd('italic'));
  btnUnderline.addEventListener('click', () => execCmd('underline'));
  btnUl.addEventListener('click', () => execCmd('insertUnorderedList'));
  btnOl.addEventListener('click', () => execCmd('insertOrderedList'));
  
  btnCode.addEventListener('click', () => {
    // For code block, we wrap in <pre><code>...</code></pre>
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const text = range.toString();
      if (text) {
        // inline code if inside something, or block code if large
        if (text.includes('\n')) {
          execCmd('insertHTML', `<pre style="background:rgba(0,0,0,0.4);border:1px solid var(--glass-border);padding:10px;border-radius:4px;font-family:monospace;"><code>${text}</code></pre>`);
        } else {
          execCmd('insertHTML', `<code style="background:rgba(0,0,0,0.3);padding:2px 4px;border-radius:3px;font-family:monospace;color:var(--accent-blue);">${text}</code>`);
        }
      } else {
        execCmd('insertHTML', `<pre style="background:rgba(0,0,0,0.4);border:1px solid var(--glass-border);padding:10px;border-radius:4px;font-family:monospace;"><code>// your code here\n</code></pre>`);
      }
    }
  });
});
