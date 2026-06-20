import React, { useState } from 'react';
import { useData, type SocialLink } from '../../contexts/DataContext';
import { Plus, Pencil, Trash2, Share2, X, Save, CheckCircle, ArrowUp, ArrowDown, Globe, Hexagon, Box, Terminal, Bug } from 'lucide-react';
import { FaGithub, FaXTwitter, FaLinkedin, FaInstagram, FaFacebook, FaYoutube, FaDiscord, FaTelegram, FaGitlab, FaMedium } from 'react-icons/fa6';
import '../../admin/admin-shared.css';

const PLATFORMS = [
  'GitHub',
  'LinkedIn',
  'X',
  'TryHackMe',
  'Hack The Box',
  'Instagram',
  'Facebook',
  'Medium',
  'YouTube',
  'Discord',
  'Telegram',
  'GitLab',
  'HackerOne',
  'Bugcrowd'
];

const getSocialIcon = (platform: string) => {
  const norm = platform.toLowerCase().trim();
  switch (norm) {
    case 'github': return <FaGithub size={16} />;
    case 'linkedin': return <FaLinkedin size={16} />;
    case 'x':
    case 'twitter': return <FaXTwitter size={16} />;
    case 'tryhackme': return <Hexagon size={16} />;
    case 'hack the box':
    case 'hackthebox': return <Box size={16} />;
    case 'instagram': return <FaInstagram size={16} />;
    case 'facebook': return <FaFacebook size={16} />;
    case 'medium': return <FaMedium size={16} />;
    case 'youtube': return <FaYoutube size={16} />;
    case 'discord': return <FaDiscord size={16} />;
    case 'telegram': return <FaTelegram size={16} />;
    case 'gitlab': return <FaGitlab size={16} />;
    case 'hackerone': return <Terminal size={16} />;
    case 'bugcrowd': return <Bug size={16} />;
    default: return <Globe size={16} />;
  }
};

const empty = { platform: 'GitHub', url: '' };

const SocialLinksEditor = () => {
  const { data, addSocialLink, updateSocialLink, deleteSocialLink, reorderSocialLinks } = useData();
  const [modal, setModal] = useState<{ open: boolean; editing: SocialLink | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ ...empty });
  const [saved, setSaved] = useState(false);

  const links = [...data.socialLinks].sort((a, b) => a.order - b.order);

  const openAdd = () => { setForm({ ...empty }); setModal({ open: true, editing: null }); };
  const openEdit = (l: SocialLink) => {
    setForm({ platform: l.platform, url: l.url });
    setModal({ open: true, editing: l });
  };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal.editing) {
      updateSocialLink(modal.editing.id, form);
    } else {
      addSocialLink(form);
    }
    closeModal();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= links.length) return;

    const reordered = [...links];
    const temp = reordered[index];
    reordered[index] = reordered[newIndex];
    reordered[newIndex] = temp;

    // Recalculate order indices
    const updated = reordered.map((link, idx) => ({ ...link, order: idx }));
    reorderSocialLinks(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Social Links</h1>
        <p>Manage your public social and platform profiles dynamically.</p>
      </div>

      <div className="admin-card">
        <div className="admin-section-header">
          <h2><Share2 size={16} /> Social Links ({links.length})</h2>
          <button className="btn-admin-primary" onClick={openAdd}><Plus size={15} /> Add Link</button>
        </div>

        {saved && <p className="save-success" style={{ marginBottom: '1rem' }}><CheckCircle size={14} /> Changes saved!</p>}

        {links.length === 0 ? (
          <div className="admin-empty"><Share2 size={32} /><p>No social links added yet.</p></div>
        ) : (
          <div className="admin-list">
            {links.map((link, index) => (
              <div key={link.id} className="admin-list-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginRight: '0.75rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--a-accent)' }}>
                    {getSocialIcon(link.platform)}
                  </div>
                </div>
                <div className="list-item-info">
                  <h3>{link.platform}</h3>
                  <p>{link.url}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="list-item-actions">
                    <button 
                      className="btn-admin-icon" 
                      disabled={index === 0} 
                      onClick={() => handleMove(index, 'up')}
                      title="Move Up"
                      type="button"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button 
                      className="btn-admin-icon" 
                      disabled={index === links.length - 1} 
                      onClick={() => handleMove(index, 'down')}
                      title="Move Down"
                      type="button"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button type="button" className="btn-admin-icon edit" onClick={() => openEdit(link)} title="Edit"><Pencil size={14} /></button>
                    <button type="button" className="btn-admin-icon danger" onClick={() => deleteSocialLink(link.id)} title="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal.open && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal.editing ? 'Edit Social Link' : 'Add Social Link'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="admin-form">
              <div className="form-group">
                <label>Platform</label>
                <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Profile URL</label>
                <input 
                  type="url" 
                  required 
                  value={form.url} 
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))} 
                  placeholder="https://example.com/username" 
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-admin-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-admin-primary"><Save size={14} /> {modal.editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialLinksEditor;
