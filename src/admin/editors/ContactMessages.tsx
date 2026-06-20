import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { MessageSquare, Trash2, CheckCircle, Clock, Mail, AlertCircle } from 'lucide-react';
import '../admin-shared.css';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  resolved: boolean;
  created_at: string;
}

const formatDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const ContactMessages = () => {
  const [msgs, setMsgs] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: dbError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (dbError) throw dbError;
      setMsgs(data || []);
    } catch (err: any) {
      console.error('Error fetching messages from Supabase:', err);
      setError(err.message || 'Failed to load messages from Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const { error: dbError } = await supabase
        .from('contact_messages')
        .update({ resolved: true })
        .eq('id', id);
      if (dbError) throw dbError;
      setMsgs(prev => prev.map(m => m.id === id ? { ...m, resolved: true } : m));
    } catch (err: any) {
      console.error('Error resolving message:', err);
      alert('Failed to resolve message: ' + (err.message || err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const { error: dbError } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);
      if (dbError) throw dbError;
      setMsgs(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message: ' + (err.message || err));
    }
  };

  const unread = msgs.filter(m => !m.resolved).length;

  return (
    <div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .admin-spinner-custom {
          display: inline-block;
          width: 24px;
          height: 24px;
          border: 2.5px solid rgba(255, 255, 255, 0.15);
          border-top-color: var(--a-accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>

      <div className="admin-page-header">
        <h1>Contact Messages</h1>
        <p>View and manage messages sent through your portfolio contact form (stored in Supabase).</p>
      </div>

      <div className="admin-card">
        <div className="admin-section-header">
          <h2>
            <MessageSquare size={16} /> Messages ({msgs.length})
            {unread > 0 && <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>{unread} unread</span>}
          </h2>
        </div>

        {error && (
          <div className="admin-error-banner" style={{
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: 8,
            padding: '0.85rem 1.1rem',
            color: 'var(--a-danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="admin-loading" style={{ textAlign: 'center', padding: '3.5rem' }}>
            <span className="admin-spinner-custom" />
            <p style={{ marginTop: '0.9rem', color: 'var(--a-text-sec)', fontSize: '0.875rem' }}>Loading messages from Supabase...</p>
          </div>
        ) : msgs.length === 0 ? (
          <div className="admin-empty">
            <MessageSquare size={32} />
            <p>No messages yet. Messages from your contact form will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {msgs.map(msg => (
              <div key={msg.id} style={{
                background: msg.resolved ? 'rgba(255,255,255,0.02)' : 'rgba(124,111,247,0.05)',
                border: `1px solid ${msg.resolved ? 'rgba(255,255,255,0.07)' : 'rgba(124,111,247,0.2)'}`,
                borderRadius: 10, padding: '1.1rem 1.25rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.6rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#e8e8f0' }}>{msg.name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#9090b0', marginTop: '0.2rem' }}>
                      <Mail size={12} /> {msg.email}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.72rem', color: '#55556a', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={11} /> {formatDate(msg.created_at)}
                    </span>
                    {msg.resolved
                      ? <span className="badge badge-success"><CheckCircle size={10} style={{ marginRight: '0.25rem' }} />Resolved</span>
                      : <span className="badge badge-warning">Unread</span>
                    }
                  </div>
                </div>

                {msg.subject && (
                  <p style={{ fontWeight: 600, fontSize: '0.84rem', color: '#c8c8e0', marginBottom: '0.4rem' }}>{msg.subject}</p>
                )}
                <p style={{ fontSize: '0.875rem', color: '#9090b0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.message}</p>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
                  {!msg.resolved && (
                    <button className="btn-admin-success" onClick={() => handleResolve(msg.id)}>
                      <CheckCircle size={13} /> Mark Resolved
                    </button>
                  )}
                  <button className="btn-admin-danger" onClick={() => handleDelete(msg.id)}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactMessages;
