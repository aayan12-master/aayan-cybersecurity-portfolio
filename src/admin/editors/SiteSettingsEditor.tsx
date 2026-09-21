import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Save, Settings, CheckCircle } from 'lucide-react';
import '../admin-shared.css';

const SiteSettingsEditor = () => {
  const { data, updateSiteSettings } = useData();
  const [form, setForm] = useState({ ...data.siteSettings });
  const [saved, setSaved] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Site Settings</h1>
        <p>Configure SEO, Open Graph, and analytics settings.</p>
      </div>

      <div className="admin-card">
        <h2><Settings size={16} /> SEO &amp; Meta</h2>
        <form onSubmit={handleSave} className="admin-form">
          <div className="form-group">
            <label>SEO Title</label>
            <input value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)}
              placeholder="Aayan G. Sayyad | Cyber Security Student & Enthusiast" />
            <span style={{ fontSize: '0.75rem', color: '#55556a' }}>Recommended: 50–60 characters</span>
          </div>

          <div className="form-group">
            <label>Meta Description</label>
            <textarea rows={3} value={form.metaDescription} onChange={e => set('metaDescription', e.target.value)}
              placeholder="Portfolio of Aayan G. Sayyad – Cyber Security Student from India." />
            <span style={{ fontSize: '0.75rem', color: '#55556a' }}>Recommended: 150–160 characters</span>
          </div>

          <div className="form-group">
            <label>Open Graph Image URL</label>
            <input type="url" value={form.ogImage} onChange={e => set('ogImage', e.target.value)}
              placeholder="https://yoursite.com/og-image.jpg" />
            <span style={{ fontSize: '0.75rem', color: '#55556a' }}>Recommended: 1200×630px</span>
          </div>

          <div className="form-group">
            <label>Google Analytics ID (optional)</label>
            <input value={form.analyticsId} onChange={e => set('analyticsId', e.target.value)}
              placeholder="G-XXXXXXXXXX" />
          </div>

          <div className="admin-save-bar">
            {saved && <span className="save-success"><CheckCircle size={15} /> Saved successfully!</span>}
            <button type="submit" className="btn-admin-primary" style={{ marginLeft: 'auto' }}>
              <Save size={15} /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteSettingsEditor;
