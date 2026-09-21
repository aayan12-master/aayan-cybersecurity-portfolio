import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';

import { 
  ArrowLeft, Search, Plus, Archive, 
  Pin, FileText, LayoutGrid, Clock, X, Trash2
} from 'lucide-react';
import './notes.css';

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

const stripMarkdown = (md: string) => {
  if (!md) return '';
  return md
    .replace(/#{1,6}\s?/g, '') // Remove headers
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // Remove italic
    .replace(/~~(.*?)~~/g, '$1') // Remove strikethrough
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Remove code blocks/inline
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/!\[(.*?)\]\(.*?\)/g, '$1') // Remove images
    .replace(/>\s?/g, '') // Remove blockquotes
    .replace(/[-*+]\s/g, '') // Remove unordered lists
    .replace(/\d+\.\s/g, '') // Remove ordered lists
    .trim();
};

const NotesWorkspace = () => {
  const navigate = useNavigate();
  // useAuth removed as we track real session directly now
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pinned' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasRealSession, setHasRealSession] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Development bypass logic applies here too implicitly since ProtectedRoute wraps us.
  
  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (err: any) {
      console.error('Error fetching notes:', err);
      if (err.code === '42P01') {
        setError('Notes database is not configured yet.');
      } else {
        setError('Unable to load notes.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle session lifecycle and initial fetch
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasRealSession(!!session);
      if (session) {
        fetchNotes();
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setHasRealSession(!!session);
      if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setNotes([]);
        if (session) fetchNotes();
      } else if (event === 'SIGNED_IN') {
        fetchNotes();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const createNote = async () => {
    if (!hasRealSession) {
      setShowAuthPrompt(true);
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setShowAuthPrompt(true);
        return;
      }

      const newNote = {
        user_id: userData.user.id,
        title: '',
        content: '',
        color: 'slate',
      };

      console.log(`[NOTE DEBUG] INSERT: Creating new note`);
      const { data, error: insertError } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single();

      if (insertError) {
        console.log(`[NOTE DEBUG] INSERT ERROR:`, insertError);
        throw insertError;
      }
      if (data) {
        console.log(`[NOTE DEBUG] INSERT SUCCESS: Created noteId=${data.id}`);
        navigate(`/admin/notes/${data.id}`);
      }
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note.');
    }
  };

  const handleTogglePin = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.from('notes').update({ pinned: !note.pinned }).eq('id', note.id);
      if (!error) {
        setNotes(notes.map(n => n.id === note.id ? { ...n, pinned: !n.pinned } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleArchive = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.from('notes').update({ archived: !note.archived }).eq('id', note.id);
      if (!error) {
        setNotes(notes.map(n => n.id === note.id ? { ...n, archived: !n.archived } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setNoteToDelete(note);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    try {
      const { error } = await supabase.from('notes').delete().eq('id', noteToDelete.id);
      if (!error) {
        setNotes(notes.filter(n => n.id !== noteToDelete.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNoteToDelete(null);
    }
  };

  // Keyboard shortcut for Search & New & Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('notesSearch')?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNote();
      }
      if (e.key === 'Escape') {
        setShowAuthPrompt(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasRealSession]);

  const filteredNotes = notes.filter(note => {
    // Filter type
    if (filter === 'all' && note.archived) return false;
    if (filter === 'pinned' && !note.pinned) return false;
    if (filter === 'archived' && !note.archived) return false;
    
    // Search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      const matchTitle = note.title?.toLowerCase().includes(query);
      const matchContent = note.content?.toLowerCase().includes(query);
      return matchTitle || matchContent;
    }
    
    return true;
  });

  return (
    <div className="notes-workspace-container">
      {showAuthPrompt && (
        <div className="admin-modal-overlay" onClick={() => setShowAuthPrompt(false)}>
          <div className="admin-modal" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Authentication required</h2>
              <button className="btn-admin-icon" onClick={() => setShowAuthPrompt(false)} aria-label="Close" style={{ padding: '0.4rem', width: '36px', height: '36px' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '0 0 1rem 0' }}>
              <p style={{ color: 'var(--a-text-sec)', lineHeight: '1.6' }}>
                You're using Local Dev UI access.<br/>
                Sign in with Supabase to create and save real notes.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-admin-secondary" onClick={() => setShowAuthPrompt(false)}>Continue UI Preview</button>
              <button className="btn-admin-primary" onClick={() => navigate('/login')}>Sign In</button>
            </div>
          </div>
        </div>
      )}

      {noteToDelete && (
        <div className="admin-modal-overlay" onClick={() => setNoteToDelete(null)}>
          <div className="admin-modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete this note?</h2>
              <button className="btn-admin-icon" onClick={() => setNoteToDelete(null)} aria-label="Close" style={{ padding: '0.4rem', width: '36px', height: '36px' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '0 0 1rem 0' }}>
              <p style={{ color: 'var(--a-text-sec)' }}>This cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-admin-secondary" onClick={() => setNoteToDelete(null)}>Cancel</button>
              <button className="btn-admin-primary" style={{ background: 'var(--a-danger)', borderColor: 'var(--a-danger)' }} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <aside className="notes-sidebar">
        <div className="notes-sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn-admin-icon" onClick={() => navigate('/admin')} title="Back to Admin" aria-label="Back to Admin">
            <ArrowLeft size={20} />
          </button>
          <span>Notes Workspace</span>
        </div>
        
        <div className="notes-filters">
          <button 
            className={`notes-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <div className="notes-filter-btn-left"><FileText size={16} /> All Notes</div>
            <span>{notes.filter(n => !n.archived).length}</span>
          </button>
          
          <button 
            className={`notes-filter-btn ${filter === 'pinned' ? 'active' : ''}`}
            onClick={() => setFilter('pinned')}
          >
            <div className="notes-filter-btn-left"><Pin size={16} /> Pinned</div>
            <span>{notes.filter(n => n.pinned && !n.archived).length}</span>
          </button>

          <button 
            className={`notes-filter-btn ${filter === 'archived' ? 'active' : ''}`}
            onClick={() => setFilter('archived')}
          >
            <div className="notes-filter-btn-left"><Archive size={16} /> Archived</div>
            <span>{notes.filter(n => n.archived).length}</span>
          </button>
        </div>
      </aside>

      <main className="notes-main">
        <div className="notes-top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            <div className="notes-search-wrapper">
              <Search size={18} className="notes-search-icon" />
              <input 
                id="notesSearch"
                type="text" 
                className="notes-search-input" 
                placeholder="Search notes... (Cmd+K)" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

          </div>
          
          <button className="notes-new-btn" onClick={createNote}>
            <Plus size={18} /> New Note
          </button>
        </div>

        <div className="notes-board">
          {!hasRealSession ? (
            <div style={{ color: '#a0a0b8', width: '100%', textAlign: 'center', gridColumn: '1 / -1', marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <LayoutGrid size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p style={{ marginBottom: '0.25rem', fontWeight: 600, color: 'var(--a-text)' }}>PRIVATE NOTES</p>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}>Sign in to load and save your private notes.</p>
              <button className="btn-admin-primary" onClick={() => navigate('/login')}>Sign In</button>
            </div>
          ) : loading ? (
            <div style={{ color: '#a0a0b8' }}>Loading notes...</div>
          ) : error ? (
            <div style={{ color: 'var(--a-danger)', width: '100%', textAlign: 'center', gridColumn: '1 / -1', marginTop: '4rem' }}>
              <p>{error}</p>
              <button className="btn-admin-secondary" onClick={fetchNotes} style={{ marginTop: '1rem' }}>Retry</button>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div style={{ color: '#a0a0b8', width: '100%', textAlign: 'center', gridColumn: '1 / -1', marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <LayoutGrid size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              {debouncedSearch ? <p>No notes match your search.</p> : (
                <>
                  <p style={{ marginBottom: '0.25rem', fontWeight: 600, color: 'var(--a-text)' }}>No notes yet.</p>
                  <p style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}>Create your first private note.</p>
                  <button className="btn-admin-primary" onClick={createNote}><Plus size={16} /> New Note</button>
                </>
              )}
            </div>
          ) : (
            filteredNotes.map(note => (
              <div 
                key={note.id} 
                className={`note-card-wrapper note-color-${note.color || 'slate'}`}
              >
                <div className="note-card-surface" onClick={() => navigate(`/admin/notes/${note.id}`)}>
                  <div className="note-card-header">
                    <h3 className="note-card-title">{note.title || 'Untitled Note'}</h3>
                  </div>
                  <div className="note-card-excerpt">
                    {note.content ? stripMarkdown(note.content).substring(0, 150) + (stripMarkdown(note.content).length > 150 ? '...' : '') : 'Empty note...'}
                  </div>
                  <div className="note-card-footer">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} />
                      {new Date(note.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="note-card-rail">
                  <button 
                    className="rail-btn" 
                    onClick={(e) => handleTogglePin(note, e)}
                    title={note.pinned ? "Unpin" : "Pin"}
                    style={{ color: note.pinned ? `var(--a-accent)` : '' }}
                  >
                    <Pin size={16} style={note.pinned ? { fill: 'var(--a-accent)' } : {}} />
                  </button>
                  <button 
                    className="rail-btn" 
                    onClick={(e) => handleToggleArchive(note, e)}
                    title={note.archived ? "Restore" : "Archive"}
                  >
                    <Archive size={16} />
                  </button>
                  <button 
                    className="rail-btn rail-btn-danger" 
                    onClick={(e) => handleDelete(note, e)}
                    title="Delete Note"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default NotesWorkspace;
