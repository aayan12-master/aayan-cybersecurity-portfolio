import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';

import { 
  ArrowLeft, Pin, Archive, Trash2, 
  CheckCircle, Loader2, AlertCircle, Palette, X
} from 'lucide-react';
import { type Note } from './NotesWorkspace';
import './notes.css';

import NoteDocumentEditor from './components/NoteDocumentEditor';

const COLORS = [
  { id: 'slate', hex: '#64748b' },
  { id: 'violet', hex: '#c084fc' },
  { id: 'blue', hex: '#60a5fa' },
  { id: 'mint', hex: '#4ade80' },
  { id: 'peach', hex: '#fda4af' },
  { id: 'yellow', hex: '#facc15' },
  { id: 'rose', hex: '#fb7185' },
];

const NoteEditor = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  // useAuth removed as it's no longer needed for DEV bypass display
  
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showColors, setShowColors] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  
  // UX State
  const [isToolbarHidden, setIsToolbarHidden] = useState(false);
  const [isToolbarFocused, setIsToolbarFocused] = useState(false);

  // References for debouncing and initialization
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializingRef = useRef(true);

  // Handle session lifecycle to prevent data leakage
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setSessionExpired(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchNote = async (id: string) => {
    try {
      setLoading(true);
      setNotFound(false);
      isInitializingRef.current = true; // Mark as initializing so we don't trigger autosave
      console.log(`[NOTE DEBUG] SELECT: Fetching noteId=${id}`);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.log(`[NOTE DEBUG] SELECT ERROR:`, error);
        throw error;
      }
      if (!data) throw new Error("No data");
      console.log(`[NOTE DEBUG] SELECT SUCCESS`);
      setNote(data);
    } catch (error: any) {
      console.error('Error fetching note:', error);
      if (error?.code === 'PGRST116' || error?.message === 'No data') {
        setNotFound(true);
      } else {
        navigate('/admin/notes');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (noteId) {
      fetchNote(noteId);
    }
  }, [noteId]);

  // Debounced Autosave
  const handleSave = useCallback(async (currentNote: Note, force = false) => {
    if (!currentNote.id) return;
    
    setSaveStatus('saving');
    console.log(`[NOTE DEBUG] UPDATE: Initiating save for noteId=${currentNote.id}, title="${currentNote.title}", content length=${currentNote.content.length}`);
    try {
      let query = supabase
        .from('notes')
        .update({
          title: currentNote.title,
          content: currentNote.content,
          color: currentNote.color,
          pinned: currentNote.pinned,
          archived: currentNote.archived,
        })
        .eq('id', currentNote.id);

      if (!force) {
        query = query.eq('updated_at', currentNote.updated_at);
      }

      const { data, error } = await query.select();

      if (error) throw error;

      if (!force && (!data || data.length === 0)) {
        console.log(`[NOTE DEBUG] UPDATE ERROR: Conflict detected or row not found. force=${force}, data=`, data);
        setConflict(true);
        setSaveStatus('error');
        return;
      }

      console.log(`[NOTE DEBUG] UPDATE SUCCESS: Note updated. length=${data?.length}`);
      if (data && data.length > 0) {
        setNote(prev => prev ? { ...prev, updated_at: data[0].updated_at } : null);
      }
      setConflict(false);
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus(prev => prev === 'saved' ? 'idle' : prev);
      }, 2000);
    } catch (error) {
      console.error('[NOTE DEBUG] UPDATE EXCEPTION:', error);
      setSaveStatus('error');
    }
  }, []);

  // Content-driven Autosave
  useEffect(() => {
    if (!note) return;

    if (isInitializingRef.current) {
      isInitializingRef.current = false;
      return;
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(note);
    }, 1000); // 1s debounce on content changes

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [note?.title, note?.content]); // ONLY trigger on title or content changes

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (note && note.id && saveStatus !== 'saving') {
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
          handleSave(note, false);
        }
      }
      if (e.key === 'Escape') {
        setShowColors(false);
        setShowDeleteModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [note, handleSave, saveStatus]);

  const handleChange = useCallback((field: keyof Note, value: any) => {
    setNote(prev => prev ? { ...prev, [field]: value } : null);
  }, []);

  const updateAndSave = async (updates: Partial<Note>) => {
    if (!note) return;
    const updatedNote = { ...note, ...updates };
    setNote(updatedNote);
    await handleSave(updatedNote, false); // Explicit action triggers immediate save
  };

  const togglePin = () => {
    if (note) updateAndSave({ pinned: !note.pinned });
  };

  const toggleArchive = async () => {
    if (note) {
      const isArchiving = !note.archived;
      await updateAndSave({ archived: isArchiving });
      if (isArchiving) {
        navigate('/admin/notes');
      }
    }
  };

  const deleteNote = () => setShowDeleteModal(true);
  const confirmDelete = async () => {
    if (!note) return;
    try {
      console.log(`[NOTE DEBUG] DELETE: Deleting noteId=${note.id}`);
      const { error } = await supabase.from('notes').delete().eq('id', note.id);
      if (error) {
        console.log(`[NOTE DEBUG] DELETE ERROR:`, error);
        throw error;
      }
      console.log(`[NOTE DEBUG] DELETE SUCCESS`);
      navigate('/admin/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      setSaveStatus('error');
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="note-editor-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#7c5cff' }} />
      </div>
    );
  }

  if (notFound || !note) {
    return (
      <div className="note-editor-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--a-text-sec)' }}>
          <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h2 style={{ color: 'var(--a-text)', marginBottom: '0.5rem' }}>Note not found</h2>
          <p style={{ marginBottom: '1.5rem' }}>This note may have been deleted or does not exist.</p>
          <button className="btn-admin-primary" onClick={() => navigate('/admin/notes')}>
            Back to Notes
          </button>
        </div>
      </div>
    );
  }

  const currentColor = COLORS.find(c => c.id === note.color)?.hex || COLORS[0].hex;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (showColors || isToolbarFocused) {
      setIsToolbarHidden(false);
      return;
    }
    if (e.clientY < 60) {
      setIsToolbarHidden(false); // Reveal zone
    } else if (e.clientY > 100) {
      setIsToolbarHidden(true); // Hide when entering document area
    }
  };

  return (
    <div 
      className="note-detail-page" 
      onMouseMove={handleMouseMove}
    >
      {showDeleteModal && (
        <div className="admin-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="admin-modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete this note?</h2>
              <button className="btn-admin-icon" onClick={() => setShowDeleteModal(false)} aria-label="Close" style={{ padding: '0.4rem', width: '36px', height: '36px' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '0 0 1rem 0' }}>
              <p style={{ color: 'var(--a-text-sec)' }}>This cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-admin-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-admin-primary" style={{ background: 'var(--a-danger)', borderColor: 'var(--a-danger)' }} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {sessionExpired && (
        <div style={{ background: '#f87171', color: '#fff', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><strong>Authentication required:</strong> Your session expired. Sign in again to continue saving.</span>
          <button onClick={() => navigate('/login')} style={{ background: '#fff', color: '#f87171', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Sign In</button>
        </div>
      )}

      {conflict && (
        <div style={{ background: '#f87171', color: '#fff', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><strong>Warning:</strong> This note changed in another session.</span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => { setConflict(false); fetchNote(note.id); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Reload</button>
            <button onClick={() => handleSave(note, true)} style={{ background: '#fff', color: '#f87171', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Keep my changes</button>
          </div>
        </div>
      )}

      <header 
        className={`note-workspace-toolbar ${isToolbarHidden && !showColors && !isToolbarFocused ? 'toolbar-hidden' : ''}`} 
        style={{ borderTop: `4px solid ${currentColor}` }}
        onFocus={() => setIsToolbarFocused(true)}
        onBlur={(e) => {
          // If focus moves outside the toolbar, un-focus it
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsToolbarFocused(false);
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn-admin-icon" onClick={() => navigate('/admin/notes')} title="Back to Notes" aria-label="Back to Notes">
            <ArrowLeft size={20} />
          </button>
          

        </div>

        <div className="note-editor-actions">
          {saveStatus === 'saving' && <span className="note-save-status saving"><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }}/> Saving...</span>}
          {saveStatus === 'saved' && <span className="note-save-status saved"><CheckCircle size={14} /> Saved</span>}
          {saveStatus === 'error' && <span className="note-save-status error"><AlertCircle size={14} /> Failed to save</span>}

          <div style={{ position: 'relative' }}>
            <button 
              className="btn-admin-icon" 
              onClick={() => setShowColors(!showColors)}
              title="Change Color"
              aria-label="Change Color"
              style={{ border: `1px solid ${currentColor}40`, background: `${currentColor}20`, color: currentColor }}
            >
              <Palette size={18} />
            </button>
            
            {showColors && (
              <div className="note-color-picker" style={{ right: 0, left: 'auto' }}>
                {COLORS.map(c => (
                  <button
                    key={c.id}
                    className={`color-swatch ${note.color === c.id ? 'selected' : ''}`}
                    style={{ background: c.hex }}
                    onClick={() => { updateAndSave({ color: c.id }); setShowColors(false); }}
                    title={c.id}
                  />
                ))}
              </div>
            )}
          </div>

          <button 
            className="btn-admin-icon" 
            onClick={togglePin}
            style={{ color: note.pinned ? currentColor : 'var(--a-text-sec)' }}
            title={note.pinned ? "Unpin Note" : "Pin Note"}
            aria-label={note.pinned ? "Unpin Note" : "Pin Note"}
          >
            <Pin size={18} style={note.pinned ? { fill: currentColor } : {}} />
          </button>
          
          <button 
            className="btn-admin-icon" 
            onClick={toggleArchive}
            style={{ color: note.archived ? 'var(--a-warning)' : 'var(--a-text-sec)' }}
            title={note.archived ? "Restore" : "Archive"}
            aria-label={note.archived ? "Restore" : "Archive"}
          >
            <Archive size={18} />
          </button>

          <button 
            className="btn-admin-icon" 
            onClick={deleteNote}
            title="Delete Note"
            aria-label="Delete Note"
            style={{ marginLeft: '1rem' }}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <main className="note-document-viewport">
        <article className="note-document">
          <input
            type="text"
            className="note-title-input"
            placeholder="Untitled Note"
            value={note.title || ''}
            onChange={e => handleChange('title', e.target.value)}
          />
          
          <div className="note-document-editor">
            <NoteDocumentEditor 
              initialContent={note.content || ''} 
              onChange={(markdown) => handleChange('content', markdown)} 
            />
          </div>
        </article>
      </main>
    </div>
  );
};

export default NoteEditor;
