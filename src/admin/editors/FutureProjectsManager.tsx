import React, { useState } from 'react';
import { useData, type FutureProject } from '../../contexts/DataContext';
import { Plus, Pencil, Trash2, Rocket, X, Save } from 'lucide-react';
import '../admin-shared.css';

const STATUSES = ['Planned', 'In Design', 'In Development', 'Beta', 'Launched'];
const empty: Omit<FutureProject, 'id' | 'order'> = { title: '', description: '', status: 'Planned', progress: 0 };

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

  const statusColor: Record<string, string> = {
    'Planned': 'badge-muted', 'In Design': 'badge-info', 'In Development': 'badge-warning',
    'Beta': 'badge-success', 'Launched': 'badge-success'
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Future Projects</h1>
        <p>Showcase upcoming projects with progress and status.</p>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`badge ${statusColor[proj.status] || 'badge-muted'}`}>{proj.status}</span>
                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, maxWidth: 140 }}>
                      <div style={{ width: `${proj.progress}%`, height: '100%', background: '#7c6ff7', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#9090b0' }}>{proj.progress}%</span>
                  </div>
                </div>
                <div className="list-item-actions">
                  <button className="btn-admin-icon edit" onClick={() => openEdit(proj)}><Pencil size={14} /></button>
                  <button className="btn-admin-icon danger" onClick={() => deleteFutureProject(proj.id)}><Trash2 size={14} /></button>
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
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Progress: <strong style={{ color: '#7c6ff7' }}>{form.progress}%</strong></label>
                  <input type="range" min={0} max={100} value={form.progress}
                    onChange={e => set('progress', Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#7c6ff7', marginTop: '0.5rem' }} />
                </div>
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
