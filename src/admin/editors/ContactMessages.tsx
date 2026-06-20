import { useData } from '../../contexts/DataContext';
import { MessageSquare, Trash2, CheckCircle, Clock, Mail } from 'lucide-react';
import '../admin-shared.css';

const ContactMessages = () => {
  const { data, deleteContactMessage, resolveContactMessage } = useData();
  const msgs = [...data.contactMessages].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const unread = msgs.filter(m => !m.resolved).length;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Contact Messages</h1>
        <p>View and manage messages sent through your portfolio contact form.</p>
      </div>

      <div className="admin-card">
        <div className="admin-section-header">
          <h2>
            <MessageSquare size={16} /> Messages ({msgs.length})
            {unread > 0 && <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>{unread} unread</span>}
          </h2>
        </div>

        {msgs.length === 0 ? (
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
                      <Clock size={11} /> {new Date(msg.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
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
                    <button className="btn-admin-success" onClick={() => resolveContactMessage(msg.id)}>
                      <CheckCircle size={13} /> Mark Resolved
                    </button>
                  )}
                  <button className="btn-admin-danger" onClick={() => deleteContactMessage(msg.id)}>
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
