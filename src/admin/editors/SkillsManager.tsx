import React, { useState } from 'react';
import { useData, type Skill } from '../../contexts/DataContext';
import { Plus, Pencil, Trash2, Code2, X, Save, CheckCircle } from 'lucide-react';
import { COMPETENCY_MAP, getCompetency } from '../../components/Skills';
import '../admin-shared.css';

const CATEGORIES = ['Foundation', 'Operating Systems', 'Programming', 'Security Tools', 'Practice Platforms', 'Security Domains', 'Tools', 'Other'];

const emptySkill = { name: '', category: 'Security Tools', level: 55 }; // default to Practicing (55)

const COMPETENCY_STYLE: Record<string, React.CSSProperties> = {
  'Foundation': { backgroundColor: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.2)' },
  'Learning': { backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#60a5fa', border: '1px solid rgba(56, 189, 248, 0.2)' },
  'Practicing': { backgroundColor: 'rgba(129, 140, 248, 0.1)', color: '#818cf8', border: '1px solid rgba(129, 140, 248, 0.2)' },
  'Hands-On': { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.2)' },
  'Building': { backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.2)' },
  'Active': { backgroundColor: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.2)' }
};

const SkillsManager = () => {
  const { data, addSkill, updateSkill, deleteSkill } = useData();
  const [modal, setModal] = useState<{ open: boolean; editing: Skill | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ ...emptySkill });
  const [saved, setSaved] = useState(false);

  const skills = [...data.skills].sort((a, b) => a.order - b.order);

  const openAdd = () => { setForm({ ...emptySkill }); setModal({ open: true, editing: null }); };
  const openEdit = (s: Skill) => { setForm({ name: s.name, category: s.category, level: s.level }); setModal({ open: true, editing: s }); };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal.editing) {
      updateSkill(modal.editing.id, form);
    } else {
      addSkill(form);
    }
    closeModal();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const grouped = CATEGORIES.reduce<Record<string, Skill[]>>((acc, cat) => {
    acc[cat] = skills.filter(s => s.category === cat);
    return acc;
  }, {});

  return (
    <div>
      <div className="admin-page-header">
        <h1>Skills</h1>
        <p>Manage your skills, categories, and competency levels.</p>
      </div>

      <div className="admin-card">
        <div className="admin-section-header">
          <h2><Code2 size={16} /> All Skills ({skills.length})</h2>
          <button className="btn-admin-primary" onClick={openAdd}><Plus size={15} /> Add Skill</button>
        </div>

        {saved && <p className="save-success" style={{ marginBottom: '1rem' }}><CheckCircle size={14} /> Changes saved!</p>}

        {Object.entries(grouped).filter(([, items]) => items.length > 0).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#55556a', marginBottom: '0.6rem' }}>
              {cat}
            </h3>
            <div className="admin-list" style={{ margin: 0 }}>
              {items.map(skill => {
                const comp = getCompetency(skill.level);
                return (
                  <div key={skill.id} className="admin-list-item">
                    <div className="list-item-info">
                      <h3>{skill.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                        <span className="badge" style={COMPETENCY_STYLE[comp.label]}>
                          {comp.label}
                        </span>
                      </div>
                    </div>
                    <div className="list-item-actions">
                      <button className="btn-admin-icon edit" onClick={() => openEdit(skill)} title="Edit"><Pencil size={14} /></button>
                      <button className="btn-admin-icon danger" onClick={() => { if (window.confirm('Are you sure you want to delete this skill?')) deleteSkill(skill.id); }} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {skills.length === 0 && (
          <div className="admin-empty"><Code2 size={32} /><p>No skills added yet.</p></div>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal.editing ? 'Edit Skill' : 'Add Skill'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="admin-form">
              <div className="form-group">
                <label>Skill Name</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Nmap" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Competency Status</label>
                <select 
                  value={getCompetency(form.level).label} 
                  onChange={e => {
                    const selected = COMPETENCY_MAP.find(c => c.label === e.target.value);
                    if (selected) {
                      setForm(f => ({ ...f, level: selected.value }));
                    }
                  }}
                >
                  {COMPETENCY_MAP.map(c => (
                    <option key={c.label} value={c.label}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-admin-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-admin-primary"><Save size={14} /> {modal.editing ? 'Update' : 'Add'} Skill</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsManager;
