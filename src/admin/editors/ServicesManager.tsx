import React, { useState } from 'react';
import { useData, type Service } from '../../contexts/DataContext';
import { Plus, Pencil, Trash2, Shield, X, Save } from 'lucide-react';
import '../admin-shared.css';

const ICONS = ['Shield', 'Server', 'Bug', 'Lock', 'BookOpen', 'Terminal', 'Globe', 'Eye', 'Cpu', 'Database'];
const empty = {
  title: '',
  description: '',
  iconName: 'Shield',
  ctaText: 'Learn More',
  actionType: 'inquiry' as 'inquiry' | 'external' | 'coming_soon',
  inquirySubject: '',
  externalUrl: ''
};

const ServicesManager = () => {
  const { data, addService, updateService, deleteService } = useData();
  const [modal, setModal] = useState<{ open: boolean; editing: Service | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ ...empty });

  const services = [...data.services].sort((a, b) => a.order - b.order);

  const openAdd = () => { setForm({ ...empty }); setModal({ open: true, editing: null }); };
  const openEdit = (s: Service) => {
    setForm({
      title: s.title,
      description: s.description,
      iconName: s.iconName,
      ctaText: s.ctaText || 'Learn More',
      actionType: s.actionType || 'inquiry',
      inquirySubject: s.inquirySubject || '',
      externalUrl: s.externalUrl || ''
    });
    setModal({ open: true, editing: s });
  };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal.editing) { updateService(modal.editing.id, form); }
    else { addService(form); }
    closeModal();
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Services</h1>
        <p>Manage the services you offer displayed on your portfolio.</p>
      </div>

      <div className="admin-card">
        <div className="admin-section-header">
          <h2><Shield size={16} /> Services ({services.length})</h2>
          <button className="btn-admin-primary" onClick={openAdd}><Plus size={15} /> Add Service</button>
        </div>

        {services.length === 0 ? (
          <div className="admin-empty"><Shield size={32} /><p>No services added yet.</p></div>
        ) : (
          <div className="admin-list">
            {services.map(service => (
              <div key={service.id} className="admin-list-item">
                <div className="list-item-info">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-muted">{service.iconName}</span>
                  <div className="list-item-actions">
                    <button className="btn-admin-icon edit" onClick={() => openEdit(service)} title="Edit"><Pencil size={14} /></button>
                    <button className="btn-admin-icon danger" onClick={() => deleteService(service.id)} title="Delete"><Trash2 size={14} /></button>
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
              <h2>{modal.editing ? 'Edit Service' : 'Add Service'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="admin-form">
              <div className="form-group">
                <label>Service Title</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Network Security" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Icon</label>
                <select value={form.iconName} onChange={e => setForm(f => ({ ...f, iconName: e.target.value }))}>
                  {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>CTA Text</label>
                <input required value={form.ctaText} onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} placeholder="e.g. Learn More" />
              </div>
              <div className="form-group">
                <label>Action Type</label>
                <select value={form.actionType} onChange={e => setForm(f => ({ ...f, actionType: e.target.value as any }))}>
                  <option value="inquiry">Contact Inquiry</option>
                  <option value="external">External Link</option>
                  <option value="coming_soon">Coming Soon</option>
                </select>
              </div>
              {form.actionType === 'inquiry' && (
                <div className="form-group">
                  <label>Inquiry Subject</label>
                  <input required value={form.inquirySubject} onChange={e => setForm(f => ({ ...f, inquirySubject: e.target.value }))} placeholder="e.g. Inquiry: Network Security" />
                </div>
              )}
              {form.actionType === 'external' && (
                <div className="form-group">
                  <label>External URL</label>
                  <input type="url" required value={form.externalUrl} onChange={e => setForm(f => ({ ...f, externalUrl: e.target.value }))} placeholder="https://example.com" />
                </div>
              )}
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

export default ServicesManager;
