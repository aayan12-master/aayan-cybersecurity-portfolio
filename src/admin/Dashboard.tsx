import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import {
  Users, MessageSquare, Folder, Code2, Award, Rocket,
  TrendingUp, ArrowRight, CheckCircle, Clock, AlertCircle,
  Eye, Shield, Map, RotateCcw
} from 'lucide-react';
import '../admin/admin-shared.css';

const statCards = [
  { key: 'visitors',     label: 'Total Visitors',     icon: Users,     color: '#7c6ff7', bg: 'rgba(124,111,247,0.1)' },
  { key: 'messages',     label: 'Contact Messages',   icon: MessageSquare, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  { key: 'projects',     label: 'Projects',           icon: Folder,    color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  { key: 'skills',       label: 'Skills',             icon: Code2,     color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  { key: 'certs',        label: 'Certifications',     icon: Award,     color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
  { key: 'future',       label: 'Future Projects',    icon: Rocket,    color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
];

const quickLinks = [
  { to: '/admin/hero',            label: 'Edit Hero',           icon: Users },
  { to: '/admin/projects',        label: 'Manage Projects',     icon: Folder },
  { to: '/admin/skills',          label: 'Manage Skills',       icon: Code2 },
  { to: '/admin/certifications',  label: 'Add Certification',   icon: Award },
  { to: '/admin/messages',        label: 'View Messages',       icon: MessageSquare },
  { to: '/admin/visibility',      label: 'Section Visibility',  icon: Eye },
];

const Dashboard = () => {
  const { data, resetVisitors } = useData();
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3000);
  };

  const unreadMsgs = data.contactMessages.filter(m => !m.resolved).length;
  const totalMsgs  = data.contactMessages.length;

  const statValues: Record<string, number> = {
    visitors: data.visitors,
    messages: totalMsgs,
    projects: data.projects.length,
    skills:   data.skills.length,
    certs:    data.certifications.length,
    future:   data.futureProjects.length,
  };

  const recentMsgs = [...data.contactMessages]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, Aayan. Here's your portfolio overview.</p>
      </div>

      {/* Stat Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map(card => (
          <div key={card.key} className="admin-card" style={{ padding: '1.25rem', cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                <card.icon size={18} />
              </div>
              {card.key === 'messages' && unreadMsgs > 0 && (
                <span className="badge badge-danger">{unreadMsgs} new</span>
              )}
              {card.key === 'visitors' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to reset the visitor count to 0?')) {
                      resetVisitors(() => showToast('Visitor count reset successfully.'));
                    }
                  }}
                  title="Reset Visitors"
                  aria-label="Reset Visitors"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#9090b0',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9090b0'}
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#e8e8f0', lineHeight: 1 }}>
              {card.key === 'visitors'
                ? new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(statValues[card.key])
                : statValues[card.key]
              }
            </div>
            <div style={{ fontSize: '0.78rem', color: '#9090b0', marginTop: '0.35rem' }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Quick Actions */}
        <div className="admin-card">
          <h2><Shield size={16} /> Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {quickLinks.map(link => (
              <button
                key={link.to}
                onClick={() => navigate(link.to)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 8, padding: '0.7rem 0.85rem', cursor: 'pointer',
                  color: '#e8e8f0', fontSize: '0.86rem', fontFamily: 'Inter, sans-serif',
                  fontWeight: 500, transition: 'all 0.15s', textAlign: 'left', width: '100%'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,111,247,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <link.icon size={15} style={{ color: '#7c6ff7' }} />
                  {link.label}
                </span>
                <ArrowRight size={14} style={{ color: '#55556a' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="admin-card">
          <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={16} /> Recent Messages
            </span>
            {unreadMsgs > 0 && <span className="badge badge-danger">{unreadMsgs} unread</span>}
          </h2>

          {recentMsgs.length === 0 ? (
            <div className="admin-empty">
              <MessageSquare size={32} />
              <p>No messages yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {recentMsgs.map(msg => (
                <div key={msg.id} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 8, padding: '0.7rem 0.85rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.84rem', color: '#e8e8f0' }}>{msg.name}</span>
                    {msg.resolved
                      ? <CheckCircle size={13} style={{ color: '#4ade80', flexShrink: 0 }} />
                      : <AlertCircle size={13} style={{ color: '#fbbf24', flexShrink: 0 }} />
                    }
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#9090b0', margin: '0.2rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {msg.message}
                  </p>
                  <span style={{ fontSize: '0.72rem', color: '#55556a', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={11} /> {new Date(msg.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
              <button
                onClick={() => navigate('/admin/messages')}
                className="btn-admin-secondary"
                style={{ marginTop: '0.25rem', width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}
              >
                View All Messages
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Roadmap Status */}
      <div className="admin-card" style={{ marginTop: '1.5rem' }}>
        <h2><Map size={16} /> Roadmap Status</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {data.roadmap.slice(0, 4).map(item => (
            <div key={item.id} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8, padding: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                {item.status === 'completed'  && <CheckCircle size={14} style={{ color: '#4ade80' }} />}
                {item.status === 'in-progress' && <TrendingUp size={14} style={{ color: '#fbbf24' }} />}
                {item.status === 'planned'     && <Clock size={14} style={{ color: '#60a5fa' }} />}
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px',
                  color: item.status === 'completed' ? '#4ade80' : item.status === 'in-progress' ? '#fbbf24' : '#60a5fa'
                }}>
                  {item.status.replace('-', ' ')}
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.84rem', color: '#e8e8f0' }}>{item.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#9090b0', marginTop: '0.2rem' }}>{item.year}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Toast */}
      {toast.visible && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.85rem 1.25rem',
          background: 'linear-gradient(135deg, #0d9e6e, #0b8a5e)',
          color: '#fff',
          borderRadius: '10px',
          fontSize: '0.9rem',
          fontWeight: 500,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          animation: 'fadeInUp 0.25s ease',
        }}>
          <CheckCircle size={18} />
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
