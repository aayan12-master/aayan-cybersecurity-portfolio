import React, { useState } from 'react';
import { useData, type Certification } from '../../contexts/DataContext';
import { Plus, Pencil, Trash2, Award, X, Save, ExternalLink } from 'lucide-react';
import '../admin-shared.css';

const STATUSES = ['In Progress', 'Completed', 'Planned', 'Future Goal'];
const empty: Omit<Certification, 'id' | 'order'> = { title: '', issuer: '', issueDate: '', status: 'Planned', description: '', imageUrl: '', pdfUrl: '', verificationLink: '', credentialId: '' };

const CertificationsManager = () => {
  const { data, addCertification, updateCertification, deleteCertification } = useData();
  const [modal, setModal] = useState<{ open: boolean; editing: Certification | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ ...empty });

  const certs = [...data.certifications].sort((a, b) => a.order - b.order);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => { setForm({ ...empty }); setModal({ open: true, editing: null }); };
  const openEdit = (c: Certification) => {
    setForm({ title: c.title, issuer: c.issuer, issueDate: c.issueDate, status: c.status, description: c.description, imageUrl: c.imageUrl, pdfUrl: c.pdfUrl, verificationLink: c.verificationLink, credentialId: c.credentialId });
    setModal({ open: true, editing: c });
  };
  const close = () => setModal({ open: false, editing: null });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal.editing) updateCertification(modal.editing.id, form);
    else addCertification(form);
    close();
  };

  const statusColor: Record<string, string> = {
    'Completed': 'badge-success',
    'In Progress': 'badge-warning',
    'Planned': 'badge-info',
    'Future Goal': 'badge-muted',
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Certifications</h1>
        <p>Add, edit and delete certifications. The section hides automatically when empty.</p>
      </div>

      <div className="admin-card">
        <div className="admin-section-header">
          <h2><Award size={16} /> Certifications ({certs.length})</h2>
          <button className="btn-admin-primary" onClick={openAdd}><Plus size={15} /> Add Certification</button>
        </div>

        {certs.length === 0 ? (
          <div className="admin-empty"><Award size={32} /><p>No certifications yet. Add your first one!</p></div>
        ) : (
          <div className="admin-list">
            {certs.map(cert => (
              <div key={cert.id} className="admin-list-item">
                <div className="list-item-info">
                  <h3>{cert.title}</h3>
                  <p style={{ marginBottom: '0.4rem' }}>{cert.issuer} {cert.issueDate ? `· ${cert.issueDate}` : ''}</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className={`badge ${statusColor[cert.status] || 'badge-muted'}`}>{cert.status}</span>
                    {cert.verificationLink && <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ExternalLink size={10} /> Verify</span>}
                  </div>
                </div>
                <div className="list-item-actions">
                  <button className="btn-admin-icon edit" onClick={() => openEdit(cert)}><Pencil size={14} /></button>
                  <button className="btn-admin-icon danger" onClick={() => { if (window.confirm('Are you sure you want to delete this certification?')) deleteCertification(cert.id); }}><Trash2 size={14} /></button>
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
              <h2>{modal.editing ? 'Edit Certification' : 'Add Certification'}</h2>
              <button className="modal-close" onClick={close}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="admin-form">
              <div className="form-group">
                <label>Certification Title</label>
                <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="CompTIA Security+" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Issuing Organization</label>
                  <input value={form.issuer} onChange={e => set('issuer', e.target.value)} placeholder="CompTIA" />
                </div>
                <div className="form-group">
                  <label>Issue Date</label>
                  <input value={form.issueDate} onChange={e => set('issueDate', e.target.value)} placeholder="Jan 2026" />
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Credential ID</label>
                <input value={form.credentialId} onChange={e => set('credentialId', e.target.value)} placeholder="e.g. ABC123XYZ" />
              </div>
              <div className="form-group">
                <label>Verification Link</label>
                <input type="url" value={form.verificationLink} onChange={e => set('verificationLink', e.target.value)} placeholder="https://verify.credly.com/..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Certificate Image URL</label>
                  <input type="url" value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label>Certificate PDF URL</label>
                  <input type="url" value={form.pdfUrl} onChange={e => set('pdfUrl', e.target.value)} placeholder="https://..." />
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

export default CertificationsManager;
