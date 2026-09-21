import React, { useState } from 'react';
import { useData, type FutureProject } from '../../contexts/DataContext';
import { Plus, Pencil, Trash2, Rocket, X, Save } from 'lucide-react';
import '../admin-shared.css';

const STAGES = ['Researching', 'Planning', 'Building', 'Testing', 'Launching'];

const STAGE_PROGRESS_MAP: Record<string, number> = {
  'Researching': 20,
  'Planning': 40,
  'Building': 60,
  'Testing': 80,
  'Launching': 100
};

const STAGE_STYLE: Record<string, React.CSSProperties> = {
  'Researching': { backgroundColor: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.2)' },
  'Planning': { backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#60a5fa', border: '1px solid rgba(56, 189, 248, 0.2)' },
  'Building': { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.2)' },
  'Testing': { backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.2)' },
  'Launching': { backgroundColor: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.2)' }
};

const empty: Omit<FutureProject, 'id' | 'order'> = { title: '', description: '', status: 'Researching', progress: 20 };

const FutureProjectsManager = () => {
  const { data, addFutureProject, updateFutureProject, deleteFutureProject } = useData();
  const [modal, setModal] = useState<{ open: boolean; editing: FutureProject | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ ...empty });

  const projects = [...data.futureProjects].sort((a, b) => a.order - b.order);
  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => { setForm({ ...empty }); setModal({ open: true, editing: null }); };
  const openEdit = (p: FutureProject) => {
    setForm({ title: p.title, description: p.description, status: p.status, progress: p.progress });
    setModal({ open: true, editing: p });
  };
  const close = () => setModal({ open: false, editing: null });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal.editing) updateFutureProject(modal.editing.id, form);
    else addFutureProject(form);
    close();
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Future Projects</h1>
        <p>Showcase upcoming projects with stages and status.</p>
      </div>

      <div className="admin-card">
        <div className="admin-section-header">
          <h2><Rocket size={16} /> Future Projects ({projects.length})</h2>
          <button className="btn-admin-primary" onClick={openAdd}><Plus size={15} /> Add Project</button>
        </div>

        {projects.length === 0 ? (
          <div className="admin-empty"><Rocket size={32} /><p>No future projects added yet.</p></div>
        ) : (
          <div className="admin-list">
            {projects.map(proj => (
              <div key={proj.id} className="admin-list-item">
                <div className="list-item-info">
                  <h3>{proj.title}</h3>
                  <p style={{ marginBottom: '0.5rem' }}>{proj.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge" style={STAGE_STYLE[proj.status] || STAGE_STYLE['Researching']}>
                      {proj.status}
                    </span>
                  </div>
                </div>
                <div className="list-item-actions">
                  <button className="btn-admin-icon edit" onClick={() => openEdit(proj)}><Pencil size={14} /></button>
                  <button className="btn-admin-icon danger" onClick={() => { if (window.confirm('Are you sure you want to delete this future project?')) deleteFutureProject(proj.id); }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal.open && (
        <div className="admin-modal-overlay" onClick={close}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal.editing ? 'Edit Future Project' : 'Add Future Project'}</h2>
              <button className="modal-close" onClick={close}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="admin-form">
              <div className="form-group">
                <label>Project Name</label>
                <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="Cyber Security Academy" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Project Stage</label>
                <select 
                  value={form.status} 
                  onChange={e => {
                    const stage = e.target.value;
                    setForm(f => ({ ...f, status: stage, progress: STAGE_PROGRESS_MAP[stage] || 20 }));
                  }}
                >
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-admin-secondary" onClick={close}>Cancel</button>
                <button type="submit" className="btn-admin-primary"><Save size={14} /> {modal.editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FutureProjectsManager;
