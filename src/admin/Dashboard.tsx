import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import {
  Users, MessageSquare, Folder, Code2, Award,
  Eye, Map
} from 'lucide-react';
import '../admin/admin-shared.css';

const Dashboard = () => {
  const { data } = useData();
  const navigate = useNavigate();

  const unreadMsgs = data.contactMessages.filter(m => !m.resolved).length;
  const totalMsgs  = data.contactMessages.length;

  const statValues: Record<string, number> = {
    projects: data.projects.length,
    messages: totalMsgs,
    certs:    data.certifications.length,
    roadmap:  data.roadmap.length,
  };

  const statCards = [
    { key: 'projects', label: 'Total Projects', value: statValues.projects, icon: Folder, color: 'var(--a-lavender)', bg: 'rgba(192, 132, 252, 0.15)' },
    { key: 'messages', label: 'Messages',       value: statValues.messages, icon: MessageSquare, color: 'var(--a-mint)', bg: 'rgba(134, 239, 172, 0.15)', badge: unreadMsgs > 0 ? `${unreadMsgs} new` : null },
    { key: 'certs',    label: 'Certifications', value: statValues.certs,    icon: Award,  color: 'var(--a-peach)', bg: 'rgba(253, 164, 175, 0.15)' },
    { key: 'roadmap',  label: 'Roadmap Items',  value: statValues.roadmap,  icon: Map,    color: 'var(--a-amber)', bg: 'rgba(252, 211, 77, 0.15)' },
  ];

  const quickLinks = [
    { to: '/admin/hero',            label: 'Edit Hero',           icon: Users, color: '#60a5fa' },
    { to: '/admin/projects',        label: 'Manage Projects',     icon: Folder, color: '#c084fc' },
    { to: '/admin/skills',          label: 'Manage Skills',       icon: Code2, color: '#facc15' },
    { to: '/admin/certifications',  label: 'Add Certification',   icon: Award, color: '#fda4af' },
    { to: '/admin/messages',        label: 'View Messages',       icon: MessageSquare, color: '#86efac' },
    { to: '/admin/visibility',      label: 'Section Visibility',  icon: Eye, color: '#94a3b8' },
  ];

  const recentMsgs = [...data.contactMessages]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* Page Header is now handled mostly by the Top Header, but we can keep a compact welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--a-text)', marginBottom: '0.25rem' }}>Overview</h1>
        <p style={{ color: 'var(--a-text-sec)', fontSize: '0.9rem' }}>Welcome to your cybersecurity control center.</p>
      </div>

      {/* Colorful Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {statCards.map(card => (
          <div key={card.key} className="admin-card" style={{ padding: '1.5rem', cursor: 'default', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: `3px solid ${card.color}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                <card.icon size={22} />
              </div>
              {card.badge && (
                <span style={{ background: card.color, color: '#000', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>
                  {card.badge}
                </span>
              )}
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--a-text)', lineHeight: 1 }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--a-text-sec)', marginTop: '0.5rem', fontWeight: 500 }}>
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

        {/* Quick Actions */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {quickLinks.map(link => (
              <button
                key={link.to}
                onClick={() => navigate(link.to)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid var(--a-border)',
                  borderRadius: 'var(--a-radius-sm)', padding: '1rem', cursor: 'pointer',
                  color: 'var(--a-text)', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif',
                  fontWeight: 500, transition: 'all 0.2s', textAlign: 'left'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'var(--a-border)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: `${link.color}20`, color: link.color }}>
                  <link.icon size={16} />
                </div>
                <span>{link.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            <span>Recent Messages</span>
            <button onClick={() => navigate('/admin/messages')} style={{ background: 'none', border: 'none', color: 'var(--a-accent)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>View All</button>
          </h2>

          {recentMsgs.length === 0 ? (
            <div className="admin-empty">
              <MessageSquare size={32} />
              <p>No messages yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentMsgs.map(msg => (
                <div key={msg.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--a-accent-glow)', color: 'var(--a-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.9rem', flexShrink: 0 }}>
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--a-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--a-text-muted)' }}>{new Date(msg.date).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--a-text-sec)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.message}
                    </p>
                  </div>
                  <div style={{ paddingTop: '0.2rem' }}>
                    {msg.resolved
                      ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--a-text-muted)' }} title="Resolved" />
                      : <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--a-warning)' }} title="Unread" />
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
