import React, { useState } from 'react';
import { useData, type Project } from '../../contexts/DataContext';
import { Plus, Pencil, Trash2, Folder, X, Save, ExternalLink } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import '../admin-shared.css';

const empty = { title: '', category: '', description: '', githubLink: '', demoLink: '', thumbnail: '' };

const ProjectsManager = () => {
  const { data, addProject, updateProject, deleteProject } = useData();
  const [modal, setModal] = useState<{ open: boolean; editing: Project | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ ...empty });

  const projects = [...data.projects].sort((a, b) => a.order - b.order);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => { setForm({ ...empty }); setModal({ open: true, editing: null }); };
  const openEdit = (p: Project) => { setForm({ title: p.title, category: p.category, description: p.description, githubLink: p.githubLink, demoLink: p.demoLink, thumbnail: p.thumbnail }); setModal({ open: true, editing: p }); };
  const close = () => setModal({ open: false, editing: null });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal.editing) updateProject(modal.editing.id, form);
    else addProject(form);
    close();
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Projects</h1>
        <p>Manage your featured work and projects.</p>
      </div>

      <div className="admin-card">
        <div className="admin-section-header">
          <h2><Folder size={16} /> Projects ({projects.length})</h2>
          <button className="btn-admin-primary" onClick={openAdd}><Plus size={15} /> Add Project</button>
        </div>

        {projects.length === 0 ? (
          <div className="admin-empty"><Folder size={32} /><p>No projects added yet.</p></div>
        ) : (
          <div className="admin-list">
            {projects.map(proj => (
              <div key={proj.id} className="admin-list-item">
                <div className="list-item-info">
                  <h3>{proj.title}</h3>
                  <p style={{ marginBottom: '0.4rem' }}>{proj.description}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-info">{proj.category}</span>
                    {proj.githubLink && <span className="badge badge-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FaGithub size={10} /> GitHub</span>}
                    {proj.demoLink && <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ExternalLink size={10} /> Demo</span>}
                  </div>
                </div>
                <div className="list-item-actions">
                  <button className="btn-admin-icon edit" onClick={() => openEdit(proj)}><Pencil size={14} /></button>
                  <button className="btn-admin-icon danger" onClick={() => deleteProject(proj.id)}><Trash2 size={14} /></button>
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
              <h2>{modal.editing ? 'Edit Project' : 'Add Project'}</h2>
              <button className="modal-close" onClick={close}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Project Title</label>
                  <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="Network Traffic Analyzer" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input required value={form.category} onChange={e => set('category', e.target.value)} placeholder="Python Tool" />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>GitHub Link</label>
                  <input type="url" value={form.githubLink} onChange={e => set('githubLink', e.target.value)} placeholder="https://github.com/..." />
                </div>
                <div className="form-group">
                  <label>Live Demo Link</label>
                  <input type="url" value={form.demoLink} onChange={e => set('demoLink', e.target.value)} placeholder="https://..." />
                </div>
              </div>
              <div className="form-group">
                <label>Thumbnail URL (optional)</label>
                <input type="url" value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} placeholder="https://..." />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-admin-secondary" onClick={close}>Cancel</button>
                <button type="submit" className="btn-admin-primary"><Save size={14} /> {modal.editing ? 'Update' : 'Add'} Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsManager;
