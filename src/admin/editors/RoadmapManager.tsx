import React, { useState } from 'react';
import { useData, type RoadmapItem } from '../../contexts/DataContext';
import { Plus, Pencil, Trash2, Map, X, Save, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import '../admin-shared.css';

const empty: Omit<RoadmapItem, 'id' | 'order'> = { year: '', title: '', description: '', status: 'planned' };

const statusInfo = {
  'completed': { label: 'Completed', badgeClass: 'badge-success', icon: CheckCircle },
  'in-progress': { label: 'In Progress', badgeClass: 'badge-warning', icon: TrendingUp },
  'planned': { label: 'Planned', badgeClass: 'badge-info', icon: Clock },
};

const RoadmapManager = () => {
  const { data, addRoadmapItem, updateRoadmapItem, deleteRoadmapItem } = useData();
  const [modal, setModal] = useState<{ open: boolean; editing: RoadmapItem | null }>({ open: false, editing: null });
  const [form, setForm] = useState<Omit<RoadmapItem, 'id' | 'order'>>({ ...empty });

  const items = [...data.roadmap].sort((a, b) => a.order - b.order);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => { setForm({ ...empty }); setModal({ open: true, editing: null }); };
  const openEdit = (r: RoadmapItem) => {
    setForm({ year: r.year, title: r.title, description: r.description, status: r.status });
    setModal({ open: true, editing: r });
  };
  const close = () => setModal({ open: false, editing: null });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal.editing) updateRoadmapItem(modal.editing.id, form);
    else addRoadmapItem(form);
    close();
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Learning Roadmap</h1>
        <p>Manage your learning milestones and timeline.</p>
      </div>

      <div className="admin-card">
        <div className="admin-section-header">
          <h2><Map size={16} /> Roadmap Items ({items.length})</h2>
          <button className="btn-admin-primary" onClick={openAdd}><Plus size={15} /> Add Milestone</button>
        </div>

        {items.length === 0 ? (
          <div className="admin-empty"><Map size={32} /><p>No roadmap items yet.</p></div>
        ) : (
          <div className="admin-list">
            {items.map(item => {
              const si = statusInfo[item.status];
              const Icon = si.icon;
              return (
                <div key={item.id} className="admin-list-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginRight: '0.75rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={15} style={{ color: item.status === 'completed' ? '#4ade80' : item.status === 'in-progress' ? '#fbbf24' : '#60a5fa' }} />
                    </div>
                  </div>
                  <div className="list-item-info">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                      <span className="badge badge-muted">{item.year}</span>
                      <span className={`badge ${si.badgeClass}`}>{si.label}</span>
                    </div>
                  </div>
                  <div className="list-item-actions">
                    <button className="btn-admin-icon edit" onClick={() => openEdit(item)}><Pencil size={14} /></button>
                    <button className="btn-admin-icon danger" onClick={() => deleteRoadmapItem(item.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal.open && (
        <div className="admin-modal-overlay" onClick={close}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal.editing ? 'Edit Milestone' : 'Add Milestone'}</h2>
              <button className="modal-close" onClick={close}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="B.Sc. Computer Science" />
                </div>
                <div className="form-group">
                  <label>Year / Date Label</label>
                  <input value={form.year} onChange={e => set('year', e.target.value)} placeholder="2023 - 2026" />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="planned">Planned</option>
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

export default RoadmapManager;
